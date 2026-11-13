import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Clock, 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  Layers, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Send,
  Building,
  ArrowLeft,
  KeyRound,
  FileWarning
} from 'lucide-react';
import { donationsApi, requestsApi, collectionsApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import LeafletMap from '../components/LeafletMap';
import ReportModal from '../components/ReportModal';

export const DonationDetails = () => {
  const { id } = useParams();
  const { user, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  const [donation, setDonation] = useState(null);
  const [requests, setRequests] = useState([]);
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Request Form Modal (for NGO)
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimMessage, setClaimMessage] = useState('');
  const [pickupMinutes, setPickupMinutes] = useState('45');
  const [submittingClaim, setSubmittingClaim] = useState(false);
  const [claimError, setClaimError] = useState('');

  // Report Modal
  const [showReportModal, setShowReportModal] = useState(false);

  // Decision State
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await donationsApi.getById(id);
      setDonation(res.data);

      // If owner donor or admin, fetch requests
      if (user && (res.data.donor_id === user.id || user.role === 'admin')) {
        const reqRes = await requestsApi.getDonationRequests(id);
        setRequests(reqRes.data);
      }

      // If accepted or ready, fetch collection record
      if (['accepted', 'ready_for_pickup', 'collected', 'completed'].includes(res.data.status)) {
        try {
          const colRes = await collectionsApi.getDetails(id);
          setCollection(colRes.data);
        } catch (e) {
          // might not be authorized if not donor/ngo
        }
      }
    } catch (err) {
      setError('Food donation listing not found or unavailable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id, user]);

  const handleDecideRequest = async (requestId, decision) => {
    setActionLoading(true);
    try {
      await requestsApi.decideRequest(requestId, {
        decision,
        decision_notes: decision === 'accepted' ? 'Accepted by donor for immediate pickup.' : 'Declined.',
      });
      await fetchDetails();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    setSubmittingClaim(true);
    setClaimError('');
    try {
      const estimatedTime = new Date(Date.now() + parseInt(pickupMinutes) * 60000).toISOString();
      await requestsApi.requestDonation(donation.id, {
        message: claimMessage,
        estimated_pickup_time: estimatedTime,
      });
      setShowClaimModal(false);
      fetchDetails();
    } catch (err) {
      setClaimError(err.response?.data?.detail || 'Failed to submit request.');
    } finally {
      setSubmittingClaim(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !donation) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-3xl border border-warm-200 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-gray-900">{error || 'Donation Not Found'}</h2>
        <Link to="/donations" className="inline-block px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold">
          Return to Available Food
        </Link>
      </div>
    );
  }

  const isDonorOwner = user && user.id === donation.donor_id;
  const isEligibleNGO = user && user.role === 'ngo' && user.is_verified;
  const alreadyRequested = requests.some((r) => r.ngo_id === user?.id);

  const expiry = new Date(donation.expiry_deadline);
  const prep = donation.preparation_time ? new Date(donation.preparation_time) : null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/donations"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-brand-700 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Listings
        </Link>
      </div>

      {/* Main Grid: Photo + Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Media & Location */}
        <div className="lg:col-span-7 space-y-6">
          <div className="relative rounded-3xl overflow-hidden bg-warm-100 border border-warm-200 shadow-sm aspect-video">
            <img
              src={donation.image_url ? (donation.image_url.startsWith('http') ? donation.image_url : `http://127.0.0.1:8000${donation.image_url}`) : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1000'}
              alt={donation.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded-xl bg-black/65 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider">
                {donation.food_category.replace('_', ' ')}
              </span>
            </div>
            <div className="absolute top-4 right-4">
              <StatusBadge status={donation.status} size="md" />
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-warm-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900">Food Description & Details</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {donation.description || 'No additional description provided by donor.'}
            </p>

            {/* Pickup Instructions */}
            {donation.pickup_instructions && (
              <div className="p-4 bg-warm-50 rounded-2xl border border-warm-200 text-xs text-gray-700 space-y-1">
                <span className="font-bold text-gray-900 block">Specific Pickup Instructions:</span>
                <p>{donation.pickup_instructions}</p>
              </div>
            )}
          </div>

          {/* Location Map */}
          <div className="bg-white rounded-3xl p-6 border border-warm-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
              <MapPin className="w-4 h-4 text-brand-600" />
              <span>Pickup Address: {donation.pickup_address}</span>
            </div>
            <LeafletMap
              height="280px"
              singlePoint={[Number(donation.latitude), Number(donation.longitude)]}
              zoom={14}
            />
          </div>
        </div>

        {/* Right Column: Key Parameters & Action Box */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-warm-200 shadow-sm space-y-6">
            <div>
              <h1 className="text-2xl font-black text-gray-900 leading-snug">
                {donation.title}
              </h1>
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                <span>Posted by</span>
                <span className="font-semibold text-gray-800">{donation.donor?.full_name}</span>
                {donation.donor?.is_verified && (
                  <ShieldCheck className="w-4 h-4 text-brand-600" title="Verified Donor" />
                )}
              </div>
            </div>

            {/* Metric Blocks */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-brand-50/70 border border-brand-200/60">
                <span className="text-[11px] font-bold text-brand-800 uppercase tracking-wider block mb-1">
                  Rescuable Quantity
                </span>
                <span className="text-2xl font-extrabold text-brand-900">
                  {Number(donation.quantity_value)} {donation.quantity_unit}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-warm-100 border border-warm-200">
                <span className="text-[11px] font-bold text-warm-700 uppercase tracking-wider block mb-1">
                  Storage Condition
                </span>
                <span className="text-sm font-bold text-gray-900 capitalize">
                  {donation.storage_condition.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Time Metrics */}
            <div className="space-y-2 text-xs text-gray-600 border-y border-warm-100 py-4">
              {prep && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-gray-500">
                    <Calendar className="w-4 h-4" /> Prepared At:
                  </span>
                  <span className="font-semibold text-gray-800">
                    {prep.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; {prep.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-rose-600 font-medium">
                  <Clock className="w-4 h-4" /> Expiry / Use-By:
                </span>
                <span className="font-bold text-rose-700">
                  {expiry.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; {expiry.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Allergens Warning */}
            <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="text-amber-900 font-semibold block mb-0.5">Allergen Information:</strong>
                <span className="text-amber-800">
                  {donation.allergens && donation.allergens.toLowerCase() !== 'none'
                    ? donation.allergens
                    : 'No common allergens reported by donor.'}
                </span>
              </div>
            </div>

            {/* Active Collection Handoff OTP display if accepted/ready */}
            {collection && (
              <div className="p-5 bg-purple-50 border border-purple-200 rounded-2xl space-y-2 text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-purple-900 uppercase tracking-wider">
                  <KeyRound className="w-4 h-4 text-purple-600" /> Collection Handoff OTP
                </div>
                <div className="text-3xl font-mono font-black text-purple-900 tracking-widest">
                  {collection.verification_code}
                </div>
                <p className="text-[11px] text-purple-700">
                  Present this code during physical handoff to sign off collection.
                </p>
                <Link
                  to={`/tracking/${donation.id}`}
                  className="inline-block mt-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition"
                >
                  Open Live Pickup Tracker &rarr;
                </Link>
              </div>
            )}

            {/* Actions for Visitors / NGOs */}
            {donation.status === 'available' && (
              <div>
                {isAuthenticated && role === 'ngo' ? (
                  user?.is_verified ? (
                    <button
                      onClick={() => setShowClaimModal(true)}
                      className="w-full py-3.5 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 shadow-md shadow-brand-600/20 transition flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Request & Claim Food Batch
                    </button>
                  ) : (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                      Your NGO registration is pending verification. Once approved by our team, you will be able to claim food donations.
                    </div>
                  )
                ) : !isAuthenticated ? (
                  <Link
                    to="/login"
                    className="block w-full py-3.5 bg-brand-600 text-white rounded-xl text-xs font-bold text-center hover:bg-brand-700 transition shadow"
                  >
                    Sign In as NGO to Claim
                  </Link>
                ) : null}
              </div>
            )}

            {/* Report issue link */}
            <div className="pt-2 text-center">
              <button
                onClick={() => setShowReportModal(true)}
                className="text-[11px] text-gray-400 hover:text-rose-600 transition flex items-center justify-center gap-1 mx-auto"
              >
                <FileWarning className="w-3.5 h-3.5" /> Report a safety or listing issue
              </button>
            </div>
          </div>

          {/* Owner Donor Management Panel */}
          {isDonorOwner && (
            <div className="bg-white rounded-3xl p-6 border border-warm-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">Incoming Requests ({requests.length})</h3>
                <span className="text-xs text-gray-500">Manage claims</span>
              </div>

              {requests.length === 0 ? (
                <p className="text-xs text-gray-500 py-3 text-center">
                  No NGOs have requested this batch yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {requests.map((r) => (
                    <div
                      key={r.id}
                      className="p-3.5 rounded-2xl bg-warm-50 border border-warm-200 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900">{r.ngo?.full_name}</span>
                        <StatusBadge status={r.status} size="sm" />
                      </div>
                      <p className="text-gray-600">{r.message}</p>
                      {r.status === 'pending' && (
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => handleDecideRequest(r.id, 'accepted')}
                            disabled={actionLoading}
                            className="flex-1 py-1.5 bg-brand-600 text-white rounded-lg text-xs font-semibold hover:bg-brand-700"
                          >
                            Accept & Generate OTP
                          </button>
                          <button
                            onClick={() => handleDecideRequest(r.id, 'rejected')}
                            disabled={actionLoading}
                            className="px-3 py-1.5 bg-white border border-rose-200 text-rose-600 rounded-lg text-xs font-semibold hover:bg-rose-50"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Claim Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-warm-200 relative">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Claim Food Batch</h3>
            <p className="text-xs text-gray-500 mb-4">
              Enter your estimated pickup arrival window for the donor.
            </p>

            {claimError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                {claimError}
              </div>
            )}

            <form onSubmit={handleClaimSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Estimated Pickup Window
                </label>
                <select
                  value={pickupMinutes}
                  onChange={(e) => setPickupMinutes(e.target.value)}
                  className="w-full p-2.5 text-xs border border-warm-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
                >
                  <option value="20">Within 20 Minutes (Immediate Van)</option>
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
                  value={claimMessage}
                  onChange={(e) => setClaimMessage(e.target.value)}
                  placeholder="e.g. Volunteer vehicle dispatched from Begumpet..."
                  className="w-full p-2.5 text-xs border border-warm-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowClaimModal(false)}
                  className="flex-1 py-2.5 border border-warm-300 text-gray-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingClaim}
                  className="flex-1 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-semibold hover:bg-brand-700"
                >
                  {submittingClaim ? 'Submitting...' : 'Confirm Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        donationId={donation.id}
        reportedUserId={donation.donor_id}
        title={`Report Listing #${donation.id}`}
      />
    </div>
  );
};

export default DonationDetails;

