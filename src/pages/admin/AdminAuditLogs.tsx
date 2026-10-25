import React, { useState, useEffect } from 'react';
import { Activity, Search, Filter, Shield, Code, RefreshCw, X } from 'lucide-react';
import apiRequest from '../../services/api.js';
import { AuditLog } from '../../types/index.js';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [selectedDetails, setSelectedDetails] = useState<any | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let url = '/api/v1/admin/audit-logs?';
      if (actionFilter) url += `action=${encodeURIComponent(actionFilter)}&`;
      if (resourceFilter) url += `resourceType=${encodeURIComponent(resourceFilter)}&`;

      const res = await apiRequest(url);
      if (res.success && res.data) {
        setLogs(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, resourceFilter]);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-red-600 uppercase tracking-wider block mb-0.5">
            Security & Compliance Ledger
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            System Security Audit Logs ({logs.length})
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable chronological records of logins, document access, and case state changes
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="p-2 border border-slate-300 rounded-xl hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <input
            type="text"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            placeholder="Filter by Action (e.g. AUTH_LOGIN, DOCUMENT_UPLOAD)..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
          />
        </div>
        <div>
          <input
            type="text"
            value={resourceFilter}
            onChange={(e) => setResourceFilter(e.target.value)}
            placeholder="Filter by Resource (e.g. APPLICATION, DOCUMENT, USER)..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading audit ledger...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No audit records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3">Timestamp</th>
                  <th className="px-6 py-3">Security Action</th>
                  <th className="px-6 py-3">Resource Target</th>
                  <th className="px-6 py-3">Actor Email & Role</th>
                  <th className="px-6 py-3">Client IP</th>
                  <th className="px-6 py-3 text-right">Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900">{log.action}</span>
                    </td>

                    <td className="px-6 py-4 text-slate-700">
                      <span>{log.resourceType}</span>
                      {log.resourceId && (
                        <span className="text-[10px] text-slate-400 block truncate max-w-xs">
                          {log.resourceId}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {log.user ? (
                        <div>
                          <span className="font-semibold block">{log.user.email}</span>
                          <span className="text-[10px] text-blue-600 uppercase font-sans">
                            {log.user.role}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">System / Anonymous</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-slate-500">{log.ipAddress || '127.0.0.1'}</td>

                    <td className="px-6 py-4 text-right">
                      {log.detailsJson ? (
                        <button
                          onClick={() => setSelectedDetails(JSON.parse(log.detailsJson!))}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-sans font-semibold cursor-pointer"
                        >
                          Inspect JSON
                        </button>
                      ) : (
                        <span className="text-slate-400 font-sans text-[11px]">None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* JSON Viewer Modal */}
      {selectedDetails && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Code className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm font-sans">Audit Event Payload</h3>
              </div>
              <button
                onClick={() => setSelectedDetails(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <pre className="bg-slate-900 text-emerald-400 p-4 rounded-xl text-xs overflow-x-auto max-h-80">
              {JSON.stringify(selectedDetails, null, 2)}
            </pre>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedDetails(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAuditLogs;
