import React from 'react';
import { ShieldCheck, Lock, FileCheck, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TermsPrivacyPage: React.FC = () => {
  return (
    <div className="bg-white min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex items-center text-xs font-semibold text-blue-600 hover:underline mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          <span>Back to Homepage</span>
        </Link>

        <div className="border-b border-slate-200 pb-6 mb-8">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">
            Legal & Compliance Framework
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Privacy Policy, Terms of Service & Document Retention
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Effective Date: October 2026 • Compliant with international data privacy laws and private storage protocols
          </p>
        </div>

        <div className="space-y-10 text-xs text-slate-600 leading-relaxed">
          {/* Section 1 */}
          <section id="privacy" className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center">
              <ShieldCheck className="w-5 h-5 text-blue-600 mr-2" />
              1. Privacy Policy & Data Handling
            </h2>
            <p>
              AuraVisa Global collects only necessary personal identification information (full legal names, dates of birth, passport biodata, residential addresses, and contact numbers) strictly for electronic visa preparation and verification against sovereign immigration requirements.
            </p>
            <p>
              We do not sell, license, or monetize applicant personal information. Data transmission is secured using TLS 1.3 encryption, and internal access is restricted under least-privilege role boundaries.
            </p>
          </section>

          {/* Section 2 */}
          <section id="storage" className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center">
              <Lock className="w-5 h-5 text-emerald-600 mr-2" />
              2. Private Document Storage & Isolation Architecture
            </h2>
            <p>
              Uploaded applicant files (including passport bio scans, photographs, and bank statements) are stored in dedicated local private storage directories outside public web server roots.
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>Files are indexed by random UUIDs to eliminate predictability and directory enumeration.</li>
              <li>Every upload undergoes MIME type validation, file extension checks, and magic byte file signature verification.</li>
              <li>Files can only be downloaded by the authenticated uploader or an assigned Senior Visa Consultant.</li>
              <li>Path traversal attacks, symlink exploits, and unauthenticated public requests are rejected at the server boundary.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section id="retention" className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center">
              <FileCheck className="w-5 h-5 text-blue-600 mr-2" />
              3. Document Retention & Purge Policy
            </h2>
            <p>
              Customer application records and associated documents are retained for 180 days following formal application resolution (Approved or Rejected) to assist with re-application or appeal needs, after which digital files can be permanently purged upon applicant request.
            </p>
          </section>

          {/* Section 4 */}
          <section id="terms" className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">
              4. Terms of Service & Immigration Disclaimers
            </h2>
            <p>
              AuraVisa Global is a technology-enabled document review and consultation service. We do not issue travel visas. Final visa decisions, processing durations, and border entry authorizations are determined solely by sovereign immigration departments and consulates.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsPrivacyPage;
