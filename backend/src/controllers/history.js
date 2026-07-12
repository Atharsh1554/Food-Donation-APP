const db = require('../config/db');

const getRestaurantHistory = async (req, res) => {
  try {
    if (req.user.role !== 'restaurant') {
      return res.status(403).json({ message: 'Only restaurants can access restaurant history' });
    }

    const donations = await db.donations.list();
    const history = donations.filter(d => d.restaurantId === req.user.userId);
    
    // Sort by creation date descending
    history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(history);
  } catch (error) {
    console.error('Restaurant History Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getNgoHistory = async (req, res) => {
  try {
    if (req.user.role !== 'ngo') {
      return res.status(403).json({ message: 'Only NGOs can access NGO history' });
    }

    const donations = await db.donations.list();
    const history = donations.filter(d => d.ngoId === req.user.userId);

    // Sort by newest reservation or collection date
    history.sort((a, b) => {
      const dateA = a.collectedAt || a.reservedAt || a.createdAt;
      const dateB = b.collectedAt || b.reservedAt || b.createdAt;
      return new Date(dateB) - new Date(dateA);
    });

    res.json(history);
  } catch (error) {
    console.error('NGO History Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  getRestaurantHistory,
  getNgoHistory
};
