import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, ShieldCheck, Lock, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 pt-12 pb-8 text-slate-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-slate-200">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Globe className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-slate-900">
                AuraVisa<span className="text-blue-600">.</span>
              </span>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed max-w-sm">
              AuraVisa Global provides AI-assisted e-Visa consultation, automated document integrity checks, and verified government portal navigation for international travelers and corporate immigration teams.
            </p>
            <div className="flex items-center space-x-3 text-xs text-slate-500 pt-1">
              <span className="flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 mr-1" />
                Verified Sources
              </span>
              <span className="flex items-center">
                <Lock className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                Encrypted Private Vault
              </span>
            </div>
          </div>

          {/* Popular Visa Destinations */}
          <div>
            <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider mb-3">
              Popular e-Visas
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/visas?country=United Arab Emirates" className="hover:text-blue-600 transition">
                  Dubai & UAE 30-Day eVisa
                </Link>
              </li>
              <li>
                <Link to="/visas?country=India" className="hover:text-blue-600 transition">
                  India Tourist & Business e-Visa
                </Link>
              </li>
              <li>
                <Link to="/visas?country=United Kingdom" className="hover:text-blue-600 transition">
                  UK Standard Visitor Visa
                </Link>
              </li>
              <li>
                <Link to="/visas?country=France" className="hover:text-blue-600 transition">
                  Schengen Europe Short-Stay
                </Link>
              </li>
              <li>
                <Link to="/visas?country=Singapore" className="hover:text-blue-600 transition">
                  Singapore e-Visa
                </Link>
              </li>
              <li>
                <Link to="/visas?country=Vietnam" className="hover:text-blue-600 transition">
                  Vietnam 90-Day e-Visa
                </Link>
              </li>
            </ul>
          </div>

          {/* Official Portals Directory */}
          <div>
            <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider mb-3">
              Official Government Portals
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://indianvisaonline.gov.in/evisa/tvoa.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 flex items-center transition"
                >
                  <span>India Bureau of Immigration</span>
                  <ExternalLink className="w-3 h-3 ml-1 text-slate-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://smartservices.icp.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 flex items-center transition"
                >
                  <span>ICP UAE Federal Portal</span>
                  <ExternalLink className="w-3 h-3 ml-1 text-slate-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.gov.uk/standard-visitor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 flex items-center transition"
                >
                  <span>UK Visas & Immigration</span>
                  <ExternalLink className="w-3 h-3 ml-1 text-slate-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://france-visas.gouv.fr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 flex items-center transition"
                >
                  <span>France-Visas Official</span>
                  <ExternalLink className="w-3 h-3 ml-1 text-slate-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.ica.gov.sg/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 flex items-center transition"
                >
                  <span>Singapore ICA</span>
                  <ExternalLink className="w-3 h-3 ml-1 text-slate-400" />
                </a>
              </li>
            </ul>
          </div>

          {/* Client Portals & Compliance */}
          <div>
            <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider mb-3">
              Account & Compliance
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/customer/dashboard" className="hover:text-blue-600 transition">
                  Customer Portal
                </Link>
              </li>
              <li>
                <Link to="/consultant/dashboard" className="hover:text-blue-600 transition">
                  Consultant Case Desk
                </Link>
              </li>
              <li>
                <Link to="/admin/dashboard" className="hover:text-blue-600 transition">
                  Administrator Console
                </Link>
              </li>
              <li>
                <Link to="/legal" className="hover:text-blue-600 transition">
                  Privacy Policy & GDPR
                </Link>
              </li>
              <li>
                <Link to="/legal#terms" className="hover:text-blue-600 transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/legal#retention" className="hover:text-blue-600 transition">
                  Document Retention Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Regulatory disclaimer */}
        <div className="pt-6 pb-2 text-[11px] text-slate-500 leading-relaxed space-y-1.5">
          <p>
            <strong>Statutory Disclaimer:</strong> AuraVisa Global is an independent visa advisory and document facilitation firm. AuraVisa Global is not an embassy, consulate, or government agency. We do not issue visas or guarantee visa approval. Final visa issuance decisions are made exclusively at the discretion of sovereign government immigration authorities.
          </p>
          <div className="flex flex-col sm:flex-row justify-between items-center pt-3 text-slate-400">
            <span>© {new Date().getFullYear()} AuraVisa Global Inc. All rights reserved.</span>
            <span className="mt-2 sm:mt-0">Strict White Design Standard • Certified Private Storage</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
