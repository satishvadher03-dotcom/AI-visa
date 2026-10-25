import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileCheck,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Lock,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import apiRequest from '../../services/api.js';
import { VisaApplication } from '../../types/index.js';

export const ConsultantApplications: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [cases, setCases] = useState<VisaApplication[]>([]);
  const [activeCase, setActiveCase] = useState<VisaApplication | null>(null);
  const [loading, setLoading] = useState(true);

  // Status update state
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [statusReason, setStatusReason] = useState<string>('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Note state
  const [noteText, setNoteText] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  // Document verification modal state
  const [verifyingDocId, setVerifyingDocId] = useState<string | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<string>('VERIFIED');
  const [verifyNotes, setVerifyNotes] = useState<string>('');
  const [savingDocVerify, setSavingDocVerify] = useState(false);

  const fetchCases = async () => {
    try {
      const res = await apiRequest('/api/v1/consultant/assigned-cases');
      if (res.success && res.data) {
        setCases(res.data);

        const targetId = searchParams.get('id');
        if (targetId) {
          loadSingleCase(targetId);
        } else if (res.data.length > 0) {
          loadSingleCase(res.data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadSingleCase = async (id: string) => {
    try {
      const res = await apiRequest(`/api/v1/consultant/applications/${id}`);
      if (res.success && res.data) {
        setActiveCase(res.data);
        setSelectedStatus(res.data.status);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCase) return;

    setUpdatingStatus(true);
    try {
      const res = await apiRequest(`/api/v1/consultant/applications/${activeCase.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: selectedStatus,
          reason: statusReason || undefined,
        }),
      });

      if (res.success) {
        setStatusReason('');
        await loadSingleCase(activeCase.id);
        await fetchCases();
      } else {
        alert(res.error || 'Failed to update status.');
      }
    } catch {
      alert('Error updating status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCase || !noteText.trim()) return;

    setSubmittingNote(true);
    try {
      const res = await apiRequest(`/api/v1/consultant/applications/${activeCase.id}/notes`, {
        method: 'POST',
        body: JSON.stringify({
          noteText: noteText.trim(),
          isConfidential: true,
        }),
      });

      if (res.success) {
        setNoteText('');
        await loadSingleCase(activeCase.id);
      } else {
        alert(res.error || 'Failed to add note.');
      }
    } catch {
      alert('Error recording note.');
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleSaveDocVerification = async () => {
    if (!verifyingDocId) return;

    setSavingDocVerify(true);
    try {
      const res = await apiRequest(`/api/v1/consultant/documents/${verifyingDocId}/verify`, {
        method: 'PATCH',
        body: JSON.stringify({
          verificationStatus: verifyStatus,
          rejectionNotes: verifyNotes || undefined,
        }),
      });

      if (res.success && activeCase) {
        setVerifyingDocId(null);
        setVerifyNotes('');
        await loadSingleCase(activeCase.id);
      } else {
        alert(res.error || 'Verification update failed.');
      }
    } catch {
      alert('Failed to update document verification.');
    } finally {
      setSavingDocVerify(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-0.5">
          Compliance & Case Audit Desk
        </span>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Assigned Application Verification
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Authorized document downloads, biometric review, status transitions, and confidential casework notes
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cases List Sidebar */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs h-fit">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              Active Cases ({cases.length})
            </span>
          </div>

          {loading ? (
            <div className="p-6 text-center text-xs text-slate-400">Loading cases...</div>
          ) : cases.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">No cases assigned</div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {cases.map((c) => {
                const isActive = activeCase?.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => loadSingleCase(c.id)}
                    className={`w-full text-left p-4 transition cursor-pointer ${
                      isActive ? 'bg-blue-50/70 border-l-4 border-blue-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {c.referenceNumber}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white border border-slate-200 text-slate-700">
                        {c.status}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-800">
                      {c.customer?.profile?.firstName} {c.customer?.profile?.lastName}
                    </div>
                    <div className="text-[11px] text-slate-500">{c.destinationCountry}</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Detailed Case Work Desk */}
        <div className="lg:col-span-2 space-y-6">
          {activeCase ? (
            <>
              {/* Dossier Header Info */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <span className="font-mono text-xs font-bold text-blue-600 block">
                      Ref: {activeCase.referenceNumber}
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                      {activeCase.visaProgram?.title || activeCase.destinationCountry}
                    </h2>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 self-start sm:self-auto">
                    Status: {activeCase.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Applicant Name
                    </span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">
                      {activeCase.customer?.profile?.firstName} {activeCase.customer?.profile?.lastName}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Passport Number
                    </span>
                    <span className="font-mono font-semibold text-slate-800 mt-0.5 block">
                      {activeCase.customer?.profile?.passportNumber || 'Pending'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Nationality
                    </span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">
                      {activeCase.customer?.profile?.nationality || 'India'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Target Travel Date
                    </span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">
                      {activeCase.travelDate ? new Date(activeCase.travelDate).toLocaleDateString() : 'Not Set'}
                    </span>
                  </div>
                </div>

                {activeCase.applicantNotes && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700">
                    <span className="font-bold text-slate-900 block mb-0.5">Applicant Disclosures:</span>
                    <p>{activeCase.applicantNotes}</p>
                  </div>
                )}
              </div>

              {/* Private Document Audit Section */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Uploaded Private Documents ({activeCase.documents?.length || 0})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Download and verify biometric photographs, passport scans, and statements
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center">
                    <Lock className="w-3 h-3 mr-1" />
                    Authorized Access Only
                  </span>
                </div>

                {!activeCase.documents || activeCase.documents.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    No documents uploaded by applicant yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeCase.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="font-bold text-slate-900 flex items-center space-x-2">
                            <span>{doc.originalName}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                doc.verificationStatus === 'VERIFIED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : doc.verificationStatus === 'REQUIRES_REUPLOAD'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {doc.verificationStatus}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {doc.mimeType} • {Math.round(doc.fileSizeBytes / 1024)} KB • Uploaded on{' '}
                            {new Date(doc.uploadedAt).toLocaleDateString()}
                          </div>
                          {doc.rejectionNotes && (
                            <p className="text-[11px] text-red-600 font-medium">
                              Audit Note: {doc.rejectionNotes}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <a
                            href={`/api/v1/consultant/documents/${doc.id}/download`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg font-semibold flex items-center space-x-1 transition"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => {
                              setVerifyingDocId(doc.id);
                              setVerifyStatus(doc.verificationStatus || 'VERIFIED');
                              setVerifyNotes(doc.rejectionNotes || '');
                            }}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition cursor-pointer"
                          >
                            Verify / Audit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Update Form */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Advance Case Status</h3>
                <form onSubmit={handleStatusUpdate} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                        Application Status
                      </label>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-semibold"
                      >
                        <option value="UNDER_REVIEW">UNDER_REVIEW (Auditing documents)</option>
                        <option value="DOCUMENTS_REQUESTED">DOCUMENTS_REQUESTED (Action required)</option>
                        <option value="PROCESSING">PROCESSING (Submitted to Gov portal)</option>
                        <option value="APPROVED">APPROVED (e-Visa granted)</option>
                        <option value="REJECTED">REJECTED (Consular refusal)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                        Reason / Progress Note
                      </label>
                      <input
                        type="text"
                        value={statusReason}
                        onChange={(e) => setStatusReason(e.target.value)}
                        placeholder="e.g. Passport validity verified, forwarded to ICP UAE"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={updatingStatus}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      {updatingStatus ? 'Updating...' : 'Commit Status Update'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Confidential Internal Notes */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900">
                  Confidential Internal Case Notes (Staff Only)
                </h3>

                <form onSubmit={handleAddNote} className="space-y-2">
                  <textarea
                    rows={2}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Record private case findings, flight reservation verifications, or compliance remarks..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingNote || !noteText.trim()}
                      className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold disabled:opacity-50 cursor-pointer"
                    >
                      {submittingNote ? 'Saving...' : 'Add Internal Note'}
                    </button>
                  </div>
                </form>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  {activeCase.caseNotes && activeCase.caseNotes.length > 0 ? (
                    activeCase.caseNotes.map((note) => (
                      <div
                        key={note.id}
                        className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="font-semibold text-slate-700">
                            {note.author?.profile?.firstName} {note.author?.profile?.lastName} (
                            {note.author?.role})
                          </span>
                          <span>{new Date(note.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-800">{note.noteText}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">No internal case notes recorded.</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-xs text-slate-500">
              Select an applicant case from the left queue to open verification desk.
            </div>
          )}
        </div>
      </div>

      {/* Document Verification Modal */}
      {verifyingDocId && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Audit Document Compliance</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Verification Decision
                </label>
                <select
                  value={verifyStatus}
                  onChange={(e) => setVerifyStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                >
                  <option value="VERIFIED">VERIFIED (Meets government standards)</option>
                  <option value="REQUIRES_REUPLOAD">REQUIRES_REUPLOAD (Blurry, wrong format, or cropped)</option>
                  <option value="REJECTED">REJECTED (Non-compliant document)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Feedback Note for Applicant
                </label>
                <textarea
                  rows={3}
                  value={verifyNotes}
                  onChange={(e) => setVerifyNotes(e.target.value)}
                  placeholder="e.g. Please provide a clear color scan with all 4 corners visible and at least 6 months validity..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setVerifyingDocId(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveDocVerification}
                  disabled={savingDocVerify}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold"
                >
                  {savingDocVerify ? 'Saving...' : 'Save Audit Decision'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultantApplications;
