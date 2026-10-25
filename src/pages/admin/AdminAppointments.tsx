import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, User, CheckCircle, XCircle } from 'lucide-react';
import apiRequest from '../../services/api.js';
import { Appointment } from '../../types/index.js';

export const AdminAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAppointments() {
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
    }
    loadAppointments();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <span className="text-xs font-bold text-red-600 uppercase tracking-wider block mb-0.5">
          Consultation Oversight
        </span>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          System-Wide Consultation Appointments ({appointments.length})
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor video hearing sessions across all consultants and prevent calendar bottlenecks
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No scheduled appointments.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3">Reference & Service</th>
                  <th className="px-6 py-3">Applicant Email</th>
                  <th className="px-6 py-3">Assigned Officer</th>
                  <th className="px-6 py-3">Date & Slot</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Meeting Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-slate-900 block">
                        {apt.referenceNumber}
                      </span>
                      <span className="text-slate-600">{apt.serviceType.replace('_', ' ')}</span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-800 block">
                        {apt.customer?.profile ? `${apt.customer.profile.firstName} ${apt.customer.profile.lastName}` : apt.customer?.email}
                      </span>
                      <span className="text-[11px] text-slate-400">{apt.customer?.email}</span>
                    </td>

                    <td className="px-6 py-4 text-slate-700">
                      {apt.consultant ? (
                        <div>
                          <span className="font-semibold block">
                            {apt.consultant.profile?.firstName} {apt.consultant.profile?.lastName}
                          </span>
                          <span className="text-[10px] text-slate-400">{apt.consultant.email}</span>
                        </div>
                      ) : (
                        <span className="text-amber-600 font-semibold">Unassigned</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      <span className="font-semibold text-slate-800 block">{apt.appointmentDate}</span>
                      <span className="text-[11px] text-slate-500">{apt.timeSlot}</span>
                    </td>

                    <td className="px-6 py-4">
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
                    </td>

                    <td className="px-6 py-4 text-right">
                      {apt.meetingLink ? (
                        <a
                          href={apt.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 font-semibold hover:underline inline-flex items-center"
                        >
                          <Video className="w-3.5 h-3.5 mr-1" />
                          <span>Video Room</span>
                        </a>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAppointments;
