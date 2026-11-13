import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Layers, 
  Clock, 
  Calendar, 
  Award, 
  FileText, 
  ArrowLeft,
  Sparkles,
  Search
} from 'lucide-react';
import { donationsApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

export const DonationHistory = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'completed', 'expired', 'cancelled'

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        // If donor, fetch my donations; otherwise general listings
        const res = await donationsApi.getAll({ status: '' });
        setDonations(res.data);
      } catch (err) {
        console.error('Error fetching history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const pastDonations = donations.filter((d) =>
    ['completed', 'collected', 'expired', 'cancelled'].includes(d.status)
  );

  const filtered = pastDonations.filter((d) => {
    if (filter === 'all') return true;
    return d.status === filter;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-warm-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Audit & Impact Log
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
            Donation Redistribution Records
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Historical archive of fulfilled donations, meal distribution logs, and environmental offsets.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-warm-100 rounded-2xl">
          {['all', 'completed', 'expired', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                filter === tab
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* History Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 bg-warm-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-warm-200 text-center space-y-2">
          <CheckCircle2 className="w-10 h-10 text-warm-300 mx-auto" />
          <h3 className="text-base font-bold text-gray-900">No records found</h3>
          <p className="text-xs text-gray-500">
            No donation records match the selected filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((d) => (
            <div
              key={d.id}
              className="bg-white rounded-2xl p-5 border border-warm-200 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <StatusBadge status={d.status} size="sm" />
                  <span className="text-[11px] font-mono text-gray-400">
                    Logged: {new Date(d.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <h3 className="text-base font-bold text-gray-900">
                  <Link to={`/donations/${d.id}`} className="hover:text-brand-600 transition">
                    {d.title}
                  </Link>
                </h3>

                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span className="font-semibold text-gray-800">
                    {Number(d.quantity_value)} {d.quantity_unit}
                  </span>
                  <span>&bull;</span>
                  <span className="capitalize">{d.food_category.replace('_', ' ')}</span>
                  <span>&bull;</span>
                  <span>{d.pickup_address}</span>
                </div>

                {d.cancellation_reason && (
                  <p className="text-xs text-rose-600 italic">
                    Reason: {d.cancellation_reason}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-warm-100 flex items-center justify-between text-xs">
                <Link
                  to={`/donations/${d.id}`}
                  className="font-semibold text-brand-700 hover:text-brand-800"
                >
                  View Details &rarr;
                </Link>

                {d.status === 'completed' && (
                  <Link
                    to={`/tracking/${d.id}`}
                    className="px-3 py-1 bg-brand-50 text-brand-800 rounded-lg font-bold"
                  >
                    View Rescue Certificate
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DonationHistory;

