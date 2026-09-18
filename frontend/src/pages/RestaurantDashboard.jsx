import React, { useState, useEffect, useRef } from 'react';
import { useAuth, api } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { 
  Plus, Calendar, MapPin, Trash2, Edit3, Image, 
  Sparkles, CheckCircle2, ShoppingBag, X, Phone, Upload, Info
} from 'lucide-react';

const RestaurantDashboard = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDonation, setEditingDonation] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [donationToDelete, setDonationToDelete] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    foodName: '',
    category: 'Vegetarian',
    description: '',
    quantity: '',
    pickupAddress: '',
    pickupTime: '',
    expiryTime: '',
    contactNumber: '',
    specialInstructions: '',
  });

  // Image Upload State
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/restaurant/history');
      setDonations(response.data);
    } catch (error) {
      console.error('Failed to load donations:', error);
      showNotification('Failed to load donation history', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Image Preview and client S3 Upload Flow
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadFile = async (file) => {
    try {
      setIsUploadingImage(true);
      // Step 1: Request presigned url or local upload configuration from backend
      const response = await api.get('/s3-presigned-url', {
        params: { fileName: file.name, fileType: file.type }
      });

      const { uploadUrl, imageUrl, mode } = response.data;

      // Step 2: Upload image file directly
      if (mode === 'aws') {
        const s3Response = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file
        });
        if (!s3Response.ok) {
          throw new Error(`S3 upload failed with status ${s3Response.status}`);
        }
        return imageUrl;
      } else {
        // Fallback to Data URL for client upload persistence
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      }
    } catch (error) {
      console.error('Image upload failed, using Data URL:', error);
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result || imagePreview);
        reader.readAsDataURL(file);
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const formatDateForInput = (dateVal) => {
    if (!dateVal) return '';
    if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
      return dateVal;
    }
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return '';
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (e) {
      return '';
    }
  };

  const openAddForm = () => {
    const todayStr = formatDateForInput(new Date());
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = formatDateForInput(tomorrow);

    setEditingDonation(null);
    setFormData({
      foodName: '',
      category: 'Vegetarian',
      description: '',
      quantity: '',
      pickupAddress: user?.address || '',
      pickupTime: todayStr,
      expiryTime: tomorrowStr,
      contactNumber: user?.phone || '',
      specialInstructions: '',
    });
    setImageFile(null);
    setImagePreview('');
    setIsFormOpen(true);
  };

  const openEditForm = (donation) => {
    setEditingDonation(donation);
    setFormData({
      foodName: donation.foodName || '',
      category: donation.category || 'Vegetarian',
      description: donation.description || '',
      quantity: donation.quantity || '',
      pickupAddress: donation.pickupAddress || '',
      pickupTime: formatDateForInput(donation.pickupTime),
      expiryTime: formatDateForInput(donation.expiryTime),
      contactNumber: donation.contactNumber || '',
      specialInstructions: donation.specialInstructions || '',
    });
    setImageFile(null);
    setImagePreview(donation.imageUrl || '');
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let finalImageUrl = imagePreview;

      // If new file is chosen, upload it first
      if (imageFile) {
        finalImageUrl = await uploadFile(imageFile);
      }

      const body = {
        ...formData,
        imageUrl: finalImageUrl,
      };

      if (editingDonation) {
        await api.put(`/donations/${editingDonation.donationId}`, body);
        showNotification('Donation updated successfully', 'success');
      } else {
        await api.post('/donations', body);
        showNotification('Donation created successfully', 'success');
      }

      setIsFormOpen(false);
      fetchHistory();
    } catch (error) {
      console.error('Submission failed:', error);
      showNotification('Failed to submit donation', 'error');
    }
  };

  const triggerDelete = (donation) => {
    setDonationToDelete(donation);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!donationToDelete) return;
    try {
      await api.delete(`/donations/${donationToDelete.donationId}`);
      showNotification('Donation deleted successfully', 'success');
      setIsDeleteModalOpen(false);
      setDonationToDelete(null);
      fetchHistory();
    } catch (error) {
      console.error('Failed to delete donation:', error);
      showNotification('Failed to delete donation', 'error');
    }
  };

  // Stats calculation
  const totalCreated = donations.length;
  const activeCreated = donations.filter(d => d.status === 'available').length;
  const reservedCreated = donations.filter(d => d.status === 'reserved').length;
  const collectedCreated = donations.filter(d => d.status === 'collected').length;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">Restaurant Dashboard</h1>
          <p className="text-slate-500 mt-1.5">Manage your surplus donations and track their statuses.</p>
        </div>
        <button
          onClick={openAddForm}
          className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-200"
        >
          <Plus className="h-5 w-5" />
          Add New Donation
        </button>
      </div>

      {/* Analytics widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-10">
        <div className="glass-card rounded-2xl p-5 border border-white/50 dark:border-white/5">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Donations</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white mt-2">{totalCreated}</p>
        </div>
        <div className="glass-card rounded-2xl p-5 border border-white/50 dark:border-white/5">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active (Available)</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">{activeCreated}</p>
        </div>
        <div className="glass-card rounded-2xl p-5 border border-white/50 dark:border-white/5">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Reserved</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-orange-600 dark:text-orange-400 mt-2">{reservedCreated}</p>
        </div>
        <div className="glass-card rounded-2xl p-5 border border-white/50 dark:border-white/5">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Collected</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">{collectedCreated}</p>
        </div>
      </div>

      {/* Main donations grid list */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="animate-pulse glass-card rounded-2xl h-80"></div>
          ))}
        </div>
      ) : donations.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center border border-white/50 dark:border-white/5 max-w-lg mx-auto mt-10">
          <ShoppingBag className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Donations Yet</h3>
          <p className="text-slate-500 text-sm mt-2 mb-6">Start sharing surplus foods and reduce waste in your community.</p>
          <button
            onClick={openAddForm}
            className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/10 transition-colors"
          >
            Create Your First Donation
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donations.map((donation) => (
            <div 
              key={donation.donationId} 
              className="glass-card rounded-2xl overflow-hidden border border-white/50 dark:border-white/5 hover:shadow-lg transition-all duration-200 flex flex-col"
            >
              <div className="relative h-44 bg-slate-100 dark:bg-slate-900">
                {donation.imageUrl && (
                  <img 
                    src={donation.imageUrl} 
                    alt={donation.foodName}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const fallback = e.target.parentElement.querySelector('.img-fallback');
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                )}
                <div className={`img-fallback h-full w-full items-center justify-center text-slate-400 ${donation.imageUrl ? 'hidden' : 'flex'}`}>
                  <Image className="h-10 w-10 stroke-[1.5]" />
                </div>
                
                {/* Status Badges */}
                <span className={`absolute top-3 right-3 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm backdrop-blur-md ${
                  donation.status === 'available' 
                    ? 'bg-emerald-100/90 text-emerald-800 dark:bg-emerald-950/90 dark:text-emerald-300' 
                    : donation.status === 'reserved'
                    ? 'bg-orange-100/90 text-orange-800 dark:bg-orange-950/90 dark:text-orange-300'
                    : 'bg-slate-200/90 text-slate-700 dark:bg-slate-800/90 dark:text-slate-300'
                }`}>
                  {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white truncate">{donation.foodName}</h3>
                    <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-semibold shrink-0">
                      {donation.quantity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                    {donation.description || 'No description provided.'}
                  </p>
                </div>

                <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{donation.pickupAddress}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span>Expiry Date: {new Date(donation.expiryTime).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Edit / Delete triggers */}
                {donation.status === 'available' && (
                  <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => openEditForm(donation)}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => triggerDelete(donation)}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-red-200 dark:border-red-950/20 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                )}
                {donation.status === 'reserved' && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center text-xs font-semibold text-orange-600 dark:text-orange-400">
                    Reserved by: {donation.ngoName || 'NGO Partner'}
                  </div>
                )}
                {donation.status === 'collected' && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center text-xs font-semibold text-slate-400 flex items-center justify-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    Collected successfully
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Side Panel slide-over (Create/Edit Donation Form) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 h-full overflow-y-auto shadow-2xl p-6 sm:p-8 animate-fade-in relative">
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
              {editingDonation ? 'Edit Donation' : 'Create Donation'}
            </h2>
            <p className="text-sm text-slate-500 mb-6">Fill in information to submit surplus food details.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Food Item Name
                </label>
                <input
                  type="text"
                  name="foodName"
                  required
                  value={formData.foodName}
                  onChange={handleInputChange}
                  placeholder="e.g. Tomato Soup, Baked Pasta"
                  className="block w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                  >
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Non-Vegetarian">Non-Vegetarian</option>
                    <option value="Baked Goods">Baked Goods</option>
                    <option value="Dairy/Fruit">Dairy / Fruit</option>
                    <option value="Prepared Meals">Prepared Meals</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Quantity
                  </label>
                  <input
                    type="text"
                    name="quantity"
                    required
                    value={formData.quantity}
                    onChange={handleInputChange}
                    placeholder="e.g. 5 kg, 20 boxes"
                    className="block w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Provide ingredients, allergen notices, packaging types..."
                  className="block w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm"
                />
              </div>

              {/* Time inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Prep Date
                  </label>
                  <input
                    type="date"
                    name="pickupTime"
                    required
                    value={formData.pickupTime}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    name="expiryTime"
                    required
                    value={formData.expiryTime}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pickup Address
                </label>
                <input
                  type="text"
                  name="pickupAddress"
                  required
                  value={formData.pickupAddress}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Contact Number
                </label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm"
                />
              </div>

              {/* Image upload widget with Preview */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Food Image
                </label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors flex flex-col items-center justify-center min-h-32"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageChange} 
                    accept="image/*" 
                    className="hidden" 
                  />
                  {imagePreview ? (
                    <div className="relative w-full max-h-40 overflow-hidden rounded-lg">
                      <img 
                        src={imagePreview.startsWith('data:') || imagePreview.startsWith('http') ? imagePreview : `http://localhost:5000${imagePreview}`} 
                        alt="Preview" 
                        className="w-full h-full object-cover mx-auto"
                      />
                      <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded">Change Image</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-slate-400 mb-2" />
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Click to upload food image</p>
                      <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, or WEBP up to 5MB</p>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Special Instructions (Optional)
                </label>
                <input
                  type="text"
                  name="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={handleInputChange}
                  placeholder="e.g. Bring own container, Park at rear entrance"
                  className="block w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={isUploadingImage}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all duration-200 mt-6"
              >
                {isUploadingImage ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Uploading Image...
                  </>
                ) : (
                  editingDonation ? 'Update Donation' : 'Submit Donation'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card rounded-3xl max-w-md w-full p-6 animate-fade-in border border-white/50 dark:border-white/5 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Delete Donation</h3>
            <p className="text-sm text-slate-500 mb-6">Are you sure you want to delete this donation? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="rounded-xl bg-red-600 hover:bg-red-700 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-red-600/10 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default RestaurantDashboard;
