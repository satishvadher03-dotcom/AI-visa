import React, { useState, useEffect } from 'react';
import {
  Lock,
  Upload,
  Download,
  Trash2,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  X,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import apiRequest from '../../services/api.js';
import { PrivateDocument, VisaApplication } from '../../types/index.js';

export const CustomerDocuments: React.FC = () => {
  const [documents, setDocuments] = useState<PrivateDocument[]>([]);
  const [applications, setApplications] = useState<VisaApplication[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedAppId, setSelectedAppId] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      const [docRes, appRes] = await Promise.all([
        apiRequest('/api/v1/customer/documents'),
        apiRequest('/api/v1/customer/applications'),
      ]);
      if (docRes.success && docRes.data) setDocuments(docRes.data);
      if (appRes.success && appRes.data) setApplications(appRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (selectedAppId) formData.append('applicationId', selectedAppId);

      const res = await apiRequest('/api/v1/customer/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.success) {
        setUploadModalOpen(false);
        setSelectedFile(null);
        setSelectedAppId('');
        await fetchDocuments();
      } else {
        setUploadError(res.error || 'Failed to upload document.');
      }
    } catch {
      setUploadError('Connection error during upload.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: string, originalName: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${originalName}" from your vault?`)) {
      return;
    }

    try {
      const res = await apiRequest(`/api/v1/customer/documents/${docId}`, {
        method: 'DELETE',
      });

      if (res.success) {
        await fetchDocuments();
      } else {
        alert(res.error || 'Could not delete document.');
      }
    } catch {
      alert('Delete request failed.');
    }
  };

  const handleDownload = (docId: string, filename: string) => {
    // Authenticated download endpoint
    window.open(`/api/v1/customer/documents/${docId}/download`, '_blank');
  };

  const getVerificationBadge = (status: string, notes?: string | null) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Verified by Specialist
          </span>
        );
      case 'REQUIRES_REUPLOAD':
        return (
          <span
            title={notes || 'Document unreadable or invalid'}
            className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 cursor-help"
          >
            <AlertCircle className="w-3 h-3 mr-1" />
            Re-upload Requested
          </span>
        );
      case 'REJECTED':
        return (
          <span
            title={notes || 'Document rejected'}
            className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 cursor-help"
          >
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
            <Clock className="w-3 h-3 mr-1 text-slate-400" />
            Pending Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-0.5">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Encrypted Document Vault
            </span>
            <span className="inline-flex items-center text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <ShieldCheck className="w-3 h-3 mr-1" />
              Isolated Storage
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Private Document Storage
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Store biometric photographs, passport scans, and bank proofs safely outside public web roots.
          </p>
        </div>

        <button
          onClick={() => {
            setUploadError(null);
            setUploadModalOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Documents Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-sm font-bold text-slate-900">Stored Private Documents ({documents.length})</h2>
          <p className="text-xs text-slate-500">
            All files are signed, hashed (SHA-256), and restricted to your account and assigned staff.
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading vault records...</div>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Lock className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">Your private vault is empty</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Upload your passport bio page, financial statements, or photographs for consultant audit.
            </p>
            <button
              onClick={() => setUploadModalOpen(true)}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
            >
              Upload First File
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3">Document Name</th>
                  <th className="px-6 py-3">Linked Dossier</th>
                  <th className="px-6 py-3">File Size</th>
                  <th className="px-6 py-3">Verification Status</th>
                  <th className="px-6 py-3">Uploaded Date</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block truncate max-w-xs">
                            {doc.originalName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {doc.mimeType}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-700">
                      {doc.application ? (
                        <div>
                          <span className="font-mono font-semibold block">
                            {doc.application.referenceNumber}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {doc.application.destinationCountry}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">General Traveler Document</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {Math.round(doc.fileSizeBytes / 1024)} KB
                    </td>

                    <td className="px-6 py-4">
                      {getVerificationBadge(doc.verificationStatus, doc.rejectionNotes)}
                      {doc.rejectionNotes && (
                        <p className="text-[10px] text-amber-700 mt-1 max-w-xs">
                          Specialist Note: {doc.rejectionNotes}
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4 text-slate-500">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleDownload(doc.id, doc.originalName)}
                          title="Secure Download"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id, doc.originalName)}
                          title="Delete from Vault"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Upload to Private Vault</h3>
              </div>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Select File (JPG, PNG, PDF up to 10MB) *
                </label>
                <input
                  type="file"
                  required
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => {
                    if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
                  }}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer bg-slate-50 border border-slate-300 rounded-xl p-2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Link to Visa Application (Optional)
                </label>
                <select
                  value={selectedAppId}
                  onChange={(e) => setSelectedAppId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  <option value="">-- General Profile Document --</option>
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.referenceNumber} - {app.destinationCountry}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
                <div className="font-semibold text-slate-700">Storage Protection Notice:</div>
                <p>
                  Files are stored in private directories with random unguessable server filenames. Access is authorized via session tokens only.
                </p>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying & Encrypting...</span>
                    </>
                  ) : (
                    <span>Upload to Vault</span>
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

export default CustomerDocuments;
