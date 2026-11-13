import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Map, 
  Grid, 
  Utensils, 
  Clock, 
  Layers, 
  X,
  Send,
  Building,
  AlertTriangle
} from 'lucide-react';
import { donationsApi, requestsApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import DonationCard from '../components/DonationCard';
import LeafletMap from '../components/LeafletMap';

const CATEGORIES = [
  { id: '', label: 'All Categories' },
  { id: 'cooked_meals', label: 'Cooked Meals' },
  { id: 'catered_buffet', label: 'Catered Buffet' },
  { id: 'bakery', label: 'Bakery & Bread' },
  { id: 'produce_fruits_vegetables', label: 'Fresh Produce' },
  { id: 'dairy', label: 'Dairy' },
  { id: 'packaged_groceries', label: 'Packaged Food' },
];

export const AvailableDonations = () => {
  const { user, isAuthenticated, role } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [storage, setStorage] = useState('');

  // Request Modal State
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [pickupMinutes, setPickupMinutes] = useState('45');
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState('');
  const [requestError, setRequestError] = useState('');

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const params = { status: 'available' };
      if (category) params.category = category;
      if (storage) params.storage = storage;
      if (search) params.search = search;

      const res = await donationsApi.getAll(params);
      setDonations(res.data);
    } catch (err) {
      console.error('Error fetching donations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [category, storage]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDonations();
  };

  const handleClaimClick = (donation) => {
    setSelectedDonation(donation);
    setRequestMessage(`Our team from ${user?.full_name || 'our NGO'} is in the area and ready to collect this donation.`);
    setRequestSuccess('');
    setRequestError('');
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setRequestError('Please log in with an NGO account to claim food donations.');
      return;
    }
    if (role !== 'ngo' && role !== 'admin') {
      setRequestError('Only registered NGO / Charity accounts can claim donations.');
      return;
    }
    if (role === 'ngo' && !user?.is_verified) {
      setRequestError('Your NGO account is currently pending verification by platform administrators.');
      return;
    }

    setRequestLoading(true);
    setRequestError('');

    try {
      const estimatedTime = new Date(Date.now() + parseInt(pickupMinutes) * 60000).toISOString();
      await requestsApi.requestDonation(selectedDonation.id, {
        message: requestMessage,
        estimated_pickup_time: estimatedTime,
      });
      setRequestSuccess('Donation claim submitted! The donor has been notified to confirm pickup.');
      setTimeout(() => {
        setSelectedDonation(null);
        fetchDonations();
      }, 1800);
    } catch (err) {
      setRequestError(err.response?.data?.detail || 'Failed to submit request.');
    } finally {
      setRequestLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-warm-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
            Real-Time Food Discovery
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">
            Available Surplus Food
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Browse verified food batches ready for rescue and community redistribution.
          </p>
        </div>

        {/* View Switcher (Grid vs Map) */}
        <div className="flex items-center gap-2 p-1 bg-warm-100 rounded-2xl self-start md:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              viewMode === 'grid'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Card Grid</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              viewMode === 'map'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Interactive Map</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-warm-200 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by food name, hotel, or location..."
              className="w-full pl-10 pr-4 py-2.5 text-xs border border-warm-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-semibold hover:bg-brand-700 transition"
          >
            Search
          </button>
        </form>

        {/* Categories Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-warm-100">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1">
            Category:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-3 py-1 rounded-xl text-xs font-medium transition ${
                category === cat.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-warm-50 text-gray-600 hover:bg-warm-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Map or Grid */}
      {viewMode === 'map' ? (
        <div className="bg-white p-4 rounded-3xl border border-warm-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Showing locations for <strong>{donations.length}</strong> active food listings</span>
            <span className="text-brand-700 font-medium">Click any pin for pickup details</span>
          </div>
          <LeafletMap height="550px" donations={donations} zoom={12} />
        </div>
      ) : (
        <div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 bg-warm-100 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : donations.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-warm-200 p-8 space-y-3">
              <Utensils className="w-12 h-12 text-warm-300 mx-auto" />
              <h3 className="text-lg font-bold text-gray-900">No matching surplus listings found</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Try selecting a different food category or clearing your search filters.
              </p>
              <button
                onClick={() => {
                  setCategory('');
                  setStorage('');
                  setSearch('');
                }}
                className="mt-2 px-4 py-2 bg-warm-100 hover:bg-warm-200 text-gray-700 rounded-xl text-xs font-semibold"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {donations.map((d) => (
                <DonationCard key={d.id} donation={d} onRequest={handleClaimClick} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Claim Donation Modal */}
      {selectedDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-warm-200 relative">
            <button
              onClick={() => setSelectedDonation(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-warm-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5">
              <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                Claim Food Request
              </span>
              <h3 className="text-xl font-bold text-gray-900 mt-1">
                {selectedDonation.title}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Donor: {selectedDonation.donor?.full_name} &bull; {selectedDonation.pickup_address}
              </p>
            </div>

            {requestSuccess ? (
              <div className="p-6 text-center bg-brand-50 text-brand-800 rounded-2xl border border-brand-200 space-y-1">
                <p className="font-bold text-sm">Request Submitted!</p>
                <p className="text-xs text-brand-700">{requestSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleSendRequest} className="space-y-4">
                {requestError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                    {requestError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Estimated Pickup Time
                  </label>
                  <select
                    value={pickupMinutes}
                    onChange={(e) => setPickupMinutes(e.target.value)}
                    className="w-full p-2.5 text-xs border border-warm-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
                  >
                    <option value="20">Within 20 Minutes (Nearby Van)</option>
                    <option value="45">Within 45 Minutes</option>
                    <option value="60">Within 1 Hour</option>
                    <option value="120">Within 2 Hours</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Message to Donor
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    className="w-full p-2.5 text-xs border border-warm-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    placeholder="Provide details about your volunteer vehicle or beneficiary shelter..."
                  />
                </div>

                <div className="p-3 bg-warm-50 rounded-xl text-[11px] text-gray-600 space-y-1">
                  <p className="font-semibold text-gray-800">Upon Donor Acceptance:</p>
                  <p>A 6-digit OTP verification code will be generated to authenticate the handoff at pickup.</p>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedDonation(null)}
                    className="flex-1 py-2.5 border border-warm-300 text-gray-700 rounded-xl text-xs font-semibold hover:bg-warm-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={requestLoading}
                    className="flex-1 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-semibold hover:bg-brand-700 disabled:opacity-50 transition flex items-center justify-center gap-1.5"
                  >
                    {requestLoading ? 'Submitting...' : <><Send className="w-4 h-4" /> Confirm Claim</>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailableDonations;

