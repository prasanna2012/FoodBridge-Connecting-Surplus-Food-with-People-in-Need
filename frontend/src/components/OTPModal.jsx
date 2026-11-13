import React, { useState } from 'react';
import { X, KeyRound, Thermometer, Truck, CheckCircle2 } from 'lucide-react';

export const OTPModal = ({ isOpen, onClose, onVerify, expectedCode = null, title = "Handoff Verification" }) => {
  const [code, setCode] = useState('');
  const [temp, setTemp] = useState('');
  const [transport, setTransport] = useState('Insulated Food Delivery Vehicle');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.trim().length !== 6) {
      setError('Please enter the full 6-digit collection verification code.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onVerify({
        verification_code: code.trim(),
        temperature_check_celsius: temp ? parseFloat(temp) : null,
        transport_method: transport,
        notes: notes.trim() || null,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid verification code. Please check with donor/NGO.');
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
          <div className="w-14 h-14 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <KeyRound className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-600 mt-1">
            Enter the 6-digit handoff OTP code to verify collection and log safety checks.
          </p>
          {expectedCode && (
            <div className="mt-3 p-2.5 bg-brand-50 border border-brand-200 rounded-xl text-xs font-mono text-brand-800">
              Assigned Handoff Code: <span className="font-bold tracking-widest text-sm">{expectedCode}</span>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              6-Digit Handover OTP *
            </label>
            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 582194"
              className="w-full text-center tracking-widest text-2xl font-mono font-bold py-3 border border-warm-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              autoFocus
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Food Temp (°C)
              </label>
              <div className="relative">
                <Thermometer className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="number"
                  step="0.1"
                  value={temp}
                  onChange={(e) => setTemp(e.target.value)}
                  placeholder="e.g. 65"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-warm-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Transport Mode
              </label>
              <div className="relative">
                <Truck className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <select
                  value={transport}
                  onChange={(e) => setTransport(e.target.value)}
                  className="w-full pl-9 pr-2 py-2 text-xs border border-warm-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
                >
                  <option value="Insulated Food Vehicle">Insulated Van</option>
                  <option value="Refrigerated Van">Refrigerated Van</option>
                  <option value="Thermal Insulated Boxes">Thermal Crates</option>
                  <option value="Volunteer Two-Wheeler">Two-Wheeler Bag</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Handoff Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Inspected packaging seals, food warm and in hygienic state."
              className="w-full p-2.5 text-xs border border-warm-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
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
              disabled={loading || code.length !== 6}
              className="flex-1 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-semibold hover:bg-brand-700 disabled:opacity-50 transition flex items-center justify-center gap-1.5"
            >
              {loading ? (
                'Verifying...'
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Confirm Handoff
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OTPModal;

