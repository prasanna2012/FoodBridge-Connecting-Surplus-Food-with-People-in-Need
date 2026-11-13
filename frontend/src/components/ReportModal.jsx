import React, { useState } from 'react';
import { X, AlertTriangle, Send } from 'lucide-react';
import { feedbackReportsApi } from '../api/client';

export const ReportModal = ({ isOpen, onClose, donationId = null, reportedUserId = null, title = "Report an Issue" }) => {
  const [reason, setReason] = useState('Improper food safety / hygiene packaging');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (details.trim().length < 10) {
      setError('Please provide at least 10 characters describing the issue.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await feedbackReportsApi.submitReport({
        donation_id: donationId,
        reported_user_id: reportedUserId,
        reason,
        details: details.trim(),
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-warm-200 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-warm-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-600 mt-1">
            FoodBridge takes food safety and platform integrity seriously. Reports are reviewed by administrators within 2 hours.
          </p>
        </div>

        {success ? (
          <div className="p-6 text-center text-emerald-700 bg-emerald-50 rounded-2xl border border-emerald-200">
            <p className="font-bold text-sm">Report Submitted Successfully</p>
            <p className="text-xs mt-1 text-emerald-600">Our safety response team will investigate immediately.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Reason for Report *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2.5 text-xs border border-warm-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
              >
                <option value="Improper food safety / hygiene packaging">Improper food safety / hygiene packaging</option>
                <option value="Food near or past expiry condition">Food near or past expiry condition</option>
                <option value="Unlisted allergens or inaccurate description">Unlisted allergens or inaccurate description</option>
                <option value="No-show or missed pickup window">No-show or missed pickup window</option>
                <option value="Suspected commercial resale violation">Suspected commercial resale violation</option>
                <option value="Other safety concern">Other safety concern</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Detailed Explanation *
              </label>
              <textarea
                rows={4}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe specifically what occurred and any immediate safety actions taken..."
                className="w-full p-3 text-xs border border-warm-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                required
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 border border-warm-300 text-gray-700 rounded-xl text-xs font-semibold hover:bg-warm-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 bg-amber-600 text-white rounded-xl text-xs font-semibold hover:bg-amber-700 disabled:opacity-50 transition flex items-center justify-center gap-1.5"
              >
                {loading ? 'Submitting...' : <><Send className="w-4 h-4" /> Submit Report</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReportModal;

