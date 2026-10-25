import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Users,
  Briefcase,
  FileText,
  Calendar,
  Globe2,
  Activity,
  ArrowRight,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import apiRequest from '../../services/api.js';
import { AuditLog } from '../../types/index.js';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>({
    totalUsers: 0,
    totalApplications: 0,
    totalAppointments: 0,
    totalPrograms: 0,
    approvedApps: 0,
    pendingApps: 0,
    auditCount: 0,
    approvalRate: 0,
  });
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, logsRes] = await Promise.all([
          apiRequest('/api/v1/admin/stats'),
          apiRequest('/api/v1/admin/audit-logs'),
        ]);

        if (statsRes.success && statsRes.data) setStats(statsRes.data);
        if (logsRes.success && logsRes.data) setRecentLogs(logsRes.data.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-0.5">
            <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
              Executive Console
            </span>
            <span className="inline-flex items-center text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              System Health Normal
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            AuraVisa Operations & Security Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Global case throughput, user privilege governance, and immutable security audit logs
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to="/admin/users"
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-xs"
          >
            Manage User Roles
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Registered Users</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{stats.totalUsers}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Customers & Staff</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Total Applications</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{stats.totalApplications}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">{stats.pendingApps} pending verification</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Visa Programs</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Globe2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{stats.totalPrograms}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Official Government Portals</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Security Audit Logs</span>
            <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{stats.auditCount}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Recorded security events</span>
        </div>
      </div>

      {/* Quick Navigation Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/admin/applications"
          className="bg-white border border-slate-200 hover:border-blue-500 p-5 rounded-2xl shadow-xs transition group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-slate-900 text-sm">Case Assignment Desk</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-1" />
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Assign submitted customer dossiers to active visa consultants and override statuses.
          </p>
        </Link>

        <Link
          to="/admin/visa-programs"
          className="bg-white border border-slate-200 hover:border-blue-500 p-5 rounded-2xl shadow-xs transition group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-slate-900 text-sm">Visa Program CRUD</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-1" />
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Create, update, or deactivate official visa programs, authority links, and fee schedules.
          </p>
        </Link>

        <Link
          to="/admin/audit-logs"
          className="bg-white border border-slate-200 hover:border-red-500 p-5 rounded-2xl shadow-xs transition group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-slate-900 text-sm">Security Audit Trail</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 transition-transform group-hover:translate-x-1" />
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Inspect real-time logs for authentication, role modifications, and private document accesses.
          </p>
        </Link>
      </div>

      {/* Recent Audit Log Stream */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Recent Security Audit Stream</h2>
            <p className="text-xs text-slate-500">Immutable chronological activity ledger</p>
          </div>
          <Link
            to="/admin/audit-logs"
            className="text-xs font-semibold text-blue-600 hover:underline flex items-center"
          >
            <span>View All Logs</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading audit stream...</div>
        ) : recentLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No audit events logged yet.</div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/50 transition"
              >
                <div>
                  <span className="font-mono font-bold text-slate-900 mr-2">{log.action}</span>
                  <span className="text-slate-500">
                    Resource: <span className="font-semibold">{log.resourceType}</span>
                  </span>
                  {log.user && (
                    <span className="text-slate-400 text-[11px] block sm:inline sm:ml-2">
                      by {log.user.email} ({log.user.role})
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 shrink-0">
                  {new Date(log.createdAt).toLocaleString()} • IP: {log.ipAddress || '127.0.0.1'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
