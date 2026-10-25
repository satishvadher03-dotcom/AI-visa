import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Globe,
  Clock,
  ShieldCheck,
  ExternalLink,
  CheckCircle,
  FileText,
  X,
  ArrowRight,
  Bot,
  Calendar,
} from 'lucide-react';
import { VisaProgram } from '../../types/index.js';
import apiRequest from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';

export const VisaCatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [programs, setPrograms] = useState<VisaProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState<VisaProgram | null>(null);

  // Filters
  const [search, setSearch] = useState(searchParams.get('country') || '');
  const [category, setCategory] = useState<string>('ALL');
  const [flow, setFlow] = useState<string>('ALL');

  useEffect(() => {
    async function fetchPrograms() {
      setLoading(true);
      try {
        let url = '/api/v1/visa-programs?';
        if (category !== 'ALL') url += `category=${category}&`;
        if (flow !== 'ALL') url += `flow=${flow}&`;
        if (search) url += `search=${encodeURIComponent(search)}&`;

        const res = await apiRequest(url);
        if (res.success && res.data) {
          setPrograms(res.data);

          // Check if specific ID is requested in URL
          const requestedId = searchParams.get('id');
          if (requestedId) {
            const matched = res.data.find((p: VisaProgram) => p.id === requestedId);
            if (matched) setSelectedProgram(matched);
          }
        }
      } catch (err) {
        console.error('Failed to load visa programs:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPrograms();
  }, [category, flow, search, searchParams]);

  const categories = [
    { label: 'All Categories', value: 'ALL' },
    { label: 'Tourist Visas', value: 'TOURIST' },
    { label: 'Business & Conference', value: 'BUSINESS' },
    { label: 'Student Visas', value: 'STUDENT' },
    { label: 'Transit Passes', value: 'TRANSIT' },
  ];

  return (
    <div className="bg-white min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="mb-8">
          <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            Official Visa Directory
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Search Global e-Visa Programs & Requirements
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Grounded in verified sovereign immigration sources with mandatory document checklists.
          </p>
        </div>

        {/* Filter controls */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-8 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country, visa title, or destination..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Travel Flow Filter */}
            <div>
              <select
                value={flow}
                onChange={(e) => setFlow(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              >
                <option value="ALL">All Travel Flows (Inbound & Outbound)</option>
                <option value="INDIA_TO_WORLD">Outbound: India to World</option>
                <option value="WORLD_TO_INDIA">Inbound: World to India</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Programs Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : programs.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 border border-slate-200 rounded-2xl">
            <Globe className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No matching visa programs found</h3>
            <p className="text-xs text-slate-500 mt-1">Adjust your keywords or clear your active filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => (
              <div
                key={program.id}
                className="bg-white border border-slate-200 hover:border-blue-400 rounded-2xl p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl">{program.flagEmoji}</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {program.category}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-1 leading-snug">
                    {program.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                    {program.description}
                  </p>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 grid grid-cols-2 gap-2 text-xs mb-4">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                        Processing Time
                      </span>
                      <span className="font-semibold text-slate-800 flex items-center mt-0.5">
                        <Clock className="w-3 h-3 mr-1 text-slate-400" />
                        {program.processingTime}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                        Government Fee
                      </span>
                      <span className="font-semibold text-slate-800 mt-0.5 block">
                        {program.feeCurrency} {program.feeAmount}
                      </span>
                    </div>
                  </div>

                  {program.officialSources?.[0] && (
                    <div className="flex items-center text-[11px] text-slate-600 mb-4 bg-emerald-50/50 p-2 rounded-lg border border-emerald-200/50">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 mr-1.5 shrink-0" />
                      <span className="truncate">
                        Verified: {program.officialSources[0].authorityName}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedProgram(program)}
                    className="flex-1 py-2 text-center text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition cursor-pointer"
                  >
                    View Checklist & Details
                  </button>
                  <Link
                    to={user ? `/customer/applications` : `/register`}
                    className="px-4 py-2 text-center text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-xs"
                  >
                    Apply
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedProgram && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden my-6">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{selectedProgram.flagEmoji}</span>
                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {selectedProgram.title}
                  </h3>
                  <span className="text-xs text-blue-600 font-semibold">
                    {selectedProgram.country} • {selectedProgram.category}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedProgram(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Overview Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Validity</span>
                  <span className="text-xs font-semibold text-slate-800">{selectedProgram.validity}</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Entry Type</span>
                  <span className="text-xs font-semibold text-slate-800">{selectedProgram.entryType}</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Processing</span>
                  <span className="text-xs font-semibold text-slate-800">{selectedProgram.processingTime}</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Official Fee</span>
                  <span className="text-xs font-semibold text-slate-800">
                    {selectedProgram.feeCurrency} {selectedProgram.feeAmount}
                  </span>
                </div>
              </div>

              {/* Description & Eligibility */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                  Program Overview
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">{selectedProgram.description}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                  Eligibility Criteria
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {selectedProgram.eligibilitySummary}
                </p>
              </div>

              {/* Document Requirements Checklist */}
              {selectedProgram.documentRequirements && selectedProgram.documentRequirements.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                    Required Documents Checklist
                  </h4>
                  <div className="space-y-2">
                    {selectedProgram.documentRequirements.map((doc, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-slate-200 rounded-xl p-3 flex items-start space-x-3 text-xs"
                      >
                        <FileText className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800">{doc.title}</span>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                                doc.isMandatory
                                  ? 'bg-red-50 text-red-700 border border-red-200'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {doc.isMandatory ? 'Mandatory' : 'Optional'}
                            </span>
                          </div>
                          <p className="text-slate-500 mt-0.5">{doc.description}</p>
                          <span className="text-[10px] text-slate-400 block mt-1">
                            Accepted Formats: {doc.allowedMimeTypes.replace(/image\//g, '').replace(/application\//g, '')} • Max {Math.round(doc.maxSizeBytes / (1024 * 1024))}MB
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Verified Sources */}
              {selectedProgram.officialSources && selectedProgram.officialSources.length > 0 && (
                <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4 text-xs">
                  <div className="font-bold text-emerald-900 flex items-center mb-1">
                    <ShieldCheck className="w-4 h-4 mr-1 text-emerald-600" />
                    Verified Government Sources
                  </div>
                  {selectedProgram.officialSources.map((source, i) => (
                    <div key={i} className="space-y-1 mt-2 text-slate-700">
                      <div className="font-medium text-slate-900">{source.authorityName}</div>
                      <div className="text-slate-500 text-[11px]">Last Verified: {source.lastVerifiedDate}</div>
                      <a
                        href={source.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:underline font-semibold mt-1"
                      >
                        <span>Visit Official Government Portal</span>
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer CTA */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setSelectedProgram(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Close
              </button>
              <Link
                to={user ? `/customer/applications` : `/register`}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center space-x-1.5"
              >
                <span>Proceed with Application</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisaCatalogPage;
