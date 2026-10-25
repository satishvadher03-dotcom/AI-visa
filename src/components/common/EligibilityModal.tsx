import React, { useState } from 'react';
import {
  CheckCircle,
  X,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  FileText,
  ExternalLink,
  Loader2,
  Calendar,
} from 'lucide-react';
import apiRequest from '../../services/api.js';

interface EligibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookConsultation?: () => void;
}

export const EligibilityModal: React.FC<EligibilityModalProps> = ({
  isOpen,
  onClose,
  onBookConsultation,
}) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    nationality: 'India',
    currentResidence: 'India',
    destinationCountry: 'United Arab Emirates',
    travelPurpose: 'Tourism',
    stayDurationDays: '14',
    passportValidityMonths: '12',
    hasCriminalRecord: 'no',
    hasPreviousVisaRefusal: 'no',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await apiRequest('/api/v1/eligibility/check', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (res.success) {
        setResult(res.data);
        setStep(3);
      }
    } catch {
      // error handled in apiRequest
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setResult(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Visa Eligibility Evaluator</h3>
              <p className="text-xs text-slate-500">Official criterion check before application</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress indicator */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
          <span className={step >= 1 ? 'text-blue-600' : ''}>1. Traveler Identity</span>
          <span>→</span>
          <span className={step >= 2 ? 'text-blue-600' : ''}>2. Travel Details</span>
          <span>→</span>
          <span className={step === 3 ? 'text-blue-600' : ''}>3. Official Result</span>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Your Passport Nationality
                </label>
                <select
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  <option value="India">India (Indian Passport)</option>
                  <option value="United States">United States (US Passport)</option>
                  <option value="United Kingdom">United Kingdom (British Citizen)</option>
                  <option value="Canada">Canada (Canadian Citizen)</option>
                  <option value="Australia">Australia (Australian Citizen)</option>
                  <option value="France">France (French Citizen)</option>
                  <option value="Germany">Germany (German Citizen)</option>
                  <option value="Other">Other Sovereign Passport</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Current Country of Residence
                </label>
                <input
                  type="text"
                  name="currentResidence"
                  value={formData.currentResidence}
                  onChange={handleChange}
                  placeholder="e.g. India, UAE, UK"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Passport Validity Remaining (Months)
                </label>
                <select
                  name="passportValidityMonths"
                  value={formData.passportValidityMonths}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  <option value="3">Less than 6 months (Warning: may be ineligible)</option>
                  <option value="6">6 to 12 months</option>
                  <option value="12">More than 1 year</option>
                  <option value="36">More than 3 years</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleEvaluate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Intended Destination
                </label>
                <select
                  name="destinationCountry"
                  value={formData.destinationCountry}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  <option value="United Arab Emirates">🇦🇪 United Arab Emirates (Dubai / Abu Dhabi)</option>
                  <option value="India">🇮🇳 Republic of India (World-to-India)</option>
                  <option value="United Kingdom">🇬🇧 United Kingdom (UKVI)</option>
                  <option value="France">🇫🇷 Schengen Area (France / Europe)</option>
                  <option value="Singapore">🇸🇬 Singapore (ICA)</option>
                  <option value="Vietnam">🇻🇳 Vietnam (Immigration Dept)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Travel Purpose
                  </label>
                  <select
                    name="travelPurpose"
                    value={formData.travelPurpose}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    <option value="Tourism">Holiday / Leisure</option>
                    <option value="Business">Business / Conference</option>
                    <option value="Family">Family Visit</option>
                    <option value="Transit">Airport Transit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Stay Duration (Days)
                  </label>
                  <input
                    type="number"
                    name="stayDurationDays"
                    value={formData.stayDurationDays}
                    onChange={handleChange}
                    min="1"
                    max="180"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Previous Visa Refusal in Past 5 Years?
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center text-sm text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="hasPreviousVisaRefusal"
                      value="no"
                      checked={formData.hasPreviousVisaRefusal === 'no'}
                      onChange={handleChange}
                      className="mr-2 text-blue-600"
                    />
                    No Refusals
                  </label>
                  <label className="flex items-center text-sm text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="hasPreviousVisaRefusal"
                      value="yes"
                      checked={formData.hasPreviousVisaRefusal === 'yes'}
                      onChange={handleChange}
                      className="mr-2 text-blue-600"
                    />
                    Yes, Have Prior Refusal
                  </label>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition flex items-center space-x-1 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition flex items-center space-x-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Checking Database...</span>
                    </>
                  ) : (
                    <span>Evaluate Eligibility</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {step === 3 && result && (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-xl border ${
                  result.isEligiblePreliminary
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="font-bold text-sm">
                    {result.isEligiblePreliminary
                      ? 'Preliminary Match: High Eligibility Probability'
                      : 'Special Clearance or Renewal Required'}
                  </span>
                </div>
                <p className="text-xs mt-1 text-slate-700 leading-relaxed">
                  Based on your {result.nationality} passport and destination ({result.destination}), you qualify for electronic visa filing under normal immigration parameters.
                </p>
              </div>

              {result.matchedProgram && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
                  <div className="font-bold text-slate-900 text-sm">
                    {result.matchedProgram.title}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-600">
                    <div>
                      <span className="text-slate-400 block">Processing Window:</span>
                      <span className="font-semibold">{result.matchedProgram.processingTime}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Stay Validity:</span>
                      <span className="font-semibold">{result.matchedProgram.validity}</span>
                    </div>
                  </div>

                  {result.matchedProgram.officialSources?.[0] && (
                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-slate-400 block">Verified Official Authority:</span>
                      <a
                        href={result.matchedProgram.officialSources[0].officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline font-medium flex items-center mt-0.5"
                      >
                        <span>{result.matchedProgram.officialSources[0].authorityName}</span>
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {result.recommendations && (
                <div className="space-y-1 text-xs">
                  <span className="font-semibold text-slate-800 uppercase tracking-wider block">
                    Preparation Checklist:
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    {result.recommendations.map((rec: string, i: number) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Disclaimer */}
              <div className="p-3 bg-slate-100 rounded-lg text-[11px] text-slate-500 flex items-start space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Legal Notice:</strong> {result.disclaimer}
                </span>
              </div>

              <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Start Over
                </button>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onBookConsultation?.();
                    }}
                    className="px-4 py-2 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book Specialist</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      window.location.href = '/register';
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer shadow-sm"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EligibilityModal;
