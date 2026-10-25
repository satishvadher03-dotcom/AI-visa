import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, CheckCircle, XCircle, User, Loader2 } from 'lucide-react';
import apiRequest from '../../services/api.js';
import { Appointment } from '../../types/index.js';

export const ConsultantAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const res = await apiRequest('/api/v1/consultant/appointments');
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

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await apiRequest(`/api/v1/consultant/appointments/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      if (res.success) {
        await fetchAppointments();
      }
    } catch {
      alert('Failed to update appointment status.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-0.5">
          Schedule Management
        </span>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Assigned Consultations & Hearings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Direct video meetings and pre-submission document review calls with applicants
        </p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-xs text-slate-500">
            No consultations currently scheduled on your calendar.
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
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
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
                  {apt.customer?.profile ? `${apt.customer.profile.firstName} ${apt.customer.profile.lastName}` : apt.customer?.email}
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
                {apt.meetingLink && apt.status === 'SCHEDULED' && (
                  <a
                    href={apt.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-xs"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Launch Video Room</span>
                  </a>
                )}
                {apt.status === 'SCHEDULED' && (
                  <button
                    onClick={() => handleUpdateStatus(apt.id, 'COMPLETED')}
                    className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    Mark Completed
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConsultantAppointments;
