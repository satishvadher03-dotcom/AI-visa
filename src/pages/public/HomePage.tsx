import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  Search,
  CheckCircle2,
  ShieldCheck,
  Bot,
  Calendar,
  ArrowRight,
  Globe,
  Clock,
  Lock,
  ChevronDown,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { VisaProgram } from '../../types/index.js';
import apiRequest from '../../services/api.js';

interface OutletContextType {
  openAiAssistant: (query?: string) => void;
  openEligibility: () => void;
  openAppointment: () => void;
}

export const HomePage: React.FC = () => {
  const { openAiAssistant, openEligibility, openAppointment } = useOutletContext<OutletContextType>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFlow, setSelectedFlow] = useState<'ALL' | 'INDIA_TO_WORLD' | 'WORLD_TO_INDIA'>('ALL');
  const [programs, setPrograms] = useState<VisaProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    async function loadPrograms() {
      try {
        const res = await apiRequest('/api/v1/visa-programs?popular=true');
        if (res.success && res.data) {
          setPrograms(res.data);
        }
      } catch (err) {
        console.error('Failed to load visa programs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPrograms();
  }, []);

  const filteredPrograms = programs.filter((p) => {
    const matchesSearch =
      p.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFlow = selectedFlow === 'ALL' || p.flow === selectedFlow;
    return matchesSearch && matchesFlow;
  });

  const faqs = [
    {
      q: 'How does AuraVisa verify my application documents before official filing?',
      a: 'AuraVisa employs a dual-tier verification model: first, our AI engine checks file integrity, pixel dimensions, and adherence to biometric standards (e.g. 35x45mm white background photos and passport validity). Next, an accredited Senior Visa Consultant reviews your proofs against official government regulatory checklists to eliminate rejection risks.',
    },
    {
      q: 'Is AuraVisa affiliated with foreign embassies or immigration departments?',
      a: 'No. AuraVisa Global is an independent private consultancy and regulatory compliance technology firm. We prepare and verify your documentation and guide submissions directly through official sovereign immigration portals (such as UAE ICP, India BoI, UKVI, and France-Visas). The sovereign authorities retain sole legal authority to grant visas.',
    },
    {
      q: 'How are my uploaded private passport scans and financial bank statements protected?',
      a: 'Uploaded files are isolated in private filesystem vaults outside public web server roots. Filenames are randomized with cryptographically generated UUIDs, access is governed by strict role-based and case-ownership checks, and files are streamed via authenticated endpoints with full audit logging.',
    },
    {
      q: 'Can the AI Visa Assistant converse in Gujarati or Hindi?',
      a: 'Yes! Our AI Visa Assistant is natively grounded in verified government visa data and seamlessly supports Gujarati (ગુજરાતી), Hindi (हिंदी), and English. You can ask document questions or clarify eligibility anytime.',
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-100 bg-gradient-to-b from-slate-50/60 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-5">
            {/* Tag badge */}
            <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-full text-xs font-semibold text-blue-700">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Grounded in Official Sovereign Government Data</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              AI-Guided Electronic Visa Consulting & Case Management
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Fast, verified e-Visa applications for Dubai, UK, Schengen Europe, Singapore, Vietnam, and India. Multi-language AI advisory, document vault security, and licensed specialist reviews.
            </p>

            {/* Destination Search Box */}
            <div className="pt-4 max-w-xl mx-auto">
              <div className="bg-white border-2 border-slate-200 focus-within:border-blue-600 rounded-2xl p-2 shadow-sm flex items-center transition">
                <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Where do you want to travel? (e.g. Dubai, UK, India, France)..."
                  className="w-full px-3 py-2 text-sm text-slate-900 focus:outline-none bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => openEligibility()}
                  className="hidden sm:inline-flex px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shrink-0 cursor-pointer shadow-xs"
                >
                  Check Eligibility
                </button>
              </div>

              {/* Quick suggestions */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-3 text-xs text-slate-500">
                <span className="font-semibold text-slate-600">Popular:</span>
                <button
                  onClick={() => setSearchQuery('United Arab Emirates')}
                  className="hover:text-blue-600 hover:underline cursor-pointer"
                >
                  🇦🇪 Dubai (UAE)
                </button>
                <span>•</span>
                <button
                  onClick={() => setSearchQuery('United Kingdom')}
                  className="hover:text-blue-600 hover:underline cursor-pointer"
                >
                  🇬🇧 UK Visitor
                </button>
                <span>•</span>
                <button
                  onClick={() => setSearchQuery('France')}
                  className="hover:text-blue-600 hover:underline cursor-pointer"
                >
                  🇫🇷 Schengen
                </button>
                <span>•</span>
                <button
                  onClick={() => setSearchQuery('India')}
                  className="hover:text-blue-600 hover:underline cursor-pointer"
                >
                  🇮🇳 India e-Visa
                </button>
              </div>
            </div>

            {/* Trust highlights */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                <div className="text-xl font-bold text-slate-900">99.2%</div>
                <div className="text-xs text-slate-500">Pre-check Accuracy</div>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                <div className="text-xl font-bold text-blue-600">40+</div>
                <div className="text-xs text-slate-500">Verified Portals</div>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                <div className="text-xl font-bold text-slate-900">&lt; 24h</div>
                <div className="text-xs text-slate-500">Document Review</div>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                <div className="text-xl font-bold text-emerald-600">3 Langs</div>
                <div className="text-xs text-slate-500">EN, GU, HI Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Visa Catalog Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                Verified Global Programs
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Featured e-Visa Destinations
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Transparent processing times, verified government fees, and documented criteria.
              </p>
            </div>

            {/* Flow Switcher Tabs */}
            <div className="inline-flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setSelectedFlow('ALL')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  selectedFlow === 'ALL'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Programs
              </button>
              <button
                onClick={() => setSelectedFlow('INDIA_TO_WORLD')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  selectedFlow === 'INDIA_TO_WORLD'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                India → World
              </button>
              <button
                onClick={() => setSelectedFlow('WORLD_TO_INDIA')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  selectedFlow === 'WORLD_TO_INDIA'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                World → India
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredPrograms.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200">
              <Globe className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-700 font-semibold text-sm">No visa programs match your query</p>
              <p className="text-xs text-slate-500 mt-1">Try searching another country or reset filters.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedFlow('ALL');
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrograms.map((program) => (
                <div
                  key={program.id}
                  className="bg-white border border-slate-200 hover:border-blue-400 rounded-2xl p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Flag, Category, Title */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl">{program.flagEmoji}</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {program.flow === 'WORLD_TO_INDIA' ? 'Inbound to India' : 'Outbound'}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 leading-snug mb-1">
                      {program.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                      {program.description}
                    </p>

                    {/* Key Details Pill */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 grid grid-cols-2 gap-2 text-xs mb-4">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                          Processing
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

                    {/* Official Authority Badge */}
                    {program.officialSources?.[0] && (
                      <div className="flex items-center text-[11px] text-slate-600 mb-4 bg-emerald-50/60 p-2 rounded-lg border border-emerald-200/60">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 mr-1.5 shrink-0" />
                        <span className="truncate">
                          Verified: {program.officialSources[0].authorityName}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-slate-100 flex items-center space-x-2">
                    <button
                      onClick={() => openAiAssistant(`Tell me the visa requirements for ${program.country}`)}
                      className="p-2 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-xl transition cursor-pointer"
                      title="Ask AI Assistant about this visa"
                    >
                      <Bot className="w-4 h-4" />
                    </button>
                    <Link
                      to={`/visas?id=${program.id}`}
                      className="flex-1 py-2 text-center text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-xs"
                    >
                      View Requirements & Apply
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <Link
              to="/visas"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl text-sm font-semibold transition"
            >
              <span>Explore All Destinations & Visa Categories</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
              End-to-End Workflow
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              How AuraVisa Simplifies Your e-Visa Journey
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Four structured checkpoints designed to minimize errors and prevent consular rejections.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-sm mb-4 border border-blue-100">
                01
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1.5">Check Eligibility</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Take our 2-minute questionnaire matching your passport, residence, and trip duration against verified consular rules.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-sm mb-4 border border-blue-100">
                02
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1.5">Private Vault Upload</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Upload your passport bio page and photographs into our encrypted private vault with automatic file signature validation.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-sm mb-4 border border-blue-100">
                03
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1.5">Expert Verification</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                An assigned Senior Consultant audits your files, checks photo margins and expiry dates, and advises on missing documents.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-sm mb-4 border border-blue-100">
                04
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1.5">Portal Submission</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your dossier is processed directly through official sovereign immigration portals with live status timeline tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Private Storage Commitment */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 sm:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Isolated Private Storage Architecture</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Your Passport & Financial Documents Never Enter Public Assets
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Unlike generic forms that expose uploaded files over unauthenticated CDNs, AuraVisa isolates your private files in protected disk storage outside the web root. Every download request is subject to cryptographic verification, strict customer ownership checks, and immutable audit logs.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-medium text-slate-700">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Cryptographic SHA-256 Hashes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Path Traversal Guards</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Strict Ownership Enforcement</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Automated Audit Logging</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900">Live Security Pipeline Status</span>
                  <span className="inline-flex items-center text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Active & Compliant
                  </span>
                </div>
                <div className="space-y-2.5 text-xs text-slate-600">
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span>MIME & Magic Byte Verification:</span>
                    <span className="font-mono text-slate-800">ENFORCED</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span>File Signature Guard:</span>
                    <span className="font-mono text-slate-800">ACTIVE</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span>Role-Based Route Firewalls:</span>
                    <span className="font-mono text-slate-800">ISOLATED</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Official Portal Synchronization:</span>
                    <span className="font-mono text-slate-800">DAILY VERIFIED</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openAppointment()}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
                >
                  Schedule Private Advisory Call
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Transparent answers regarding e-Visas, verification standards, and security.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden transition shadow-xs"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between text-sm font-semibold text-slate-900 hover:text-blue-600 transition cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        isOpen ? 'rotate-180 text-blue-600' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Consultation Banner CTA */}
      <section className="py-12 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ready to Begin Your Verified Visa Application?
          </h2>
          <p className="text-sm text-blue-100 max-w-xl mx-auto">
            Create your applicant account today, upload required documents to your private vault, and receive step-by-step guidance.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/register"
              className="px-6 py-3 bg-white text-blue-600 hover:bg-blue-50 font-bold rounded-xl text-sm transition shadow-sm"
            >
              Start Online Application
            </Link>
            <button
              onClick={() => openAppointment()}
              className="px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl text-sm transition border border-blue-500 cursor-pointer"
            >
              Book Video Consultation
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
