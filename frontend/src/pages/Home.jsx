import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Utensils, 
  Heart, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Search,
  Sparkles,
  Building,
  Truck
} from 'lucide-react';
import { donationsApi, analyticsApi } from '../api/client';
import DonationCard from '../components/DonationCard';
import LeafletMap from '../components/LeafletMap';
import ImpactStats from '../components/ImpactStats';

export const Home = () => {
  const [recentDonations, setRecentDonations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [donationsRes, statsRes] = await Promise.all([
          donationsApi.getAll({ status: 'available' }),
          analyticsApi.getOverview(),
        ]);
        setRecentDonations(donationsRes.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 bg-gradient-to-b from-brand-50/60 via-warm-50/40 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100 text-brand-800 text-xs font-semibold border border-brand-200">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                <span>Smart Food Rescue & Redistribution Network</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-tight">
                Turn Surplus Food Into <br />
                <span className="bg-gradient-to-r from-brand-600 to-teal-600 bg-clip-text text-transparent">
                  Smiles & Hope.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Connect hotels, caterers, and supermarkets directly with verified local NGOs. Rescue wholesome meals before they expire, reduce carbon emissions, and eradicate hunger in your city.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/donations/add"
                  className="w-full sm:w-auto px-7 py-3.5 bg-brand-600 text-white rounded-2xl font-bold shadow-lg shadow-brand-600/25 hover:bg-brand-700 hover:shadow-xl transition flex items-center justify-center gap-2 group"
                >
                  <Utensils className="w-5 h-5" />
                  <span>Donate Food Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/donations"
                  className="w-full sm:w-auto px-7 py-3.5 bg-white text-gray-800 rounded-2xl font-bold border border-warm-300 shadow-sm hover:bg-warm-100 transition flex items-center justify-center gap-2"
                >
                  <Search className="w-5 h-5 text-gray-500" />
                  <span>Browse Available Food</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-gray-500 font-medium">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-brand-600" />
                  <span>100% Verified NGOs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-600" />
                  <span>Real-Time Expiry Countdown</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-600" />
                  <span>Handoff Verification OTP</span>
                </div>
              </div>
            </div>

            {/* Right Card / Visual */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-warm-200">
                <div className="flex items-center justify-between pb-4 border-b border-warm-100">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Live Surplus Radar
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full">
                    Hyderabad Region
                  </span>
                </div>

                {/* Map Mini-Window */}
                <div className="my-4 rounded-2xl overflow-hidden border border-warm-200">
                  <LeafletMap
                    height="220px"
                    donations={recentDonations.slice(0, 4)}
                    zoom={11}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Available Rescue Listings:</span>
                    <span className="font-bold text-gray-900">{recentDonations.length} Active Batches</span>
                  </div>
                  <Link
                    to="/donations"
                    className="block w-full py-2.5 bg-brand-50 hover:bg-brand-100 text-brand-800 text-xs font-bold text-center rounded-xl transition"
                  >
                    Open Full Screen Interactive Map &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Platform Impact Metrics */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-widest font-bold text-brand-600">
            Measurable Change
          </span>
          <h2 className="text-3xl font-extrabold text-gray-900 mt-1">
            Our Collective Real-World Impact
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            Every meal saved keeps food out of landfills and feeds people who need it most.
          </p>
        </div>
        <ImpactStats stats={stats} loading={loading} />
      </section>

      {/* 3. Live Available Donations Feed */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-bold text-amber-600 mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Urgent Redistribution Needed</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Fresh Food Ready for Immediate Pickup
            </h2>
          </div>
          <Link
            to="/donations"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            Explore all listings ({recentDonations.length}) &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-warm-100 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : recentDonations.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-warm-200 p-8">
            <Utensils className="w-12 h-12 text-warm-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900">No available food donations right now</h3>
            <p className="text-sm text-gray-500 mt-1 mb-6">
              Be the first donor to post surplus food or check back in a few minutes.
            </p>
            <Link
              to="/donations/add"
              className="px-6 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700"
            >
              Post a Food Donation
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentDonations.slice(0, 3).map((donation) => (
              <DonationCard key={donation.id} donation={donation} />
            ))}
          </div>
        )}
      </section>

      {/* 4. How It Works (3 Steps) */}
      <section className="bg-white border-y border-warm-200 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase tracking-widest font-bold text-brand-600">
              Simple & Transparent
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 mt-1">
              How FoodBridge Operates
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              From surplus kitchen to the hands of vulnerable families in under three hours.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative p-8 rounded-3xl bg-warm-50 border border-warm-200 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-bold text-xl mb-6 shadow-md shadow-brand-600/20">
                1
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Donor Posts Surplus</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Hotels, banquet halls, or supermarkets post food quantity, preparation time, temperature storage, and allergen information.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative p-8 rounded-3xl bg-warm-50 border border-warm-200 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold text-xl mb-6 shadow-md shadow-teal-600/20">
                2
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Verified NGO Claims</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Nearby registered charities receive alerts, claim the batch, and coordinate estimated pickup arrival times.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative p-8 rounded-3xl bg-warm-50 border border-warm-200 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold text-xl mb-6 shadow-md shadow-amber-600/20">
                3
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">OTP Handover & Delivery</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Donor validates the 6-digit pickup OTP, food temperature is verified, and the NGO delivers meals directly to shelter homes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Food Safety Guarantee & Disclaimer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-brand-900 to-warm-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-brand-300">
              <ShieldCheck className="w-4 h-4" />
              <span>Safety & Hygiene Standards</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight">
              Safety is our top priority. We verify every partner organization.
            </h2>
            <p className="text-xs sm:text-sm text-warm-200 leading-relaxed">
              Every NGO on FoodBridge undergoes strict administrative verification. Donors must provide truthful preparation times, proper storage labels, and allergen disclosures. Together, we preserve food integrity and maintain rigorous hygiene protocols.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                to="/about"
                className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition shadow"
              >
                Read Food Safety Charter
              </Link>
              <Link
                to="/contact"
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition"
              >
                Talk to Regional Coordinator
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

