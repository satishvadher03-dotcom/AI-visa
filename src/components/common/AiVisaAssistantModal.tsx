import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  X,
  Send,
  Globe2,
  ExternalLink,
  ShieldAlert,
  Loader2,
  Sparkles,
} from 'lucide-react';
import apiRequest from '../../services/api.js';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{
    country: string;
    authorityName: string;
    officialUrl: string;
    lastVerifiedDate: string;
  }>;
  disclaimer?: string;
  provider?: string;
}

interface AiVisaAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export const AiVisaAssistantModal: React.FC<AiVisaAssistantModalProps> = ({
  isOpen,
  onClose,
  initialQuery,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<'en' | 'gu' | 'hi'>('en');
  const [sessionId] = useState<string>(() => 'chat-' + Math.random().toString(36).substring(2, 9));
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeText =
        language === 'gu'
          ? 'નમસ્તે! હું AuraVisa નો AI વિઝા સહાયક છું. આપને યુએઈ, યુકે, શેન્જેન, સિંગાપોર, વિયેતનામ અથવા ભારત માટે કયા વિઝા નિયમો, દસ્તાવેજો કે પ્રોસેસિંગ વિશે માહિતી જોઈએ છે?'
          : language === 'hi'
          ? 'नमस्ते! मैं AuraVisa का AI वीजा सहायक हूँ। आप यूएई, यूके, शेंगेन, सिंगापुर, वियतनाम या भारत के ई-वीजा नियमों, पात्रता या आवश्यक दस्तावेजों के बारे में मुझसे पूछ सकते हैं।'
          : 'Welcome to AuraVisa AI Visa Assistant. I can explain verified e-Visa requirements, document checklists, and application steps for UAE, UK, Schengen Europe, Singapore, Vietnam, and India. How may I assist your travel plans today?';

      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: welcomeText,
          disclaimer:
            'Advisory guidance grounded in verified government immigration rules. Does not guarantee visa issuance.',
        },
      ]);

      if (initialQuery) {
        handleSend(initialQuery);
      }
    }
  }, [isOpen, language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input.trim();
    if (!textToSend || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const historyPayload = messages.slice(-5).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await apiRequest('/api/v1/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: textToSend,
          sessionId,
          language,
          history: historyPayload,
        }),
      });

      if (res.success) {
        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: res.reply || 'No response generated.',
          sources: res.sources,
          disclaimer: res.disclaimer,
          provider: res.provider,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: res.error || 'Failed to connect to the visa guidance service.',
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'A temporary connection issue occurred. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = {
    en: [
      'Dubai 30-day tourist visa requirements',
      'UK visitor visa bank statement guidelines',
      'India e-Visa eligibility for foreign tourists',
      'Schengen insurance requirements',
    ],
    gu: [
      'દુબઈ ૩૦ દિવસ પ્રવાસી વિઝા નિયમો',
      'યુકે વિઝા માટે બેંક સ્ટેટમેન્ટ જરૂરિયાત',
      'ભારત ઈ-વિઝા કઈ રીતે મેળવવો?',
      'શેન્જેન ટ્રાવેલ ઇન્સ્યોરન્સ નિયમો',
    ],
    hi: [
      'दुबई 30-दिवसीय पर्यटक वीजा आवश्यकताएं',
      'यूके वीजा के लिए बैंक स्टेटमेंट के नियम',
      'भारत ई-वीजा आवेदन की प्रक्रिया',
      'शेंगेन वीजा के लिए जरूरी दस्तावेज',
    ],
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl h-[85vh] max-h-[700px] flex flex-col shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-slate-900 text-sm">AuraVisa AI Consultant</h3>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                  Verified Sources
                </span>
              </div>
              <p className="text-xs text-slate-500">Multilingual immigration guidance engine</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Language Switcher */}
            <div className="flex items-center border border-slate-200 rounded-lg p-0.5 text-xs bg-slate-50">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded-md font-medium transition cursor-pointer ${
                  language === 'en' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('gu')}
                className={`px-2 py-1 rounded-md font-medium transition cursor-pointer ${
                  language === 'gu' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="ગુજરાતી"
              >
                ગુજ
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`px-2 py-1 rounded-md font-medium transition cursor-pointer ${
                  language === 'hi' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="हिंदी"
              >
                हिं
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/50">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-xs'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>

                {/* Verified Government Sources */}
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 text-xs">
                    <p className="font-semibold text-slate-700 mb-1 flex items-center">
                      <Globe2 className="w-3.5 h-3.5 mr-1 text-blue-600" />
                      Verified Government Authority Citations:
                    </p>
                    <div className="space-y-1">
                      {m.sources.map((src, i) => (
                        <div key={i} className="flex items-center justify-between text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-200">
                          <span className="font-medium truncate mr-2">
                            {src.country}: {src.authorityName}
                          </span>
                          <a
                            href={src.officialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center shrink-0 font-medium"
                          >
                            <span>Official Portal</span>
                            <ExternalLink className="w-3 h-3 ml-0.5" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Advisory disclaimer */}
                {m.disclaimer && (
                  <div className="mt-2 text-[10px] text-slate-400 flex items-start space-x-1">
                    <ShieldAlert className="w-3 h-3 shrink-0 mt-0.5" />
                    <span>{m.disclaimer}</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 rounded-bl-xs flex items-center space-x-2 text-slate-500 text-xs shadow-xs">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>Checking verified government immigration regulations...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompt suggestions */}
        <div className="px-4 py-2 border-t border-slate-100 bg-white overflow-x-auto flex space-x-2 text-xs no-scrollbar">
          {quickPrompts[language].map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(prompt)}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 font-medium whitespace-nowrap transition cursor-pointer border border-slate-200"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              language === 'gu'
                ? 'વિઝા પ્રશ્ન અહીં લખો...'
                : language === 'hi'
                ? 'वीजा संबंधी प्रश्न यहाँ लिखें...'
                : 'Ask about visa rules, fees, processing, documents...'
            }
            className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl transition cursor-pointer shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AiVisaAssistantModal;
