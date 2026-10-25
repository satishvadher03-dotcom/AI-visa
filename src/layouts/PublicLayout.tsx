import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar.js';
import Footer from '../components/common/Footer.js';
import AiVisaAssistantModal from '../components/common/AiVisaAssistantModal.js';
import EligibilityModal from '../components/common/EligibilityModal.js';
import BookAppointmentModal from '../components/common/BookAppointmentModal.js';
import { Bot } from 'lucide-react';

export const PublicLayout: React.FC = () => {
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [eligibilityOpen, setEligibilityOpen] = useState(false);
  const [appointmentOpen, setAppointmentOpen] = useState(false);
  const [initialAiQuery, setInitialAiQuery] = useState<string | undefined>(undefined);

  const openAiWithQuery = (query?: string) => {
    setInitialAiQuery(query);
    setAiModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col selection:bg-blue-100 selection:text-blue-900">
      <Navbar
        onOpenAiAssistant={() => openAiWithQuery()}
        onOpenEligibility={() => setEligibilityOpen(true)}
        onOpenAppointment={() => setAppointmentOpen(true)}
      />

      <main className="flex-1">
        <Outlet
          context={{
            openAiAssistant: openAiWithQuery,
            openEligibility: () => setEligibilityOpen(true),
            openAppointment: () => setAppointmentOpen(true),
          }}
        />
      </main>

      <Footer />

      {/* Floating AI Assistant Trigger Button */}
      <button
        onClick={() => openAiWithQuery()}
        className="fixed bottom-6 right-6 z-40 bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-full shadow-lg hover:shadow-xl transition flex items-center space-x-2.5 cursor-pointer group border-2 border-white"
        aria-label="Open AI Visa Assistant"
      >
        <div className="relative">
          <Bot className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
        </div>
        <span className="text-xs font-bold pr-1 hidden sm:inline">AI Visa Help</span>
      </button>

      {/* Modals */}
      <AiVisaAssistantModal
        isOpen={aiModalOpen}
        onClose={() => {
          setAiModalOpen(false);
          setInitialAiQuery(undefined);
        }}
        initialQuery={initialAiQuery}
      />

      <EligibilityModal
        isOpen={eligibilityOpen}
        onClose={() => setEligibilityOpen(false)}
        onBookConsultation={() => setAppointmentOpen(true)}
      />

      <BookAppointmentModal
        isOpen={appointmentOpen}
        onClose={() => setAppointmentOpen(false)}
      />
    </div>
  );
};

export default PublicLayout;
