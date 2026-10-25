import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  X,
  Loader2,
  Calendar,
  Lock,
  ExternalLink,
} from 'lucide-react';
import apiRequest from '../../services/api.js';
import { VisaApplication, VisaProgram } from '../../types/index.js';

export const CustomerApplications: React.FC = () => {
  const [applications, setApplications] = useState<VisaApplication[]>([]);
  const [visaPrograms, setVisaPrograms] = useState<VisaProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<VisaApplication | null>(null);

  // New Application Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [applicantNotes, setApplicantNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      const res = await apiRequest('/api/v1/customer/applications');
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

    async function loadPrograms() {
      const res = await apiRequest('/api/v1/visa-programs');
      if (res.success && res.data) {
        setVisaPrograms(res.data);
        if (res.data[0]) setSelectedProgramId(res.data[0].id);
      }
    }
    loadPrograms();
  }, []);

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError(null);

    try {
      const res = await apiRequest('/api/v1/customer/applications', {
        method: 'POST',
        body: JSON.stringify({
          visaProgramId: selectedProgramId,
          travelDate: travelDate || undefined,
          applicantNotes: applicantNotes || undefined,
        }),
      });

      if (res.success) {
        setIsModalOpen(false);
        setTravelDate('');
        setApplicantNotes('');
        await fetchApplications();
      } else {
        setModalError(res.error || 'Failed to submit application.');
      }
    } catch {
      setModalError('Connection error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Approved
          </span>
        );
      case 'UNDER_REVIEW':
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            {status.replace('_', ' ')}
          </span>
        );
      case 'DOCUMENTS_REQUESTED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            Action Required: Upload Missing Documents
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-0.5">
            Dossier Tracker
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            My Visa Applications
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time status updates, assigned specialist notes, and verified audit history
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Application Dossier</span>
        </button>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading your applications...</div>
        ) : applications.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No applications on file</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Ready to travel? Select a destination from our catalog to begin your document verification.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
            >
              Start First Application
            </button>
          </div>
        ) : (
          applications.map((app) => {
            const isExpanded = selectedApp?.id === app.id;
            return (
              <div
                key={app.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs transition"
              >
                {/* Main Summary Row */}
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {app.referenceNumber}
                      </span>
                      {getStatusBadge(app.status)}
                    </div>
                    <div className="text-sm font-bold text-slate-900">
                      {app.visaProgram?.title || app.destinationCountry}
                    </div>
                    <div className="text-xs text-slate-500">
                      Submitted on {new Date(app.submissionDate).toLocaleDateString()} • Destination:{' '}
                      {app.destinationCountry}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setSelectedApp(isExpanded ? null : app)}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center space-x-1"
                    >
                      <span>{isExpanded ? 'Hide Details' : 'View History & Status'}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/50 space-y-4 text-xs">
                    {/* Status History Timeline */}
                    <div>
                      <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2">
                        Audit Trail & Status Progression
                      </h4>
                      {app.statusHistory && app.statusHistory.length > 0 ? (
                        <div className="space-y-2 border-l-2 border-blue-500 ml-2 pl-3 py-1">
                          {app.statusHistory.map((hist, idx) => (
                            <div key={idx} className="relative">
                              <div className="text-xs font-semibold text-slate-800">
                                Status: <span className="text-blue-600">{hist.newStatus}</span>
                              </div>
                              <p className="text-slate-500 text-[11px]">{hist.changeReason}</p>
                              <span className="text-[10px] text-slate-400">
                                {new Date(hist.createdAt).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-500">No status changes recorded yet.</p>
                      )}
                    </div>

                    {/* Consultant Assignment */}
                    {app.assignments?.[0]?.consultant && (
                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">
                          Assigned Case Specialist
                        </span>
                        <div className="font-semibold text-slate-900 mt-0.5">
                          {app.assignments[0].consultant.profile?.firstName}{' '}
                          {app.assignments[0].consultant.profile?.lastName}
                        </div>
                        <span className="text-slate-500 text-[11px]">
                          Notes: {app.assignments[0].notes || 'Reviewing submitted credentials'}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* New Application Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">New Visa Application Dossier</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateApplication} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Select Visa Program *
                </label>
                <select
                  required
                  value={selectedProgramId}
                  onChange={(e) => setSelectedProgramId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  {visaPrograms.map((prog) => (
                    <option key={prog.id} value={prog.id}>
                      {prog.flagEmoji} {prog.title} ({prog.feeCurrency} {prog.feeAmount})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Target Travel Date
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Applicant Notes / Travel Particulars
                </label>
                <textarea
                  rows={3}
                  value={applicantNotes}
                  onChange={(e) => setApplicantNotes(e.target.value)}
                  placeholder="Mention flight reservations, purpose of trip, or special processing requests..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating Dossier...</span>
                    </>
                  ) : (
                    <span>Submit Dossier</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerApplications;
