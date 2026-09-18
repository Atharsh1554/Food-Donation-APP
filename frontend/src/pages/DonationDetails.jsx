import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { 
  ArrowLeft, MapPin, Calendar, Clock, Phone, User, 
  ChevronRight, Heart, ShieldAlert, CheckCircle2, Image
} from 'lucide-react';

const DonationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);

  useEffect(() => {
    fetchDonationDetails();
  }, [id]);

  const fetchDonationDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/donations/${id}`);
      setDonation(response.data);
    } catch (error) {
      console.error('Failed to load donation details:', error);
      showNotification('Failed to load donation details', 'error');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'ngo') {
      showNotification('Only NGOs can reserve donations', 'warning');
      return;
    }

    try {
      setReserving(true);
      await api.post(`/donations/${id}/reserve`);
      showNotification('Donation reserved successfully!', 'success');
      fetchDonationDetails();
    } catch (error) {
      console.error('Reservation failed:', error);
      showNotification('Failed to reserve donation', 'error');
    } finally {
      setReserving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!donation) return null;

  const expiryDateObj = donation.expiryTime ? (donation.expiryTime.includes('T') ? new Date(donation.expiryTime) : new Date(`${donation.expiryTime}T23:59:59`)) : new Date();
  const isExpired = expiryDateObj < new Date();

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-950 dark:hover:text-white font-semibold mb-6 transition-colors"
      >
        <ArrowLeft className="h-4.5 w-4.5" />
        Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Main Details (Col 2/3) */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Main Photo Card */}
          <div className="glass-card rounded-3xl overflow-hidden border border-white/50 dark:border-white/5 shadow-lg bg-slate-100 dark:bg-slate-900 aspect-video relative">
            {donation.imageUrl ? (
              <img 
                src={donation.imageUrl} 
                alt={donation.foodName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-400">
                <Image className="h-16 w-16 stroke-[1.5]" />
              </div>
            )}
            
            {/* Status Badges */}
            <span className={`absolute top-4 left-4 inline-flex items-center rounded-full px-3.5 py-1 text-xs font-bold shadow-sm backdrop-blur-md ${
              donation.status === 'available' 
                ? 'bg-emerald-100/90 text-emerald-800 dark:bg-emerald-950/90 dark:text-emerald-300' 
                : donation.status === 'reserved'
                ? 'bg-orange-100/90 text-orange-800 dark:bg-orange-950/90 dark:text-orange-300'
                : 'bg-slate-200/90 text-slate-700 dark:bg-slate-800/90 dark:text-slate-300'
            }`}>
              {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
            </span>
          </div>

          {/* Core Info */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/50 dark:border-white/5 space-y-6">
            <div>
              <div className="flex justify-between items-start gap-4 mb-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white leading-tight">
                  {donation.foodName}
                </h1>
                <span className="text-sm bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full font-bold text-slate-700 dark:text-slate-350 shrink-0">
                  {donation.quantity}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-semibold mb-4">Category: {donation.category}</p>
              
              <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-2">Description</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                {donation.description || 'No detailed description provided.'}
              </p>
            </div>

            {donation.specialInstructions && (
              <div className="rounded-2xl border border-amber-100 dark:border-amber-950/30 bg-amber-50/50 dark:bg-amber-950/10 p-4">
                <h4 className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 mb-1">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  Special Pickup Instructions
                </h4>
                <p className="text-xs text-amber-700 dark:text-amber-400">{donation.specialInstructions}</p>
              </div>
            )}

            {/* Simulated pickup location maps */}
            <div>
              <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-3">Pickup Location Map</h3>
              <div className="h-48 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl overflow-hidden relative border border-slate-150 dark:border-slate-850">
                {/* Visual mockup of Google Maps Grid */}
                <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800/80 grid grid-cols-6 grid-rows-6 opacity-30 pointer-events-none">
                  {[...Array(36)].map((_, i) => (
                    <div key={i} className="border-[0.5px] border-slate-300 dark:border-slate-700"></div>
                  ))}
                </div>
                {/* Map Pins and Mock Paths */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
                  <MapPin className="h-8 w-8 text-primary animate-bounce fill-primary/10" />
                  <span className="text-[10px] font-bold bg-white dark:bg-slate-900 px-2 py-0.5 rounded shadow border border-slate-200/50 dark:border-slate-800/50">
                    {donation.pickupAddress}
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Action Sidebar (Col 1/3) */}
        <div className="space-y-6">
          
          {/* Restaurant / Donor card details */}
          <div className="glass-card rounded-3xl p-6 border border-white/50 dark:border-white/5 space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-white">Restaurant Details</h3>
            
            <div className="space-y-3.5 text-sm">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Business Name</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{donation.restaurantName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Contact Number</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{donation.contactNumber || 'No Contact Available'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Address</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 break-words leading-tight">{donation.pickupAddress}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dates & Reservation Callouts */}
          <div className="glass-card rounded-3xl p-6 border border-white/50 dark:border-white/5 space-y-5">
            <h3 className="font-bold text-slate-800 dark:text-white">Donation Dates</h3>

            <div className="space-y-3 text-xs font-medium text-slate-600 dark:text-slate-400">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-slate-400" /> Prep Date:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{new Date(donation.pickupTime).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-slate-400" /> Expiry Date:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{new Date(donation.expiryTime).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Action Trigger */}
            {donation.status === 'available' && !isExpired && (
              <button
                onClick={handleReserve}
                disabled={reserving}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all"
              >
                {reserving ? 'Reserving...' : 'Reserve Food Donation'}
              </button>
            )}

            {isExpired && donation.status === 'available' && (
              <div className="text-center py-2 text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-950/20 rounded-xl">
                This donation has expired.
              </div>
            )}

            {/* QR Verification Code overlay */}
            {donation.status === 'reserved' && (
              <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-orange-600 dark:text-orange-400">
                  <CheckCircle2 className="h-4 w-4 text-orange-500 animate-pulse" />
                  Reserved by NGO Partner
                </div>

                {/* SVG QR Code Simulation */}
                <div className="flex flex-col items-center bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-150 dark:border-slate-850">
                  <div className="bg-white p-2.5 rounded-xl shadow-inner border border-slate-200">
                    {/* Simulated SVG QR Code */}
                    <svg className="h-32 w-32 text-slate-950" viewBox="0 0 100 100">
                      <rect width="100" height="100" fill="white" />
                      {/* Quiet Zone markers */}
                      <rect x="5" y="5" width="20" height="20" fill="currentColor" />
                      <rect x="10" y="10" width="10" height="10" fill="white" />
                      <rect x="75" y="5" width="20" height="20" fill="currentColor" />
                      <rect x="80" y="10" width="10" height="10" fill="white" />
                      <rect x="5" y="75" width="20" height="20" fill="currentColor" />
                      <rect x="10" y="80" width="10" height="10" fill="white" />
                      {/* Random barcodes / pixel paths */}
                      <path d="M 35 10 h 5 v 10 h -5 Z M 45 5 h 10 v 5 h -10 Z M 60 10 h 10 v 10 h -10 Z M 35 30 h 15 v 5 h -15 Z M 55 25 h 5 v 15 h -5 Z M 65 35 h 10 v 5 h -10 Z M 15 35 h 10 v 15 h -10 Z M 30 50 h 20 v 5 h -20 Z M 55 45 h 15 v 10 h -15 Z M 10 60 h 20 v 5 h -20 Z M 35 65 h 15 v 15 h -15 Z M 65 60 h 10 v 10 h -10 Z M 75 55 h 15 v 15 h -15 Z M 55 75 h 10 v 10 h -10 Z M 70 85 h 25 v 5 h -25 Z" fill="currentColor" />
                    </svg>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 mt-3 text-center uppercase tracking-wider">
                    SCAN FOR PICKUP VERIFICATION
                  </p>
                  <p className="text-[9px] text-slate-400 mt-1 select-all font-mono">
                    ID: {donation.donationId.substring(0, 18)}...
                  </p>
                </div>
              </div>
            )}

            {donation.status === 'collected' && (
              <div className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Donation Collected
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default DonationDetails;
