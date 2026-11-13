import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Truck, 
  KeyRound, 
  Thermometer, 
  ArrowLeft, 
  Star,
  ShieldCheck,
  PackageCheck
} from 'lucide-react';
import { donationsApi, collectionsApi, feedbackReportsApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import OTPModal from '../components/OTPModal';

const STEPS = [
  { id: 'available', label: '1. Listed Available', desc: 'Surplus food published' },
  { id: 'requested', label: '2. NGO Requested', desc: 'Claim received' },
  { id: 'accepted', label: '3. Accepted by Donor', desc: 'OTP code generated' },
  { id: 'ready_for_pickup', label: '4. Ready for Pickup', desc: 'Food packed in containers' },
  { id: 'completed', label: '5. Handover Completed', desc: 'OTP verified & delivered' },
];

export const DonationTracking = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [donation, setDonation] = useState(null);
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOtpModal, setShowOtpModal] = useState(false);

  // Feedback form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const fetchTracking = async () => {
    try {
      setLoading(true);
      const [donRes, colRes] = await Promise.all([
        donationsApi.getById(id),
        collectionsApi.getDetails(id).catch(() => ({ data: null })),
      ]);
      setDonation(donRes.data);
      setCollection(colRes.data);
    } catch (err) {
      console.error('Error fetching tracking:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracking();
  }, [id]);

  const handleVerifyHandoff = async (payload) => {
    await collectionsApi.verifyHandoff(donation.id, payload);
    await fetchTracking();
  };

  const handleSendFeedback = async (e) => {
    e.preventDefault();
    if (!donation || !collection) return;
    setSubmittingFeedback(true);
    try {
      const recipientId = user.id === donation.donor_id ? collection.ngo_id : donation.donor_id;
      await feedbackReportsApi.submitFeedback({
        donation_id: donation.id,
        recipient_id: recipientId,
        rating,
        comment,
      });
      setFeedbackSent(true);
    } catch (err) {
      alert('Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!donation) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-warm-200 text-center">
        <p className="text-gray-700">Donation not found</p>
      </div>
    );
  }

  const getStepIndex = (status) => {
    if (status === 'available') return 0;
    if (status === 'requested') return 1;
    if (status === 'accepted') return 2;
    if (status === 'ready_for_pickup') return 3;
    if (['collected', 'completed'].includes(status)) return 4;
    return -1;
  };

  const currentStep = getStepIndex(donation.status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <Link
          to={`/donations/${donation.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-brand-700 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Donation Details
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-warm-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              Live Redistribution Tracker
            </span>
            <h1 className="text-2xl font-black text-gray-900 mt-2">{donation.title}</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Pickup Location: {donation.pickup_address}
            </p>
          </div>
          <StatusBadge status={donation.status} size="md" />
        </div>

        {/* Stepper Progress */}
        <div className="pt-6 border-t border-warm-100">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {STEPS.map((step, idx) => {
              const isPast = currentStep > idx;
              const isCurrent = currentStep === idx;

              return (
                <div
                  key={step.id}
                  className={`p-3.5 rounded-2xl border transition ${
                    isPast
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : isCurrent
                      ? 'bg-purple-50 border-purple-300 text-purple-900 shadow-sm ring-2 ring-purple-400/30'
                      : 'bg-warm-50 border-warm-200 text-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    {isPast ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : isCurrent ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse" />
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full bg-warm-300" />
                    )}
                    <span className="text-xs font-bold">{step.label}</span>
                  </div>
                  <p className="text-[10px] leading-tight opacity-80">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Handover OTP Box */}
      {collection && (
        <div className="bg-gradient-to-br from-purple-900 to-indigo-950 rounded-3xl p-8 text-white shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-300">
                <KeyRound className="w-4 h-4" /> Secure Physical Handoff Code
              </div>
              <h3 className="text-xl font-bold">Two-Way Verification Code</h3>
              <p className="text-xs text-purple-200">
                The volunteer presents this OTP to the donor upon arrival to confirm food inspection and custody transfer.
              </p>
            </div>

            <div className="text-center sm:text-right">
              <span className="text-4xl font-mono font-black tracking-widest bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 inline-block">
                {collection.verification_code}
              </span>
            </div>
          </div>

          {/* Action button if not yet completed */}
          {!collection.completed_at && (
            <div className="pt-4 border-t border-purple-800/80 flex items-center justify-between">
              <span className="text-xs text-purple-200">
                Both parties must visually inspect food containers before confirming.
              </span>
              <button
                onClick={() => setShowOtpModal(true)}
                className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition shadow"
              >
                Enter OTP & Complete Handoff
              </button>
            </div>
          )}

          {/* If completed, show logged safety metrics */}
          {collection.completed_at && (
            <div className="pt-4 border-t border-purple-800/80 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-purple-200">
              <div>
                <span className="block text-[11px] text-purple-300">Completed Timestamp:</span>
                <span className="font-bold text-white">
                  {new Date(collection.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div>
                <span className="block text-[11px] text-purple-300">Logged Temperature:</span>
                <span className="font-bold text-white">
                  {collection.temperature_check_celsius ? `${collection.temperature_check_celsius}°C` : 'N/A'}
                </span>
              </div>
              <div>
                <span className="block text-[11px] text-purple-300">Transport Method:</span>
                <span className="font-bold text-white">
                  {collection.transport_method || 'Standard Van'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Feedback Section (if completed) */}
      {donation.status === 'completed' && collection && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-warm-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-gray-900">
            Rate this Redistribution Experience
          </h3>
          <p className="text-xs text-gray-500">
            Share feedback about food packaging quality, timeliness, and hygiene to build trust across the network.
          </p>

          {feedbackSent ? (
            <div className="p-4 bg-brand-50 text-brand-800 border border-brand-200 rounded-2xl text-xs font-semibold">
              ✓ Thank you! Your feedback has been recorded.
            </div>
          ) : (
            <form onSubmit={handleSendFeedback} className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-700">Rating:</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition"
                  >
                    <Star className={`w-6 h-6 ${star <= rating ? 'fill-amber-400' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>

              <div>
                <textarea
                  rows={2}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share a short testimonial about this handover..."
                  className="w-full p-2.5 text-xs border border-warm-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submittingFeedback}
                className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition"
              >
                {submittingFeedback ? 'Submitting...' : 'Submit Rating & Review'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* OTP Modal */}
      {collection && (
        <OTPModal
          isOpen={showOtpModal}
          onClose={() => setShowOtpModal(false)}
          onVerify={handleVerifyHandoff}
          expectedCode={collection.verification_code}
          title="Verify Physical Handoff"
        />
      )}
    </div>
  );
};

export default DonationTracking;

