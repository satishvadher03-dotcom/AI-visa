import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import {
  Briefcase,
  Users,
  FileCheck,
  Calendar,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import apiRequest from '../../services/api.js';
import { VisaApplication, Appointment } from '../../types/index.js';

export const ConsultantDashboard: React.FC = () => {
  const { user } = useAuth();
  const [cases, setCases] = useState<VisaApplication[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [casesRes, aptsRes] = await Promise.all([
          apiRequest('/api/v1/consultant/assigned-cases'),
          apiRequest('/api/v1/consultant/appointments'),
        ]);

        if (casesRes.success && casesRes.data) setCases(casesRes.data);
        if (aptsRes.success && aptsRes.data) setAppointments(aptsRes.data);
      } catch (err) {
        console.error('Consultant dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const pendingVerification = cases.filter(
    (c) => c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW'
  );
  const actionRequired = cases.filter((c) => c.status === 'DOCUMENTS_REQUESTED');
  const upcomingApts = appointments.filter((a) => a.status === 'SCHEDULED');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-0.5">
            Senior Immigration Desk
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Consultant Case Desk — {user?.profile?.firstName} {user?.profile?.lastName}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review applicant documents, enforce sovereign criteria, and manage scheduled video hearings
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to="/consultant/applications"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs"
          >
            Open Case Verification Desk
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Total Assigned Cases</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{cases.length}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Active caseload</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Pending Review</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-600">{pendingVerification.length}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Awaiting document audit</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Scheduled Consultations</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{upcomingApts.length}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Upcoming hearings</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Resolution Rate</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">97.8%</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Sovereign compliance</span>
        </div>
      </div>

      {/* Priority Action Queue */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Priority Case Review Queue</h2>
            <p className="text-xs text-slate-500">Assigned applicant dossiers awaiting verification</p>
          </div>
          <Link
            to="/consultant/applications"
            className="text-xs font-semibold text-blue-600 hover:underline flex items-center"
          >
            <span>Full Case Desk</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading assigned cases...</div>
        ) : cases.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No applicant cases currently assigned to your desk.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {cases.map((c) => (
              <div
                key={c.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {c.referenceNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {c.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-800">
                    Applicant: {c.customer?.profile?.firstName} {c.customer?.profile?.lastName} ({c.customer?.email})
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Destination: {c.destinationCountry} • Category: {c.visaCategory}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Link
                    to={`/consultant/applications?id=${c.id}`}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition shadow-xs"
                  >
                    Open Review Desk
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

export default ConsultantDashboard;
