import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Utensils, 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Truck, 
  AlertTriangle, 
  Layers, 
  Calendar,
  Building,
  KeyRound,
  FileText
} from 'lucide-react';
import { donationsApi, analyticsApi, requestsApi, collectionsApi } from '../api/client';
import StatusBadge from '../components/StatusBadge';

export const DonorDashboard = () => {
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'requests'

  const fetchData = async () => {
    try {
      setLoading(true);
      const [donationsRes, statsRes] = await Promise.all([
        donationsApi.getMyDonorDonations(),
        analyticsApi.getDonorStats(),
      ]);
      setDonations(donationsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Error fetching donor dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDecideRequest = async (requestId, decision) => {
    setActionLoading(true);
    try {
      await requestsApi.decideRequest(requestId, {
        decision,
        decision_notes: decision === 'accepted' ? 'Accepted by donor. Ready for pickup.' : 'Declined.',
      });
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkReady = async (donationId) => {
    setActionLoading(true);
    try {
      await collectionsApi.markReady(donationId);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to mark ready');
    } finally {
      setActionLoading(false);
    }
  };

  const activeDonations = donations.filter((d) =>
    ['available', 'requested', 'accepted', 'ready_for_pickup'].includes(d.status)
  );

  // Flatten pending requests across all donations
  const pendingRequests = [];
  donations.forEach((d) => {
    if (d.requests) {
      d.requests.forEach((r) => {
        if (r.status === 'pending') {
          pendingRequests.push({ ...r, donationTitle: d.title, donationId: d.id });
        }
      });
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-warm-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Donor Operations Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
            Donor Dashboard
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage your food listings, respond to charity requests, and track handovers.
          </p>
        </div>

        <Link
          to="/donations/add"
          className="inline-flex items-center gap-2 px-5 py-3 bg-brand-600 text-white rounded-2xl text-xs font-bold shadow-md shadow-brand-600/20 hover:bg-brand-700 transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Donation</span>
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-sm">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Total Listed
            </span>
            <span className="text-2xl font-extrabold text-gray-900 mt-1 block">
              {stats.total_listed}
            </span>
            <span className="text-[11px] text-gray-500 mt-0.5 block">Surplus batches published</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-sm">
            <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider block">
              Meals Rescued
            </span>
            <span className="text-2xl font-extrabold text-brand-700 mt-1 block">
              {stats.total_meals}
            </span>
            <span className="text-[11px] text-brand-600 mt-0.5 block">{stats.total_kg} kg diverted</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-sm">
            <span className="text-[11px] font-bold text-teal-600 uppercase tracking-wider block">
              CO2 Mitigated
            </span>
            <span className="text-2xl font-extrabold text-teal-700 mt-1 block">
              {stats.estimated_co2_saved_kg} kg
            </span>
            <span className="text-[11px] text-teal-600 mt-0.5 block">Emissions averted</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-sm">
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">
              Positive Feedback
            </span>
            <span className="text-2xl font-extrabold text-amber-700 mt-1 block">
              {stats.positive_feedback_rate}%
            </span>
            <span className="text-[11px] text-amber-600 mt-0.5 block">NGO satisfaction rate</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-3 border-b border-warm-200 pb-2">
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-2 px-3 text-xs font-bold border-b-2 transition ${
            activeTab === 'active'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Active Listings ({activeDonations.length})
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-2 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'requests'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <span>Incoming Requests</span>
          {pendingRequests.length > 0 && (
            <span className="px-1.5 py-0.5 bg-rose-500 text-white rounded-full text-[10px] font-bold">
              {pendingRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Active Listings */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {activeDonations.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-warm-200 text-center space-y-3">
              <Utensils className="w-10 h-10 text-warm-300 mx-auto" />
              <h3 className="text-base font-bold text-gray-900">No active food donation listings</h3>
              <p className="text-xs text-gray-500">
                You have no food batches currently waiting for collection.
              </p>
              <Link
                to="/donations/add"
                className="inline-block px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold"
              >
                + Post a Food Donation
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeDonations.map((d) => (
                <div
                  key={d.id}
                  className="bg-white rounded-2xl p-5 border border-warm-200 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <StatusBadge status={d.status} size="sm" />
                      <span className="text-[11px] font-bold text-gray-400 uppercase">
                        {d.food_category.replace('_', ' ')}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-gray-900">
                      <Link to={`/donations/${d.id}`} className="hover:text-brand-600 transition">
                        {d.title}
                      </Link>
                    </h4>

                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span className="font-semibold text-gray-800">
                        {Number(d.quantity_value)} {d.quantity_unit}
                      </span>
                      <span>&bull;</span>
                      <span className="capitalize">{d.storage_condition.replace('_', ' ')}</span>
                      <span>&bull;</span>
                      <span className="text-rose-600 font-medium">
                        Expires {new Date(d.expiry_deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {d.collection && (
                      <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs flex items-center justify-between">
                        <span className="font-semibold text-purple-900">Pickup OTP Code:</span>
                        <span className="font-mono font-bold text-sm text-purple-900 tracking-widest">
                          {d.collection.verification_code}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-warm-100 flex items-center justify-between gap-2">
                    <Link
                      to={`/donations/${d.id}`}
                      className="text-xs font-semibold text-gray-600 hover:text-brand-700"
                    >
                      View Details &rarr;
                    </Link>

                    {d.status === 'accepted' && (
                      <button
                        onClick={() => handleMarkReady(d.id)}
                        disabled={actionLoading}
                        className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                      >
                        <Truck className="w-3.5 h-3.5" /> Mark Ready for Pickup
                      </button>
                    )}

                    {['accepted', 'ready_for_pickup'].includes(d.status) && (
                      <Link
                        to={`/tracking/${d.id}`}
                        className="px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold hover:bg-purple-100 transition"
                      >
                        Track Pickup
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Incoming Requests */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-warm-200 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-brand-500 mx-auto" />
              <h3 className="text-base font-bold text-gray-900">All caught up!</h3>
              <p className="text-xs text-gray-500">
                You have no pending donation requests from NGOs awaiting your review.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-2xl p-5 border border-warm-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900">{req.ngo?.full_name}</span>
                      <span className="text-[11px] text-gray-400">requested:</span>
                      <Link to={`/donations/${req.donationId}`} className="text-xs font-bold text-brand-700 hover:underline">
                        {req.donationTitle}
                      </Link>
                    </div>
                    <p className="text-xs text-gray-600 max-w-xl">{req.message}</p>
                    {req.estimated_pickup_time && (
                      <p className="text-[11px] text-gray-500">
                        Estimated arrival: {new Date(req.estimated_pickup_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleDecideRequest(req.id, 'accepted')}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition"
                    >
                      Accept & Issue OTP
                    </button>
                    <button
                      onClick={() => handleDecideRequest(req.id, 'rejected')}
                      disabled={actionLoading}
                      className="px-3 py-2 bg-white border border-rose-200 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-50 transition"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DonorDashboard;

