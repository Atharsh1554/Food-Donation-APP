import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { User, Mail, Phone, MapPin, Award, Building2, Store } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { showNotification } = useNotification();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    registrationNumber: user?.registrationNumber || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate updating API
    const result = await updateProfile(formData);
    setIsSubmitting(false);

    if (result.success) {
      showNotification('Profile updated successfully', 'success');
    } else {
      showNotification('Failed to update profile', 'error');
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">Account Profile</h1>
        <p className="text-slate-500 mt-1.5">View and update your registration profile information.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: User Status Badge */}
        <div className="md:col-span-1 space-y-6">
          <div className="glass-card rounded-3xl p-6 text-center border border-white/50 dark:border-white/5 shadow-md flex flex-col items-center">
            
            <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 shadow-inner">
              {user.role === 'restaurant' ? (
                <Store className="h-10 w-10" />
              ) : (
                <Building2 className="h-10 w-10" />
              )}
            </div>

            <h3 className="font-bold text-lg text-slate-850 dark:text-white truncate max-w-full">{user.name}</h3>
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary mt-2 uppercase tracking-wide">
              {user.role}
            </span>

            <div className="border-t border-slate-100 dark:border-slate-800 w-full mt-6 pt-4 text-left text-xs text-slate-500 space-y-2">
              <p>Joined FoodShare: <span className="font-bold text-slate-750 dark:text-slate-350">{new Date(user.createdAt || Date.now()).toLocaleDateString()}</span></p>
              <p>Status: <span className="font-bold text-emerald-600">Active</span></p>
            </div>

          </div>
        </div>

        {/* Right Column: Editing Form */}
        <div className="md:col-span-2">
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/50 dark:border-white/5 shadow-md">
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {user.role === 'restaurant' ? 'Business Name' : 'Organization Name'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    {user.role === 'restaurant' ? <Store className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
                  </div>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address (Unchangeable)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    disabled
                    value={formData.email}
                    className="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-500 text-sm cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Phone className="h-5 w-5" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm"
                    />
                  </div>
                </div>

                {user.role === 'ngo' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      NGO Registration Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <Award className="h-5 w-5" />
                      </div>
                      <input
                        type="text"
                        name="registrationNumber"
                        required
                        value={formData.registrationNumber}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pickup / Operating Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-xl bg-primary hover:bg-primary-hover px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-primary/10 transition-colors duration-200 mt-2"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>

            </form>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Profile;
