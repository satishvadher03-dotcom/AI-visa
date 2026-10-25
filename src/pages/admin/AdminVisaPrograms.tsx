import React, { useState, useEffect } from 'react';
import { Globe2, Plus, Edit2, Trash2, CheckCircle, ExternalLink, X, Loader2 } from 'lucide-react';
import apiRequest from '../../services/api.js';
import { VisaProgram } from '../../types/index.js';

export const AdminVisaPrograms: React.FC = () => {
  const [programs, setPrograms] = useState<VisaProgram[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<VisaProgram | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    country: '',
    countryCode: '',
    flagEmoji: '🌐',
    category: 'TOURIST',
    flow: 'INDIA_TO_WORLD',
    processingTime: '3-5 Business Days',
    validity: '30 Days',
    entryType: 'Single Entry',
    feeAmount: '50',
    feeCurrency: 'USD',
    officialPortalUrl: '',
    description: '',
    eligibilitySummary: '',
    isPopular: false,
  });

  const fetchPrograms = async () => {
    try {
      const res = await apiRequest('/api/v1/admin/visa-programs');
      if (res.success && res.data) {
        setPrograms(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const openCreateModal = () => {
    setEditingProgram(null);
    setFormData({
      title: '',
      country: '',
      countryCode: '',
      flagEmoji: '🌐',
      category: 'TOURIST',
      flow: 'INDIA_TO_WORLD',
      processingTime: '3-5 Business Days',
      validity: '30 Days',
      entryType: 'Single Entry',
      feeAmount: '50',
      feeCurrency: 'USD',
      officialPortalUrl: '',
      description: '',
      eligibilitySummary: '',
      isPopular: false,
    });
    setModalOpen(true);
  };

  const openEditModal = (p: VisaProgram) => {
    setEditingProgram(p);
    setFormData({
      title: p.title,
      country: p.country,
      countryCode: p.countryCode,
      flagEmoji: p.flagEmoji,
      category: p.category,
      flow: p.flow,
      processingTime: p.processingTime,
      validity: p.validity,
      entryType: p.entryType,
      feeAmount: p.feeAmount.toString(),
      feeCurrency: p.feeCurrency,
      officialPortalUrl: p.officialPortalUrl,
      description: p.description,
      eligibilitySummary: p.eligibilitySummary,
      isPopular: p.isPopular,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const endpoint = editingProgram
        ? `/api/v1/admin/visa-programs/${editingProgram.id}`
        : '/api/v1/admin/visa-programs';
      const method = editingProgram ? 'PUT' : 'POST';

      const res = await apiRequest(endpoint, {
        method,
        body: JSON.stringify(formData),
      });

      if (res.success) {
        setModalOpen(false);
        await fetchPrograms();
      } else {
        alert(res.error || 'Failed to save visa program.');
      }
    } catch {
      alert('Error saving visa program.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to remove or deactivate "${title}"?`)) return;

    try {
      const res = await apiRequest(`/api/v1/admin/visa-programs/${id}`, {
        method: 'DELETE',
      });
      if (res.success) {
        await fetchPrograms();
      }
    } catch {
      alert('Failed to delete program.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-red-600 uppercase tracking-wider block mb-0.5">
            Knowledge Base Governance
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Visa Programs & Regulatory Database ({programs.length})
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Grounded official sovereign sources that power AI responses, checklists, and application dossiers
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Visa Program</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-8 text-center text-xs text-slate-400">Loading catalog...</div>
        ) : (
          programs.map((p) => (
            <div
              key={p.id}
              className={`bg-white border rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4 ${
                p.isActive ? 'border-slate-200' : 'border-slate-200 opacity-60 bg-slate-50'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{p.flagEmoji}</span>
                  <div className="flex space-x-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {p.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{p.title}</h3>
                  <span className="text-xs text-blue-600 font-semibold">{p.country}</span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Processing</span>
                    <span className="font-semibold">{p.processingTime}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Fee</span>
                    <span className="font-semibold">
                      {p.feeCurrency} {p.feeAmount}
                    </span>
                  </div>
                </div>

                <a
                  href={p.officialPortalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-blue-600 hover:underline flex items-center font-medium"
                >
                  <span className="truncate">Official Gov Portal</span>
                  <ExternalLink className="w-3 h-3 ml-1 shrink-0" />
                </a>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => openEditModal(p)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(p.id, p.title)}
                  className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Program Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 border border-slate-200 shadow-xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {editingProgram ? 'Edit Visa Program' : 'Create New Visa Program'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">Program Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Dubai 30-Day Single Entry Tourist eVisa"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Country Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="e.g. United Arab Emirates"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Country Code</label>
                    <input
                      type="text"
                      value={formData.countryCode}
                      onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                      placeholder="AE"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Flag Emoji</label>
                    <input
                      type="text"
                      value={formData.flagEmoji}
                      onChange={(e) => setFormData({ ...formData, flagEmoji: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Visa Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                  >
                    <option value="TOURIST">TOURIST</option>
                    <option value="BUSINESS">BUSINESS</option>
                    <option value="STUDENT">STUDENT</option>
                    <option value="TRANSIT">TRANSIT</option>
                    <option value="WORK">WORK</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Travel Flow</label>
                  <select
                    value={formData.flow}
                    onChange={(e) => setFormData({ ...formData, flow: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                  >
                    <option value="INDIA_TO_WORLD">INDIA_TO_WORLD (Outbound)</option>
                    <option value="WORLD_TO_INDIA">WORLD_TO_INDIA (Inbound)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Processing Time</label>
                  <input
                    type="text"
                    value={formData.processingTime}
                    onChange={(e) => setFormData({ ...formData, processingTime: e.target.value })}
                    placeholder="e.g. 24-72 Hours"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Validity / Stay</label>
                  <input
                    type="text"
                    value={formData.validity}
                    onChange={(e) => setFormData({ ...formData, validity: e.target.value })}
                    placeholder="e.g. 30 Days from entry"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Government Fee Amount</label>
                  <input
                    type="number"
                    value={formData.feeAmount}
                    onChange={(e) => setFormData({ ...formData, feeAmount: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Fee Currency</label>
                  <input
                    type="text"
                    value={formData.feeCurrency}
                    onChange={(e) => setFormData({ ...formData, feeCurrency: e.target.value })}
                    placeholder="USD"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 uppercase"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">
                    Official Government Portal URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.officialPortalUrl}
                    onChange={(e) => setFormData({ ...formData, officialPortalUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">Eligibility Criteria</label>
                  <textarea
                    rows={2}
                    value={formData.eligibilitySummary}
                    onChange={(e) => setFormData({ ...formData, eligibilitySummary: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Visa Program'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVisaPrograms;
