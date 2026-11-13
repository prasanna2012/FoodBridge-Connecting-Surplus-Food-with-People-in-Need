import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Search, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck, 
  AlertTriangle, 
  KeyRound, 
  Truck, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { requestsApi, analyticsApi, collectionsApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import OTPModal from '../components/OTPModal';

export const NgoDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // OTP Verification Modal
  const [selectedDonationForOTP, setSelectedDonationForOTP] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reqRes, statsRes] = await Promise.all([
        requestsApi.getMyNgoRequests(),
        analyticsApi.getNgoStats(),
      ]);
      setRequests(reqRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Error fetching NGO dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVerifyHandoff = async (verificationPayload) => {
    if (!selectedDonationForOTP) return;
    await collectionsApi.verifyHandoff(selectedDonationForOTP.donation_id, verificationPayload);
    await fetchData();
  };

  const isVerified = user?.is_verified;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-warm-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            Charity Operations Hub
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
            NGO / Volunteer Dashboard
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Track active food claims, verify physical handovers, and manage meal distribution.
          </p>
        </div>

        <Link
          to="/donations"
          className="inline-flex items-center gap-2 px-5 py-3 bg-brand-600 text-white rounded-2xl text-xs font-bold shadow-md shadow-brand-600/20 hover:bg-brand-700 transition"
        >
          <Search className="w-4 h-4" />
          <span>Browse Available Food</span>
        </Link>
      </div>

      {/* Verification Status Banner */}
      {!isVerified ? (
        <div className="p-5 bg-amber-50 border border-amber-200 rounded-3xl flex items-start gap-4 shadow-sm">
          <div className="p-2.5 bg-amber-100 text-amber-700 rounded-2xl flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-amber-900">
              Account Verification Pending Administrator Review
            </h3>
            <p className="text-xs text-amber-800 leading-relaxed">
              Your organization registration is currently being verified by platform administrators to ensure food distribution safety. You may browse current listings, and full claiming privileges will be unlocked upon approval.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-teal-700" />
            <span className="text-xs text-teal-900 font-medium">
              Verified Charity Partner &bull; Registered Capacity: {user?.ngo_profile?.capacity_meals_per_day || 150} meals/day
            </span>
          </div>
          <span className="text-[11px] font-bold text-teal-700 bg-teal-100 px-2.5 py-0.5 rounded-full">
            Active Verified
          </span>
        </div>
      )}

      {/* Impact Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-sm">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Total Requested
            </span>
            <span className="text-2xl font-extrabold text-gray-900 mt-1 block">
              {stats.total_requested}
            </span>
            <span className="text-[11px] text-gray-500 mt-0.5 block">Claims initiated</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-sm">
            <span className="text-[11px] font-bold text-teal-600 uppercase tracking-wider block">
              Completed Collections
            </span>
            <span className="text-2xl font-extrabold text-teal-700 mt-1 block">
              {stats.total_collected}
            </span>
            <span className="text-[11px] text-teal-600 mt-0.5 block">Handoffs verified</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-sm">
            <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider block">
              Food Rescued
            </span>
            <span className="text-2xl font-extrabold text-brand-700 mt-1 block">
              {stats.total_kg_received} kg
            </span>
            <span className="text-[11px] text-brand-600 mt-0.5 block">Weight distributed</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-sm">
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">
              Beneficiaries Served
            </span>
            <span className="text-2xl font-extrabold text-amber-700 mt-1 block">
              {stats.people_served_estimate}
            </span>
            <span className="text-[11px] text-amber-600 mt-0.5 block">Estimated people nourished</span>
          </div>
        </div>
      )}

      {/* Active Claims & Requests Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            My Claims & Pickup Pipeline ({requests.length})
          </h2>
          <span className="text-xs text-gray-500">Live request status</span>
        </div>

        {requests.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-warm-200 text-center space-y-3">
            <Heart className="w-10 h-10 text-warm-300 mx-auto" />
            <h3 className="text-base font-bold text-gray-900">No active food claims</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Explore available surplus listings in your area to rescue food for your community.
            </p>
            <Link
              to="/donations"
              className="inline-block px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold"
            >
              Browse Available Food
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map((r) => {
              const donation = r.donation;
              if (!donation) return null;

              return (
                <div
                  key={r.id}
                  className="bg-white rounded-2xl p-5 border border-warm-200 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <StatusBadge status={donation.status} size="sm" />
                      <span className="text-xs font-medium text-gray-500">
                        Requested {new Date(r.requested_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-gray-900">
                      <Link to={`/donations/${donation.id}`} className="hover:text-brand-600 transition">
                        {donation.title}
                      </Link>
                    </h3>

                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="flex items-center gap-1.5 font-medium text-gray-800">
                        <MapPin className="w-3.5 h-3.5 text-warm-400" />
                        <span className="line-clamp-1">{donation.pickup_address}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-500 pt-1">
                        <span>Quantity: <strong>{Number(donation.quantity_value)} {donation.quantity_unit}</strong></span>
                        <span>&bull;</span>
                        <span className="capitalize">{donation.storage_condition.replace('_', ' ')}</span>
                      </div>
                    </div>

                    {/* Handoff OTP Box if Accepted */}
                    {donation.collection && (
                      <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-purple-900">
                            Verification Code (OTP):
                          </span>
                          <span className="font-mono font-bold text-sm text-purple-900 tracking-widest">
                            {donation.collection.verification_code}
                          </span>
                        </div>
                        <p className="text-[10px] text-purple-700">
                          Provide this code to the donor during physical handoff to confirm collection.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-warm-100 flex items-center justify-between gap-2">
                    <Link
                      to={`/donations/${donation.id}`}
                      className="text-xs font-semibold text-gray-600 hover:text-brand-700"
                    >
                      View Details &rarr;
                    </Link>

                    {['accepted', 'ready_for_pickup'].includes(donation.status) && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedDonationForOTP(r)}
                          className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                        >
                          <KeyRound className="w-3.5 h-3.5" /> Confirm Handoff
                        </button>
                        <Link
                          to={`/tracking/${donation.id}`}
                          className="px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold hover:bg-purple-100 transition"
                        >
                          Tracker
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* OTP Modal */}
      {selectedDonationForOTP && (
        <OTPModal
          isOpen={!!selectedDonationForOTP}
          onClose={() => setSelectedDonationForOTP(null)}
          onVerify={handleVerifyHandoff}
          expectedCode={selectedDonationForOTP.donation?.collection?.verification_code}
          title="Verify Collection Handoff"
        />
      )}
    </div>
  );
};

export default NgoDashboard;

