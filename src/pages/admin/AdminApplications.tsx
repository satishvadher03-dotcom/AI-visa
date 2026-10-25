import React, { useState, useEffect } from 'react';
import {
  FileText,
  Users,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
  X,
  Loader2,
  CheckCircle2,
  Download,
} from 'lucide-react';
import apiRequest from '../../services/api.js';
import { VisaApplication } from '../../types/index.js';

export const AdminApplications: React.FC = () => {
  const [applications, setApplications] = useState<VisaApplication[]>([]);
  const [consultants, setConsultants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Assignment Modal
  const [assigningApp, setAssigningApp] = useState<VisaApplication | null>(null);
  const [selectedConsultantId, setSelectedConsultantId] = useState('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [savingAssignment, setSavingAssignment] = useState(false);

  // Status Override Modal
  const [overrideApp, setOverrideApp] = useState<VisaApplication | null>(null);
  const [newStatus, setNewStatus] = useState('APPROVED');
  const [overrideReason, setOverrideReason] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);

  const fetchApplications = async () => {
    try {
      let url = '/api/v1/admin/applications?';
      if (statusFilter !== 'ALL') url += `status=${statusFilter}&`;
      if (search) url += `search=${encodeURIComponent(search)}&`;

      const res = await apiRequest(url);
      if (res.success && res.data) {
        setApplications(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();

    async function loadConsultants() {
      const res = await apiRequest('/api/v1/admin/consultants');
      if (res.success && res.data) {
        setConsultants(res.data);
        if (res.data[0]) setSelectedConsultantId(res.data[0].id);
      }
    }
    loadConsultants();
  }, [statusFilter]);

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningApp || !selectedConsultantId) return;

    setSavingAssignment(true);
    try {
      const res = await apiRequest(`/api/v1/admin/applications/${assigningApp.id}/assign`, {
        method: 'POST',
        body: JSON.stringify({
          consultantId: selectedConsultantId,
          notes: assignmentNotes || undefined,
        }),
      });

      if (res.success) {
        setAssigningApp(null);
        setAssignmentNotes('');
        await fetchApplications();
      } else {
        alert(res.error || 'Failed to assign case.');
      }
    } catch {
      alert('Assignment request failed.');
    } finally {
      setSavingAssignment(false);
    }
  };

  const handleStatusOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideApp) return;

    setSavingStatus(true);
    try {
      const res = await apiRequest(`/api/v1/admin/applications/${overrideApp.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: newStatus,
          reason: overrideReason || 'Executive admin override',
        }),
      });

      if (res.success) {
        setOverrideApp(null);
        setOverrideReason('');
        await fetchApplications();
      } else {
        alert(res.error || 'Failed to override status.');
      }
    } catch {
      alert('Status override failed.');
    } finally {
      setSavingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-red-600 uppercase tracking-wider block mb-0.5">
            System Operations
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            All System Visa Applications ({applications.length})
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Reassign cases to consultants, audit document submissions, and perform executive status overrides
          </p>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchApplications()}
            placeholder="Search by reference number, destination, or customer email..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-semibold"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">SUBMITTED</option>
            <option value="UNDER_REVIEW">UNDER_REVIEW</option>
            <option value="DOCUMENTS_REQUESTED">DOCUMENTS_REQUESTED</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading cases...</div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No applications match query.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3">Reference & Program</th>
                  <th className="px-6 py-3">Applicant Details</th>
                  <th className="px-6 py-3">Assigned Consultant</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Submission Date</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-slate-900 block">
                        {app.referenceNumber}
                      </span>
                      <span className="text-slate-600 font-semibold">
                        {app.visaProgram?.title || app.destinationCountry}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-800 block">
                        {app.customer?.profile?.firstName} {app.customer?.profile?.lastName}
                      </span>
                      <span className="text-[11px] text-slate-400">{app.customer?.email}</span>
                    </td>

                    <td className="px-6 py-4">
                      {app.assignments?.[0]?.consultant ? (
                        <div className="text-slate-700">
                          <span className="font-semibold block">
                            {app.assignments[0].consultant.profile?.firstName}{' '}
                            {app.assignments[0].consultant.profile?.lastName}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {app.assignments[0].consultant.email}
                          </span>
                        </div>
                      ) : (
                        <span className="text-amber-600 font-semibold text-[11px]">Unassigned</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                        {app.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-400">
                      {new Date(app.submissionDate).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => {
                            setAssigningApp(app);
                            if (app.assignments?.[0]?.consultantId) {
                              setSelectedConsultantId(app.assignments[0].consultantId);
                            }
                          }}
                          className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-semibold transition cursor-pointer"
                        >
                          Assign Desk
                        </button>
                        <button
                          onClick={() => {
                            setOverrideApp(app);
                            setNewStatus(app.status);
                          }}
                          className="px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg font-semibold transition cursor-pointer"
                        >
                          Override
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reassign Consultant Modal */}
      {assigningApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Assign Case to Consultant Desk</h3>
              <button
                onClick={() => setAssigningApp(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5 uppercase font-bold text-[10px]">
                  Application Reference
                </span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {assigningApp.referenceNumber}
                </span>
                <span className="text-slate-600 block text-xs">
                  Applicant: {assigningApp.customer?.email}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Select Active Consultant *
                </label>
                <select
                  required
                  value={selectedConsultantId}
                  onChange={(e) => setSelectedConsultantId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                >
                  {consultants.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.email}) — {c.activeCasesCount} active cases
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Assignment Directives / Instructions
                </label>
                <textarea
                  rows={3}
                  value={assignmentNotes}
                  onChange={(e) => setAssignmentNotes(e.target.value)}
                  placeholder="e.g. Expedited case. Please audit passport and initiate ICP submission within 24 hours."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAssigningApp(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAssignment}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold"
                >
                  {savingAssignment ? 'Delegating...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Override Status Modal */}
      {overrideApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Executive Status Override</h3>
              <button
                onClick={() => setOverrideApp(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStatusOverride} className="space-y-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5 uppercase font-bold text-[10px]">
                  Case Ref: {overrideApp.referenceNumber}
                </span>
                <span className="text-slate-700">Current Status: {overrideApp.status}</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                >
                  <option value="SUBMITTED">SUBMITTED</option>
                  <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                  <option value="DOCUMENTS_REQUESTED">DOCUMENTS_REQUESTED</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="REJECTED">REJECTED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Audit Reason for Override
                </label>
                <input
                  type="text"
                  required
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g. Visa grant issued directly on consulate portal"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setOverrideApp(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingStatus}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold"
                >
                  {savingStatus ? 'Overriding...' : 'Save Override'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApplications;
