import React, { useState, useEffect } from 'react';
import { FileCheck2, ShieldCheck, AlertCircle, FileText } from 'lucide-react';
import apiRequest from '../../services/api.js';
import { VisaProgram } from '../../types/index.js';

export const AdminDocumentRequirements: React.FC = () => {
  const [programs, setPrograms] = useState<VisaProgram[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPrograms() {
      try {
        const res = await apiRequest('/api/v1/admin/visa-programs');
        if (res.success && res.data) {
          setPrograms(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPrograms();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <span className="text-xs font-bold text-red-600 uppercase tracking-wider block mb-0.5">
          Validation Rules
        </span>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Document Requirements & Criteria Matrix
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review mandatory checklist items, allowed MIME types, and file size limits across all active visa categories
        </p>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading checklist matrix...</div>
        ) : (
          programs.map((program) => (
            <div
              key={program.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{program.flagEmoji}</span>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{program.title}</h3>
                    <span className="text-xs text-slate-500">{program.country}</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                  {program.documentRequirements?.length || 0} Requirements
                </span>
              </div>

              {!program.documentRequirements || program.documentRequirements.length === 0 ? (
                <div className="text-xs text-slate-400 italic">No document requirements defined.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {program.documentRequirements.map((req) => (
                    <div
                      key={req.id}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 flex items-center">
                          <FileText className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                          {req.title}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            req.isMandatory
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {req.isMandatory ? 'Mandatory' : 'Optional'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">{req.description}</p>
                      <div className="pt-1 text-[10px] text-slate-400">
                        Formats: {req.allowedMimeTypes} • Max: {Math.round(req.maxSizeBytes / 1024 / 1024)}MB
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminDocumentRequirements;
