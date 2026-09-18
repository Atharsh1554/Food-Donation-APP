import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Search, MapPin, Calendar, Clock, Heart, Filter, Grid, CheckCircle2, ChevronRight, Image } from 'lucide-react';

// Countdown Timer Sub-Component for individual cards
const ExpiryTimer = ({ expiryTime }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!expiryTime) return;
      const target = expiryTime.includes('T') ? new Date(expiryTime) : new Date(`${expiryTime}T23:59:59`);
      const difference = +target - +new Date();
      if (difference <= 0) {
        setTimeLeft('Expired');
        setIsExpired(true);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);

      let text = '';
      if (days > 0) text += `${days}d `;
      if (hours > 0 || days > 0) text += `${hours}h `;
      text += `${minutes}m`;
      setTimeLeft(text);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [expiryTime]);

  return (
    <div className={`flex items-center gap-1 text-[11px] font-bold ${isExpired ? 'text-red-500' : 'text-orange-600 dark:text-orange-400'}`}>
      <Clock className="h-3 w-3" />
      <span>{isExpired ? 'Expired' : `Expires in: ${timeLeft}`}</span>
    </div>
  );
};

const NgoDashboard = () => {
  const { showNotification } = useNotification();
  
  // Tabs
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' or 'history'
  
  // Data
  const [donations, setDonations] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [minQuantity, setMinQuantity] = useState('');
  const [maxDistance, setMaxDistance] = useState('');
  
  // User Location coordinates (SF defaults)
  const [coords, setCoords] = useState({ latitude: 37.7749, longitude: -122.4194 });

  useEffect(() => {
    // Get NGO geolocation if permitted
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => console.log('Location access denied, utilizing default coordinates.')
      );
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'browse') {
      fetchAvailableDonations();
    } else {
      fetchNgoHistory();
    }
  }, [activeTab, category, minQuantity, maxDistance, coords]);

  const fetchAvailableDonations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/donations', {
        params: {
          category: category || undefined,
          minQuantity: minQuantity || undefined,
          maxDistance: maxDistance || undefined,
          search: search || undefined,
          userLat: coords.latitude,
          userLon: coords.longitude
        }
      });
      setDonations(response.data);
    } catch (error) {
      console.error('Failed to fetch donations:', error);
      showNotification('Failed to load donations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchNgoHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/ngo/history');
      setHistory(response.data);
    } catch (error) {
      console.error('Failed to fetch history:', error);
      showNotification('Failed to load history logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAvailableDonations();
  };

  const handleReserve = async (donationId, e) => {
    e.preventDefault(); // Prevent navigating to details card
    e.stopPropagation();
    try {
      await api.post(`/donations/${donationId}/reserve`);
      showNotification('Donation reserved successfully! Email notification dispatched to donor.', 'success');
      fetchAvailableDonations();
    } catch (error) {
      console.error('Reservation failed:', error);
      showNotification(error.response?.data?.message || 'Failed to reserve donation', 'error');
    }
  };

  const handleCollect = async (donationId, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.post(`/donations/${donationId}/collect`);
      showNotification('Donation marked as collected. Thank you for reducing waste!', 'success');
      fetchNgoHistory();
    } catch (error) {
      console.error('Collection update failed:', error);
      showNotification('Failed to mark as collected', 'error');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setMinQuantity('');
    setMaxDistance('');
    // Trigger refetch
    setTimeout(() => {
      fetchAvailableDonations();
    }, 50);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Upper header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">NGO Dashboard</h1>
          <p className="text-slate-500 mt-1.5">Discover, reserve, and collect surplus food donations nearby.</p>
        </div>

        {/* Dashboard Tabs switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-1 shrink-0">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'browse'
                ? 'bg-white dark:bg-slate-850 text-slate-800 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Available Donations
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'history'
                ? 'bg-white dark:bg-slate-850 text-slate-800 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            My Collections History
          </button>
        </div>
      </div>

      {activeTab === 'browse' ? (
        <>
          {/* Filters Bar */}
          <div className="glass-card rounded-2xl p-4 mb-8 border border-white/50 dark:border-white/5 space-y-4">
            <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row gap-4">
              
              {/* Live search input */}
              <div className="relative flex-1">
                <Search className="absolute inset-y-0 left-3 h-5 w-5 my-auto text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by food name, restaurant, or address..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm"
                />
              </div>

              {/* Category Dropdown */}
              <div className="w-full lg:w-48">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="block w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                >
                  <option value="">All Categories</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Non-Vegetarian">Non-Vegetarian</option>
                  <option value="Baked Goods">Baked Goods</option>
                  <option value="Dairy/Fruit">Dairy / Fruit</option>
                  <option value="Prepared Meals">Prepared Meals</option>
                </select>
              </div>

              {/* Distance Slider / Input */}
              <div className="w-full lg:w-48">
                <select
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(e.target.value)}
                  className="block w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                >
                  <option value="">Any Distance</option>
                  <option value="2">&lt; 2 km</option>
                  <option value="5">&lt; 5 km</option>
                  <option value="10">&lt; 10 km</option>
                  <option value="25">&lt; 25 km</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/10 transition-colors"
                >
                  Apply Filters
                </button>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                >
                  Clear
                </button>
              </div>
            </form>
          </div>

          {/* Grid listing */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="animate-pulse glass-card rounded-2xl h-80"></div>
              ))}
            </div>
          ) : donations.length === 0 ? (
            <div className="glass-card rounded-3xl p-12 text-center max-w-md mx-auto mt-10">
              <Filter className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Donations Found</h3>
              <p className="text-slate-500 text-sm mt-2">Try adjusting your filters or expanding your distance search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {donations.map((donation) => (
                <Link 
                  to={`/donations/${donation.donationId}`}
                  key={donation.donationId} 
                  className="glass-card rounded-2xl overflow-hidden border border-white/50 dark:border-white/5 hover:shadow-lg transition-all duration-200 flex flex-col group cursor-pointer"
                >
                  {/* Card Image */}
                  <div className="relative h-44 bg-slate-100 dark:bg-slate-900">
                    {donation.imageUrl ? (
                      <img 
                        src={donation.imageUrl.startsWith('/') ? `http://localhost:5000${donation.imageUrl}` : donation.imageUrl} 
                        alt={donation.foodName}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-400">
                        <Image className="h-10 w-10 stroke-[1.5]" />
                      </div>
                    )}
                    
                    <span className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-xs font-bold shadow-sm">
                      {donation.category}
                    </span>
                    
                    <span className="absolute bottom-3 right-3 bg-primary/95 text-white backdrop-blur-sm px-2.5 py-0.5 rounded-full text-xs font-bold shadow-sm">
                      {donation.distance} km away
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-1.5">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white truncate group-hover:text-primary transition-colors">
                          {donation.foodName}
                        </h3>
                        <span className="text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded font-bold shrink-0">
                          {donation.quantity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mb-1">Donated by: <span className="font-semibold">{donation.restaurantName}</span></p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2 mb-4">
                        {donation.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      {/* Expiry Countdown Timer */}
                      <ExpiryTimer expiryTime={donation.expiryTime} />

                      <div className="space-y-1.5 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{donation.pickupAddress}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 shrink-0" />
                          <span>Expiry Date: {new Date(donation.expiryTime).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={(e) => handleReserve(donation.donationId, e)}
                          className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-primary hover:bg-primary-hover py-2.5 text-xs font-bold text-white shadow-md shadow-primary/10 transition-colors"
                        >
                          Reserve Donation
                        </button>
                        <div className="flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 text-slate-500 group-hover:text-primary transition-colors">
                          <ChevronRight className="h-4.5 w-4.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      ) : (
        /* History Log Tab */
        <>
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((n) => (
                <div key={n} className="animate-pulse glass-card rounded-2xl h-24 w-full"></div>
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="glass-card rounded-3xl p-12 text-center max-w-md mx-auto mt-10">
              <Heart className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Reserved Donations</h3>
              <p className="text-slate-500 text-sm mt-2">Reservations you make will show up here to manage and collect.</p>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              {history.map((donation) => (
                <div 
                  key={donation.donationId} 
                  className="glass-card rounded-2xl p-4 sm:p-5 border border-white/50 dark:border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="h-16 w-16 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 overflow-hidden">
                      {donation.imageUrl ? (
                        <img 
                          src={donation.imageUrl.startsWith('/') ? `http://localhost:5000${donation.imageUrl}` : donation.imageUrl} 
                          alt={donation.foodName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-400">
                          <Image className="h-6 w-6 stroke-[1.5]" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-bold text-base text-slate-800 dark:text-white truncate">{donation.foodName}</h3>
                        <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-semibold text-slate-600 dark:text-slate-300">
                          {donation.quantity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mb-1">Donor: <span className="font-medium">{donation.restaurantName}</span> | Contact: {donation.contactNumber || 'N/A'}</p>
                      <p className="text-xs text-slate-400 truncate flex items-center gap-1">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {donation.pickupAddress}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-stretch sm:self-center justify-between sm:justify-end shrink-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 pt-3 sm:pt-0">
                    <div>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                        donation.status === 'reserved' 
                          ? 'bg-orange-100 text-orange-850 dark:bg-orange-950/40 dark:text-orange-300' 
                          : 'bg-slate-100 text-slate-705 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                      </span>
                    </div>

                    {donation.status === 'reserved' ? (
                      <button
                        onClick={(e) => handleCollect(donation.donationId, e)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-primary hover:bg-primary-hover px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/10 transition-colors"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Mark Collected
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">Collected: {new Date(donation.collectedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

    </div>
  );
};

export default NgoDashboard;
