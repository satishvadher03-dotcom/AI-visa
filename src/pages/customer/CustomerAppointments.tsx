import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, CheckCircle, XCircle, Plus, AlertCircle, ExternalLink } from 'lucide-react';
import apiRequest from '../../services/api.js';
import { Appointment } from '../../types/index.js';
import BookAppointmentModal from '../../components/common/BookAppointmentModal.js';

export const CustomerAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchAppointments = async () => {
    try {
      const res = await apiRequest('/api/v1/customer/appointments');
      if (res.success && res.data) {
        setAppointments(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you wish to cancel this scheduled consultation?')) return;

    try {
      const res = await apiRequest(`/api/v1/customer/appointments/${id}/cancel`, {
        method: 'PATCH',
      });
      if (res.success) {
        await fetchAppointments();
      }
    } catch {
      alert('Failed to cancel appointment.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-0.5">
            Advisory Sessions
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Consultation Appointments
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Video consultations and document verification sessions with accredited visa consultants
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Book New Session</span>
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No appointments scheduled</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Need assistance with complex travel history, Schengen visa insurance, or Dubai express approvals? Book a 1-on-1 specialist session.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
            >
              Schedule Consultation
            </button>
          </div>
        ) : (
          appointments.map((apt) => (
            <div
              key={apt.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-slate-900">
                    {apt.referenceNumber}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                      apt.status === 'SCHEDULED'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : apt.status === 'COMPLETED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {apt.status}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {apt.serviceType.replace('_', ' ')}
                </div>
                <div className="text-xs text-slate-500 flex items-center space-x-3">
                  <span className="flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {apt.appointmentDate}
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {apt.timeSlot}
                  </span>
                </div>
                {apt.notes && <p className="text-xs text-slate-600 pt-1">Notes: {apt.notes}</p>}
              </div>

              <div className="flex items-center space-x-2 self-start md:self-center">
                {apt.status === 'SCHEDULED' && apt.meetingLink && (
                  <a
                    href={apt.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-xs"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Join Meeting Room</span>
                  </a>
                )}
                {apt.status === 'SCHEDULED' && (
                  <button
                    onClick={() => handleCancel(apt.id)}
                    className="px-3 py-2 border border-slate-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-600 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <BookAppointmentModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          fetchAppointments();
        }}
      />
    </div>
  );
};

export default CustomerAppointments;
