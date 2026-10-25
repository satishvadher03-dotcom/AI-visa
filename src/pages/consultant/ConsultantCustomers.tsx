import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Mail, Phone, Globe, ArrowRight, FileText } from 'lucide-react';
import apiRequest from '../../services/api.js';
import { VisaApplication } from '../../types/index.js';

export const ConsultantCustomers: React.FC = () => {
  const [cases, setCases] = useState<VisaApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCases() {
      try {
        const res = await apiRequest('/api/v1/consultant/assigned-cases');
        if (res.success && res.data) {
          setCases(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCases();
  }, []);

  // Extract unique assigned customers
  const customersMap = new Map<string, any>();
  cases.forEach((c) => {
    if (c.customer && !customersMap.has(c.customer.id)) {
      customersMap.set(c.customer.id, {
        id: c.customer.id,
        email: c.customer.email,
        profile: c.customer.profile,
        cases: [c],
      });
    } else if (c.customer) {
      customersMap.get(c.customer.id).cases.push(c);
    }
  });

  const uniqueCustomers = Array.from(customersMap.values());

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-0.5">
          Caseload Directory
        </span>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Assigned Applicants ({uniqueCustomers.length})
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Travelers and corporate assignees whose documentation dossiers are currently under your supervision
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading assigned applicants...</div>
        ) : uniqueCustomers.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No applicants currently assigned to your case portfolio.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {uniqueCustomers.map((cust) => (
              <div
                key={cust.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition"
              >
                <div className="space-y-1">
                  <div className="font-bold text-sm text-slate-900">
                    {cust.profile ? `${cust.profile.firstName} ${cust.profile.lastName}` : cust.email}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center">
                      <Mail className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {cust.email}
                    </span>
                    {cust.profile?.phone && (
                      <span className="flex items-center">
                        <Phone className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {cust.profile.phone}
                      </span>
                    )}
                    {cust.profile?.nationality && (
                      <span className="flex items-center">
                        <Globe className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {cust.profile.nationality} Passport
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-blue-600 font-semibold pt-1">
                    {cust.cases.length} Active Dossier(s):{' '}
                    {cust.cases.map((c: any) => c.destinationCountry).join(', ')}
                  </div>
                </div>

                <Link
                  to={`/consultant/applications?id=${cust.cases[0]?.id}`}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 self-start sm:self-center shadow-xs"
                >
                  <span>Open Dossier Desk</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultantCustomers;
