import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import {
  FileText,
  Lock,
  Calendar,
  Clock,
  ArrowRight,
  Plus,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import apiRequest from '../../services/api.js';
import { VisaApplication, Appointment, PrivateDocument } from '../../types/index.js';

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<VisaApplication[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [documents, setDocuments] = useState<PrivateDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [appRes, aptRes, docRes] = await Promise.all([
          apiRequest('/api/v1/customer/applications'),
          apiRequest('/api/v1/customer/appointments'),
          apiRequest('/api/v1/customer/documents'),
        ]);

        if (appRes.success && appRes.data) setApplications(appRes.data);
        if (aptRes.success && aptRes.data) setAppointments(aptRes.data);
        if (docRes.success && docRes.data) setDocuments(docRes.data);
      } catch (err) {
        console.error('Customer dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

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
            Action Required
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

  const upcomingAppointment = appointments.find((a) => a.status === 'SCHEDULED');

  return (
    <div className="space-y-6">
      {/* Top Welcome Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-0.5">
            Applicant Portal
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {user?.profile?.firstName || user?.email}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track your e-Visa applications, upload private documents, and interact with assigned specialists.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <Link
            to="/customer/applications"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Application</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Active Applications</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{applications.length}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Tracked cases</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Vault Documents</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{documents.length}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Encrypted in private storage</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Consultations</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{appointments.length}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {upcomingAppointment ? '1 upcoming session' : '0 scheduled'}
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Vault Compliance</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">100%</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Isolated filesystem security</span>
        </div>
      </div>

      {/* Upcoming Consultation Banner if exists */}
      {upcomingAppointment && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white text-blue-600 flex items-center justify-center border border-blue-100 shadow-xs shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-blue-800">Upcoming Video Consultation</div>
              <div className="text-sm font-semibold text-slate-900">
                {upcomingAppointment.appointmentDate} at {upcomingAppointment.timeSlot}
              </div>
              <span className="text-xs text-slate-500">Ref: {upcomingAppointment.referenceNumber}</span>
            </div>
          </div>

          {upcomingAppointment.meetingLink && (
            <a
              href={upcomingAppointment.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 self-start sm:self-center shadow-xs"
            >
              <span>Join Meeting Room</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}

      {/* Recent Applications Section */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Recent Visa Applications</h2>
            <p className="text-xs text-slate-500">Live timeline and consultant assignments</p>
          </div>
          <Link
            to="/customer/applications"
            className="text-xs font-semibold text-blue-600 hover:underline flex items-center"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading applications...</div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No applications initiated yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Start your first electronic visa dossier. Our specialists will review your credentials before submission.
            </p>
            <Link
              to="/customer/applications"
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Visa Application</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {applications.slice(0, 5).map((app) => (
              <div
                key={app.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {app.referenceNumber}
                    </span>
                    {getStatusBadge(app.status)}
                  </div>
                  <div className="text-xs font-medium text-slate-700">
                    {app.visaProgram?.title || app.destinationCountry}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Submitted: {new Date(app.submissionDate).toLocaleDateString()} • Destination:{' '}
                    {app.destinationCountry}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {app.assignments?.[0]?.consultant && (
                    <div className="text-right text-[11px] hidden md:block">
                      <span className="text-slate-400 block">Assigned Specialist:</span>
                      <span className="font-semibold text-slate-800">
                        {app.assignments[0].consultant.profile?.firstName}{' '}
                        {app.assignments[0].consultant.profile?.lastName}
                      </span>
                    </div>
                  )}
                  <Link
                    to={`/customer/applications`}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 rounded-lg text-xs font-semibold transition"
                  >
                    View Timeline
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
