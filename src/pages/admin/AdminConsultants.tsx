import React, { useState, useEffect } from 'react';
import { Briefcase, Mail, CheckCircle2, Shield, User } from 'lucide-react';
import apiRequest from '../../services/api.js';

export const AdminConsultants: React.FC = () => {
  const [consultants, setConsultants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadConsultants() {
      try {
        const res = await apiRequest('/api/v1/admin/consultants');
        if (res.success && res.data) {
          setConsultants(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadConsultants();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <span className="text-xs font-bold text-red-600 uppercase tracking-wider block mb-0.5">
          Staffing Directory
        </span>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Consultant Directory & Workload Distribution ({consultants.length})
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Active case officers licensed to perform pre-submission document audits and video hearings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-8 text-center text-xs text-slate-400">Loading directory...</div>
        ) : (
          consultants.map((c) => (
            <div
              key={c.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-sm border border-blue-100">
                    {c.name?.charAt(0) || 'C'}
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      c.role === 'ADMIN'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}
                  >
                    {c.role}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{c.name}</h3>
                  <div className="flex items-center text-xs text-slate-500 mt-0.5">
                    <Mail className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    <span>{c.email}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Active Caseload:</span>
                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                  {c.activeCasesCount} Active Cases
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminConsultants;
