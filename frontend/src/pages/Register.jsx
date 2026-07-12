import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Mail, Lock, User, Phone, MapPin, Award, Building2, Store, ArrowRight } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const { showNotification } = useNotification();
  const [role, setRole] = useState('restaurant'); // default role
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    registrationNumber: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, phone, address, registrationNumber } = formData;

    if (!name || !email || !password || !phone || !address) {
      showNotification('Please fill in all required fields', 'warning');
      return;
    }

    if (role === 'ngo' && !registrationNumber) {
      showNotification('NGO registration number is required', 'warning');
      return;
    }

    setIsSubmitting(true);
    const result = await register({
      role,
      name,
      email,
      password,
      phone,
      address,
      registrationNumber: role === 'ngo' ? registrationNumber : undefined,
    });
    setIsSubmitting(false);

    if (result.success) {
      showNotification('Registration successful! Welcome.', 'success');
      navigate(role === 'restaurant' ? '/restaurant-dashboard' : '/ngo-dashboard');
    } else {
      showNotification(result.message || 'Registration failed', 'error');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 transition-colors duration-200">
      
      {/* Decorative Blobs */}
      <div className="absolute top-1/4 right-1/3 h-96 w-96 rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/3 h-96 w-96 rounded-full bg-secondary/5 blur-3xl pointer-events-none"></div>

      <div className="relative w-full max-w-lg animate-fade-in">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white">Create your account</h2>
          <p className="text-sm text-slate-500 mt-1.5 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary hover:text-primary-hover hover:underline transition-all">
              Sign in
            </Link>
          </p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-xl border border-white/50 dark:border-white/5">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Role Switcher */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Join As
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('restaurant')}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-3.5 text-sm font-bold transition-all duration-200 ${
                    role === 'restaurant'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/60'
                  }`}
                >
                  <Store className="h-4.5 w-4.5" />
                  Restaurant / Donor
                </button>
                <button
                  type="button"
                  onClick={() => setRole('ngo')}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-3.5 text-sm font-bold transition-all duration-200 ${
                    role === 'ngo'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/60'
                  }`}
                >
                  <Building2 className="h-4.5 w-4.5" />
                  NGO / Volunteer
                </button>
              </div>
            </div>

            {/* Business/Org Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {role === 'restaurant' ? 'Business Name' : 'Organization Name'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <User className="h-5 w-5" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder={role === 'restaurant' ? 'e.g. Grand Buffet Cafe' : 'e.g. Feed the Hungry Foundation'}
                  className="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm"
                />
              </div>
            </div>

            {/* Email & Phone grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="contact@email.com"
                    className="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Phone className="h-5 w-5" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 000-0000"
                    className="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Pickup / Operating Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <MapPin className="h-5 w-5" />
                </div>
                <input
                  id="address"
                  name="address"
                  type="text"
                  required
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="123 Main St, Cityville"
                  className="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm"
                />
              </div>
            </div>

            {/* Registration Number (NGO Only) */}
            {role === 'ngo' && (
              <div className="animate-slide-up">
                <label htmlFor="registrationNumber" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  NGO Registration Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Award className="h-5 w-5" />
                  </div>
                  <input
                    id="registrationNumber"
                    name="registrationNumber"
                    type="text"
                    required
                    value={formData.registrationNumber}
                    onChange={handleInputChange}
                    placeholder="e.g. NGO-98765-AX"
                    className="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover py-3 text-base font-semibold text-white shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-200 disabled:opacity-70 disabled:pointer-events-none mt-2"
            >
              {isSubmitting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  Register
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Register;
