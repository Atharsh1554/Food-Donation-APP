const { randomUUID: uuidv4 } = require('crypto');
const db = require('../config/db');

// Calculate distance (Haversine Formula) - for location/distance filters
// Since we might not have real GPS locations, we'll calculate between NGO coordinate and donation coordinate
// Or return a mock value if inputs are missing.
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return Math.floor(Math.random() * 5) + 1; // Return mock 1-5km distance
  
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return Math.round(d * 10) / 10;
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

const createDonation = async (req, res) => {
  try {
    if (req.user.role !== 'restaurant') {
      return res.status(403).json({ message: 'Only restaurants can create donations' });
    }

    const {
      foodName,
      category,
      description,
      quantity,
      pickupAddress,
      latitude,
      longitude,
      pickupTime,
      expiryTime,
      imageUrl,
      contactNumber
    } = req.body;

    if (!foodName || !category || !quantity || !pickupAddress || !pickupTime || !expiryTime) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    const newDonation = {
      donationId: uuidv4(),
      restaurantId: req.user.userId,
      restaurantName: req.user.name,
      foodName,
      category,
      description: description || '',
      quantity,
      imageUrl: imageUrl || '',
      pickupAddress,
      latitude: latitude ? parseFloat(latitude) : 0,
      longitude: longitude ? parseFloat(longitude) : 0,
      pickupTime,
      expiryTime,
      contactNumber: contactNumber || req.user.phone || '',
      status: 'available',
      ngoId: null,
      createdAt: new Date().toISOString()
    };

    await db.donations.create(newDonation);
    res.status(201).json(newDonation);
  } catch (error) {
    console.error('Create Donation Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getDonations = async (req, res) => {
  try {
    let donations = await db.donations.list();
    
    // Extract query parameters for filters
    const { category, minQuantity, maxDistance, status, search, userLat, userLon } = req.query;

    // Default: for general browsing, NGO only sees 'available' unless specified
    let filtered = donations;

    if (status) {
      filtered = filtered.filter(d => d.status === status);
    } else if (req.user.role === 'ngo') {
      // NGOs browse available donations by default
      filtered = filtered.filter(d => d.status === 'available');
    }

    // Apply category filter
    if (category) {
      filtered = filtered.filter(d => d.category.toLowerCase() === category.toLowerCase());
    }

    // Apply quantity filter (assuming quantity has numbers like "5 kg", "10 boxes", "15 packs")
    if (minQuantity) {
      const minVal = parseFloat(minQuantity);
      filtered = filtered.filter(d => {
        const match = d.quantity.match(/(\d+)/);
        if (match) {
          return parseFloat(match[1]) >= minVal;
        }
        return true;
      });
    }

    // Calculate distance and filter
    filtered = filtered.map(d => {
      const dist = calculateDistance(
        userLat ? parseFloat(userLat) : null,
        userLon ? parseFloat(userLon) : null,
        d.latitude,
        d.longitude
      );
      return { ...d, distance: dist };
    });

    if (maxDistance) {
      const maxVal = parseFloat(maxDistance);
      filtered = filtered.filter(d => d.distance <= maxVal);
    }

    // Live search
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(d => 
        d.foodName.toLowerCase().includes(s) || 
        (d.restaurantName && d.restaurantName.toLowerCase().includes(s)) ||
        d.pickupAddress.toLowerCase().includes(s)
      );
    }

    // Expiry check - Filter out expired donations if not collected/reserved (optional but nice)
    const now = new Date();
    filtered = filtered.filter(d => d.status !== 'available' || new Date(d.expiryTime) > now);

    // Sort by newest first
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(filtered);
  } catch (error) {
    console.error('Get Donations Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getDonationById = async (req, res) => {
  try {
    const donation = await db.donations.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    
    // Add distance calculation if user location coordinates are present
    const { userLat, userLon } = req.query;
    donation.distance = calculateDistance(
      userLat ? parseFloat(userLat) : null,
      userLon ? parseFloat(userLon) : null,
      donation.latitude,
      donation.longitude
    );

    res.json(donation);
  } catch (error) {
    console.error('Get Donation ID Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const updateDonation = async (req, res) => {
  try {
    const donation = await db.donations.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    if (donation.restaurantId !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized to update this donation' });
    }

    if (donation.status !== 'available') {
      return res.status(400).json({ message: 'Cannot update a donation that is already reserved or collected' });
    }

    const {
      foodName,
      category,
      description,
      quantity,
      pickupAddress,
      latitude,
      longitude,
      pickupTime,
      expiryTime,
      imageUrl,
      contactNumber
    } = req.body;

    const updates = {
      foodName: foodName || donation.foodName,
      category: category || donation.category,
      description: description !== undefined ? description : donation.description,
      quantity: quantity || donation.quantity,
      pickupAddress: pickupAddress || donation.pickupAddress,
      latitude: latitude ? parseFloat(latitude) : donation.latitude,
      longitude: longitude ? parseFloat(longitude) : donation.longitude,
      pickupTime: pickupTime || donation.pickupTime,
      expiryTime: expiryTime || donation.expiryTime,
      imageUrl: imageUrl || donation.imageUrl,
      contactNumber: contactNumber || donation.contactNumber,
      updatedAt: new Date().toISOString()
    };

    const updated = await db.donations.update(req.params.id, updates);
    res.json(updated);
  } catch (error) {
    console.error('Update Donation Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const deleteDonation = async (req, res) => {
  try {
    const donation = await db.donations.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    if (donation.restaurantId !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized to delete this donation' });
    }

    await db.donations.delete(req.params.id);
    res.json({ message: 'Donation deleted successfully' });
  } catch (error) {
    console.error('Delete Donation Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const reserveDonation = async (req, res) => {
  try {
    if (req.user.role !== 'ngo') {
      return res.status(403).json({ message: 'Only NGOs can reserve donations' });
    }

    const donation = await db.donations.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    if (donation.status !== 'available') {
      return res.status(400).json({ message: 'Donation is not available for reservation' });
    }

    // Check expiry
    if (new Date(donation.expiryTime) < new Date()) {
      return res.status(400).json({ message: 'Donation has expired' });
    }

    const updates = {
      status: 'reserved',
      ngoId: req.user.userId,
      ngoName: req.user.name,
      reservedAt: new Date().toISOString()
    };

    const updated = await db.donations.update(req.params.id, updates);
    
    // In a real system, send email notification to restaurant here.
    console.log(`Notification: Donation ${donation.foodName} reserved by NGO ${req.user.name}`);
    
    res.json(updated);
  } catch (error) {
    console.error('Reserve Donation Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const collectDonation = async (req, res) => {
  try {
    const donation = await db.donations.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // NGO who reserved it can mark as collected, or the owning restaurant
    const isNGO = req.user.role === 'ngo' && donation.ngoId === req.user.userId;
    const isRestaurant = req.user.role === 'restaurant' && donation.restaurantId === req.user.userId;

    if (!isNGO && !isRestaurant) {
      return res.status(403).json({ message: 'Unauthorized to mark this donation as collected' });
    }

    if (donation.status !== 'reserved') {
      return res.status(400).json({ message: 'Only reserved donations can be marked as collected' });
    }

    const updates = {
      status: 'collected',
      collectedAt: new Date().toISOString()
    };

    const updated = await db.donations.update(req.params.id, updates);
    res.json(updated);
  } catch (error) {
    console.error('Collect Donation Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  createDonation,
  getDonations,
  getDonationById,
  updateDonation,
  deleteDonation,
  reserveDonation,
  collectDonation
};
