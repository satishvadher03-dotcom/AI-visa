import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, Clock, CheckCircle, X, Loader2 } from 'lucide-react';
import apiRequest from '../../services/api.js';
import { Enquiry } from '../../types/index.js';

export const CustomerEnquiries: React.FC = () => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    destinationCountry: 'United Arab Emirates',
    visaType: 'Tourist',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchEnquiries = async () => {
    try {
      const res = await apiRequest('/api/v1/customer/enquiries');
      if (res.success && res.data) {
        setEnquiries(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await apiRequest('/api/v1/enquiries', {
        method: 'POST',
        body: JSON.stringify({
          fullName: 'Customer Account',
          email: 'customer@auravisa.com',
          phone: '',
          nationality: 'India',
          ...formData,
        }),
      });

      if (res.success) {
        setModalOpen(false);
        setFormData({ destinationCountry: 'United Arab Emirates', visaType: 'Tourist', message: '' });
        await fetchEnquiries();
      }
    } catch {
      alert('Failed to submit enquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-0.5">
            Support Desk
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            My Enquiries & Advisory Tickets
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Official communications with AuraVisa immigration specialists
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Enquiry</span>
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading enquiries...</div>
        ) : enquiries.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
            <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No support enquiries created</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Have specific questions about visa regulations or require a customized quote? Open an advisory ticket.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
            >
              Submit First Enquiry
            </button>
          </div>
        ) : (
          enquiries.map((enq) => (
            <div
              key={enq.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">
                  Target: {enq.destinationCountry} ({enq.visaType})
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    enq.status === 'RESOLVED'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : enq.status === 'IN_PROGRESS'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {enq.status}
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {enq.message}
              </p>
              <div className="text-[10px] text-slate-400">
                Logged on {new Date(enq.createdAt).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Create Support Enquiry</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Destination Country
                </label>
                <input
                  type="text"
                  required
                  value={formData.destinationCountry}
                  onChange={(e) => setFormData({ ...formData, destinationCountry: e.target.value })}
                  placeholder="e.g. Dubai (UAE), UK, France"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Visa Category
                </label>
                <select
                  value={formData.visaType}
                  onChange={(e) => setFormData({ ...formData, visaType: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                >
                  <option value="Tourist">Tourist / Leisure</option>
                  <option value="Business">Business / Meeting</option>
                  <option value="Student">Student</option>
                  <option value="Transit">Transit</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Your Message or Question
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe your inquiry..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
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
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold"
                >
                  {submitting ? 'Transmitting...' : 'Send Enquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerEnquiries;
