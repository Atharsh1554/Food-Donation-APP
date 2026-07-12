import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, Flame, ArrowRight, Award, Plus, Sparkles, Building2, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const dashboardPath = user 
    ? (user.role === 'restaurant' ? '/restaurant-dashboard' : '/ngo-dashboard') 
    : '/register';

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-32 md:pb-36 bg-gradient-to-b from-primary/10 via-transparent to-transparent">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            {/* Hero Left Content */}
            <div className="space-y-6 text-center md:text-left animate-slide-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                <Sparkles className="h-4 w-4" />
                <span>Zero Hunger, Zero Waste</span>
              </div>
              <h1 className="font-sans text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-slate-800 dark:text-white">
                Bridging surplus to <br />
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  feed communities
                </span>
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-lg">
                Connect your food business directly with local non-profits and charities. Share excess food instantly, verify pick-ups securely, and make an impact today.
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <Link
                  to={dashboardPath}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] transition-all"
                >
                  Get Started Now
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3.5 text-base font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  See How it Works
                </a>
              </div>
            </div>

            {/* Hero Right Graphics */}
            <div className="relative flex justify-center items-center animate-fade-in">
              <div className="absolute -top-10 -left-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl"></div>
              <div className="absolute -bottom-10 -right-10 h-72 w-72 rounded-full bg-secondary/10 blur-3xl"></div>
              
              {/* Premium Simulated UI Card */}
              <div className="relative glass-card rounded-3xl p-6 shadow-xl max-w-md w-full border border-white/40 dark:border-white/5">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center text-orange-600">
                      <Flame className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-white">Active Donations</h3>
                      <p className="text-xs text-slate-500">Updated just now</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-950/40 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                    Live
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-sm text-slate-800 dark:text-white">Fresh Vegetable Salad</span>
                      <span className="text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded">15 Portions</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">Donated by Grand Hotel Cafe</p>
                    <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                      <span>Pickup: Today, 6:00 PM</span>
                      <span className="text-red-500 dark:text-red-400">Expires in 2h 15m</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-4 opacity-75">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-sm text-slate-800 dark:text-white">Assorted Baked Pastries</span>
                      <span className="text-xs font-semibold bg-orange-100 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300 px-2 py-0.5 rounded">Reserved</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">Donated by Corner Bakery</p>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>NGO: Community Foodbank</span>
                      <span>Collected 1h ago</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Impact Statistics */}
      <section className="py-12 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-extrabold text-primary sm:text-4xl">120K+</p>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">Meals Shared</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-primary sm:text-4xl">450+</p>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">Restaurants Partnered</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-primary sm:text-4xl">200+</p>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">Active NGOs</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-primary sm:text-4xl">80 Tons</p>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">Food Waste Saved</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-base font-semibold text-primary tracking-wider uppercase">Simple 3-Step Process</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-800 dark:text-white sm:text-4xl">
              How FoodShare Works
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="glass-card rounded-2xl p-6 text-center relative hover:-translate-y-1 transition-all">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white font-bold text-lg mb-4">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Publish Surplus Food</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Restaurants easily list excess food with quantities, pickup locations, preparation times, and expiry details.
              </p>
            </div>

            {/* Step 2 */}
            <div className="glass-card rounded-2xl p-6 text-center relative hover:-translate-y-1 transition-all">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-white font-bold text-lg mb-4">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">NGOs Discover & Reserve</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Nearby registered NGOs instantly view, search, filter, and reserve available meals matching their community need.
              </p>
            </div>

            {/* Step 3 */}
            <div className="glass-card rounded-2xl p-6 text-center relative hover:-translate-y-1 transition-all">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white font-bold text-lg mb-4">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Secure Pickup & Share</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                NGOs pick up donations directly and verify the transaction instantly using mobile-friendly QR codes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-base font-semibold text-primary uppercase">Community Reviews</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-800 dark:text-white sm:text-4xl">
              Donors & Volunteers Love Us
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-6 flex flex-col justify-between">
              <p className="text-slate-600 dark:text-slate-300 italic text-sm">
                "Instead of feeling guilty throwing away perfectly fresh buffet items at the end of the day, FoodShare allows our staff to bag them and watch a local NGO pick them up within the hour. It is incredibly rewarding."
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-primary">
                  <Store className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">Marcus Vance</h4>
                  <p className="text-xs text-slate-500">General Manager, Bistro Royal</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-6 flex flex-col justify-between">
              <p className="text-slate-600 dark:text-slate-300 italic text-sm">
                "Our food shelter feeds over 150 people daily. Finding fresh ingredients can be a challenge. With FoodShare, we get high-quality surplus meals from local restaurants that make a huge difference in our community."
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-secondary">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">Clara Higgins</h4>
                  <p className="text-xs text-slate-500">Director, Hope Community Center</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-12 text-slate-500 dark:text-slate-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
              <Heart className="h-5 w-5 fill-white" />
            </div>
            <span className="font-sans text-lg font-bold tracking-tight text-slate-800 dark:text-white">
              Food<span className="text-primary">Share</span>
            </span>
          </div>
          <p className="text-sm">&copy; {new Date().getFullYear()} FoodShare Platform. All rights reserved.</p>
          <div className="flex space-x-6 text-sm">
            <Link to="/login" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/register" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;
