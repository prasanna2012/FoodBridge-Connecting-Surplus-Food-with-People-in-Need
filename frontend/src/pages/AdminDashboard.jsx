import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Utensils, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Trash2, 
  Building2, 
  Heart,
  MessageSquare,
  Lock,
  Unlock
} from 'lucide-react';
import { adminApi, analyticsApi } from '../api/client';
import StatusBadge from '../components/StatusBadge';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('ngos'); // 'ngos', 'donations', 'reports', 'users'

  // Data states
  const [users, setUsers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Search & filters
  const [search, setSearch] = useState('');

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, donationsRes, reportsRes] = await Promise.all([
        analyticsApi.getOverview(),
        adminApi.getUsers(),
        adminApi.getDonations(),
        adminApi.getReports(),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setDonations(donationsRes.data);
      setReports(reportsRes.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // NGO Verification actions
  const handleVerifyNgo = async (ngoUserId, status, reason = null) => {
    setActionLoading(true);
    try {
      await adminApi.verifyNgo(ngoUserId, {
        verification_status: status,
        rejection_reason: reason,
      });
      await fetchAllData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update NGO verification');
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle user active status
  const handleToggleUser = async (userId) => {
    setActionLoading(true);
    try {
      await adminApi.toggleUserStatus(userId);
      await fetchAllData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to toggle user status');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete listing
  const handleDeleteDonation = async (donationId) => {
    if (!window.confirm('Are you sure you want to remove this donation listing for safety violation?')) return;
    setActionLoading(true);
    try {
      await adminApi.deleteDonation(donationId, 'Admin removed due to safety guidelines violation');
      await fetchAllData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to remove listing');
    } finally {
      setActionLoading(false);
    }
  };

  // Resolve Report
  const handleResolveReport = async (reportId, status) => {
    const notes = prompt('Enter resolution notes for this report:');
    if (!notes) return;
    setActionLoading(true);
    try {
      await adminApi.resolveReport(reportId, {
        status,
        admin_resolution_notes: notes,
      });
      await fetchAllData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to resolve report');
    } finally {
      setActionLoading(false);
    }
  };

  const pendingNgos = users.filter(
    (u) => u.role === 'ngo' && u.ngo_profile?.verification_status === 'pending'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-warm-200">
        <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
          Executive Operations
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
          Administrator Command Center
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Verify charity accreditations, audit platform safety, and monitor food redistribution activity.
        </p>
      </div>

      {/* Top Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-sm">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Total Rescues
            </span>
            <span className="text-2xl font-extrabold text-gray-900 mt-1 block">
              {stats.total_donations}
            </span>
            <span className="text-[11px] text-gray-500 mt-0.5 block">{stats.active_donations} active right now</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-sm">
            <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider block">
              Meals Delivered
            </span>
            <span className="text-2xl font-extrabold text-brand-700 mt-1 block">
              {stats.total_meals_saved}
            </span>
            <span className="text-[11px] text-brand-600 mt-0.5 block">{stats.total_kg_diverted} kg diverted</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-sm">
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">
              Pending Verifications
            </span>
            <span className="text-2xl font-extrabold text-amber-700 mt-1 block">
              {pendingNgos.length}
            </span>
            <span className="text-[11px] text-amber-600 mt-0.5 block">NGOs awaiting review</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-sm">
            <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">
              Flagged Reports
            </span>
            <span className="text-2xl font-extrabold text-rose-700 mt-1 block">
              {stats.open_reports}
            </span>
            <span className="text-[11px] text-rose-600 mt-0.5 block">Open safety flags</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-warm-200 pb-2">
        <button
          onClick={() => setActiveTab('ngos')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'ngos'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-warm-100 text-gray-600 hover:text-gray-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Pending NGO Verifications ({pendingNgos.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('donations')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'donations'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-warm-100 text-gray-600 hover:text-gray-900'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Listings Management ({donations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'reports'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-warm-100 text-gray-600 hover:text-gray-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Community Reports ({reports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'users'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-warm-100 text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>All Users ({users.length})</span>
        </button>
      </div>

      {/* TAB 1: Pending NGO Verifications */}
      {activeTab === 'ngos' && (
        <div className="space-y-4">
          {pendingNgos.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-warm-200 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-brand-600 mx-auto" />
              <h3 className="text-base font-bold text-gray-900">All NGOs Verified</h3>
              <p className="text-xs text-gray-500">
                There are no charity accounts currently pending verification.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingNgos.map((ngo) => {
                const profile = ngo.ngo_profile;
                return (
                  <div
                    key={ngo.id}
                    className="bg-white rounded-3xl p-6 border border-warm-200 shadow-sm space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                          Pending Verification
                        </span>
                        <span className="text-xs font-mono text-gray-400">ID #{ngo.id}</span>
                      </div>

                      <div>
                        <h4 className="text-lg font-bold text-gray-900">
                          {profile?.organization_name || ngo.full_name}
                        </h4>
                        <p className="text-xs text-gray-500">{ngo.email} &bull; {ngo.phone}</p>
                      </div>

                      <div className="p-3 bg-warm-50 rounded-2xl text-xs space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Registration Number:</span>
                          <span className="font-mono font-bold text-gray-900">{profile?.registration_number}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Daily Meal Capacity:</span>
                          <span className="font-semibold text-gray-900">{profile?.capacity_meals_per_day} meals</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Operational Areas:</span>
                          <span className="font-medium text-gray-900">{profile?.operating_areas || ngo.city}</span>
                        </div>
                      </div>

                      {profile?.mission_statement && (
                        <p className="text-xs text-gray-600 italic">
                          "{profile.mission_statement}"
                        </p>
                      )}
                    </div>

                    <div className="pt-4 border-t border-warm-100 flex gap-3">
                      <button
                        onClick={() => handleVerifyNgo(ngo.id, 'verified')}
                        disabled={actionLoading}
                        className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Approve & Verify
                      </button>

                      <button
                        onClick={() => {
                          const reason = prompt('Enter rejection reason:');
                          if (reason) handleVerifyNgo(ngo.id, 'rejected', reason);
                        }}
                        disabled={actionLoading}
                        className="px-4 py-2.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Listings Moderation */}
      {activeTab === 'donations' && (
        <div className="bg-white rounded-3xl border border-warm-200 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-warm-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Food Donation Listings</h3>
            <span className="text-xs text-gray-500">{donations.length} total entries</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-warm-50 text-gray-600 uppercase text-[10px] tracking-wider border-b border-warm-200">
                <tr>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Title & Category</th>
                  <th className="py-3 px-4">Donor</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Expiry</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100 text-gray-700">
                {donations.map((d) => (
                  <tr key={d.id} className="hover:bg-warm-50/50">
                    <td className="py-3 px-4 font-mono font-medium">#{d.id}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-gray-900 block">{d.title}</span>
                      <span className="text-[11px] text-gray-400 capitalize">{d.food_category.replace('_', ' ')}</span>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-800">{d.donor?.full_name}</td>
                    <td className="py-3 px-4 font-bold text-gray-900">{Number(d.quantity_value)} {d.quantity_unit}</td>
                    <td className="py-3 px-4 text-rose-600 font-medium">
                      {new Date(d.expiry_deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={d.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteDonation(d.id)}
                        disabled={actionLoading}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Remove Listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Community Reports */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-warm-200 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-brand-600 mx-auto" />
              <h3 className="text-base font-bold text-gray-900">Zero Flagged Reports</h3>
              <p className="text-xs text-gray-500">
                The community has reported no food safety or conduct concerns.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  className="bg-white rounded-2xl p-5 border border-warm-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                        {rep.reason}
                      </span>
                      <span className="text-xs text-gray-500">Reported by {rep.reporter?.full_name}</span>
                      <span className="text-[11px] text-gray-400 capitalize">&bull; Status: <strong>{rep.status}</strong></span>
                    </div>
                    <p className="text-xs text-gray-700 max-w-2xl">{rep.details}</p>
                    {rep.admin_resolution_notes && (
                      <p className="text-[11px] text-brand-700 font-medium">
                        Resolution Notes: {rep.admin_resolution_notes}
                      </p>
                    )}
                  </div>

                  {rep.status === 'open' && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleResolveReport(rep.id, 'resolved')}
                        disabled={actionLoading}
                        className="px-3 py-1.5 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition"
                      >
                        Resolve
                      </button>
                      <button
                        onClick={() => handleResolveReport(rep.id, 'dismissed')}
                        disabled={actionLoading}
                        className="px-3 py-1.5 bg-warm-100 text-gray-700 rounded-xl text-xs font-semibold hover:bg-warm-200 transition"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: All Users Directory */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-warm-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-warm-50 text-gray-600 uppercase text-[10px] tracking-wider border-b border-warm-200">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4">Verified</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100 text-gray-700">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-warm-50/50">
                    <td className="py-3 px-4">
                      <span className="font-bold text-gray-900 block">{u.full_name}</span>
                      <span className="text-[11px] text-gray-400">{u.email}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="capitalize font-semibold text-gray-800">{u.role}</span>
                    </td>
                    <td className="py-3 px-4 font-mono">{u.phone || '—'}</td>
                    <td className="py-3 px-4">{u.city || '—'}</td>
                    <td className="py-3 px-4">
                      {u.is_verified ? (
                        <span className="text-emerald-700 font-bold">✓ Verified</span>
                      ) : (
                        <span className="text-amber-600 font-medium">Pending</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {u.is_active ? (
                        <span className="text-emerald-600 font-semibold">Active</span>
                      ) : (
                        <span className="text-rose-600 font-semibold">Deactivated</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleUser(u.id)}
                          disabled={actionLoading}
                          className={`p-1.5 rounded-lg transition ${
                            u.is_active
                              ? 'text-rose-600 hover:bg-rose-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={u.is_active ? 'Deactivate User' : 'Activate User'}
                        >
                          {u.is_active ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

