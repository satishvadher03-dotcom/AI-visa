import { GoogleGenAI } from '@google/genai';
import prisma from '../db.js';

let genAIClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

export interface ChatMessageInput {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AiChatResponse {
  reply: string;
  language: 'en' | 'gu' | 'hi';
  sources: Array<{
    country: string;
    authorityName: string;
    officialUrl: string;
    lastVerifiedDate: string;
  }>;
  disclaimer: string;
  provider: 'gemini' | 'grounded-fallback';
}

/**
 * Builds verified government knowledge base from SQLite database
 */
async function fetchVerifiedSourcesContext() {
  try {
    const programs = await prisma.visaProgram.findMany({
      where: { isActive: true },
      include: {
        officialSources: true,
        documentRequirements: true,
      },
    });

    const contextSnippets = programs.map((p) => {
      const sources = p.officialSources
        .map((s) => `Authority: ${s.authorityName} | Official Portal: ${s.officialUrl} | Verified: ${s.lastVerifiedDate}`)
        .join('; ');
      const docs = p.documentRequirements.map((d) => `${d.title} (${d.isMandatory ? 'Mandatory' : 'Optional'})`).join(', ');

      return `[COUNTRY: ${p.country} (${p.countryCode})]
Visa Program: ${p.title}
Category: ${p.category} | Flow: ${p.flow}
Processing Time: ${p.processingTime} | Validity: ${p.validity} | Fee: ${p.feeCurrency} ${p.feeAmount}
Eligibility Summary: ${p.eligibilitySummary}
Required Documents: ${docs}
Verified Government Sources: ${sources}`;
    });

    return {
      text: contextSnippets.join('\n\n'),
      programs,
    };
  } catch (err) {
    console.error('Error fetching verified visa sources:', err);
    return { text: '', programs: [] };
  }
}

export async function askVisaAssistant(
  userQuery: string,
  history: ChatMessageInput[] = [],
  preferredLang: 'en' | 'gu' | 'hi' = 'en'
): Promise<AiChatResponse> {
  const { text: verifiedKnowledge, programs } = await fetchVerifiedSourcesContext();

  // Find relevant sources
  const relevantSources = programs
    .filter((p) =>
      userQuery.toLowerCase().includes(p.country.toLowerCase()) ||
      userQuery.toLowerCase().includes(p.countryCode.toLowerCase()) ||
      (p.flow === 'WORLD_TO_INDIA' && userQuery.toLowerCase().includes('india'))
    )
    .flatMap((p) =>
      p.officialSources.map((s) => ({
        country: s.country,
        authorityName: s.authorityName,
        officialUrl: s.officialUrl,
        lastVerifiedDate: s.lastVerifiedDate,
      }))
    );

  const fallbackDisclaimer =
    preferredLang === 'gu'
      ? 'નોંધ: વિઝા નિયમો સંબંધિત સરકારના અધિકૃત પોર્ટલ અનુસાર બદલાઈ શકે છે. આ માત્ર સલાહકારી માર્ગદર્શન છે અને વિઝા મંજૂરીની ખાતરી આપતું નથી.'
      : preferredLang === 'hi'
      ? 'सूचना: वीजा नियम संबंधित सरकार के आधिकारिक पोर्टल के अनुसार परिवर्तनशील हैं। यह केवल परामर्श मार्गदर्शन है और वीजा स्वीकृति की कोई गारंटी नहीं देता है।'
      : 'Disclaimer: Visa regulations, fees, and processing times are determined solely by government immigration authorities. This guidance is advisory and does not guarantee visa approval.';

  const ai = getGenAI();

  if (!ai) {
    // High-quality grounded fallback when API key is not configured in local environment
    const matchedProgram = programs.find((p) =>
      userQuery.toLowerCase().includes(p.country.toLowerCase())
    );

    let reply = '';
    if (matchedProgram) {
      const source = matchedProgram.officialSources[0];
      const sourceUrl = source ? source.officialUrl : matchedProgram.officialPortalUrl;
      const authority = source ? source.authorityName : 'Official Immigration Department';

      if (preferredLang === 'gu') {
        reply = `નમસ્તે! ${matchedProgram.country} માટેની ${matchedProgram.title} સંબંધિત માહિતી નીચે મુજબ છે:\n\n• પ્રોસેસિંગ સમય: ${matchedProgram.processingTime}\n• માન્યતા: ${matchedProgram.validity}\n• સરકારી ફી: ${matchedProgram.feeCurrency} ${matchedProgram.feeAmount}\n• પાત્રતા: ${matchedProgram.eligibilitySummary}\n\nઅધિકૃત સરકારી પોર્ટલ: ${sourceUrl} (${authority}).\nવિસ્તૃત દસ્તાવેજ ચકાસણી માટે AuraVisa કન્સલ્ટન્ટ સાથે પરામર્શ બુક કરો.`;
      } else if (preferredLang === 'hi') {
        reply = `नमस्ते! ${matchedProgram.country} के लिए ${matchedProgram.title} की सत्यापित सरकारी जानकारी:\n\n• प्रोसेसिंग समय: ${matchedProgram.processingTime}\n• वैधता: ${matchedProgram.validity}\n• सरकारी शुल्क: ${matchedProgram.feeCurrency} ${matchedProgram.feeAmount}\n• पात्रता: ${matchedProgram.eligibilitySummary}\n\nआधिकारिक सरकारी पोर्टल: ${sourceUrl} (${authority})।\nआवेदन सहायता के लिए AuraVisa विशेषज्ञ से परामर्श बुक करें।`;
      } else {
        reply = `Hello! Here is the verified information for the **${matchedProgram.title}** (${matchedProgram.country}):\n\n• **Standard Processing**: ${matchedProgram.processingTime}\n• **Validity / Stay**: ${matchedProgram.validity}\n• **Government Fee**: ${matchedProgram.feeCurrency} ${matchedProgram.feeAmount}\n• **Eligibility Summary**: ${matchedProgram.eligibilitySummary}\n• **Official Government Authority**: ${authority}\n• **Official Portal**: ${sourceUrl}\n\nYou can submit an application through AuraVisa Global for guided document verification or schedule a 1-on-1 consultation.`;
      }
    } else {
      if (preferredLang === 'gu') {
        reply = `નમસ્તે! AuraVisa AI વિઝા સહાયકમાં આપનું સ્વાગત છે. હું તમને યુએઈ (દુબઈ), યુકે, શેન્જેન, સિંગાપોર, વિયેતનામ અને ભારત માટે ઈ-વિઝાના અધિકૃત નિયમો, જરૂરી દસ્તાવેજો અને પ્રક્રિયા સમજાવી શકું છું. આપ કયા દેશ માટે પ્રવાસ કરવાનું આયોજન કરી રહ્યા છો?`;
      } else if (preferredLang === 'hi') {
        reply = `नमस्ते! AuraVisa AI वीजा सहायक में आपका स्वागत है। मैं आपको यूएई (दुबई), यूके, शेंगेन, सिंगापुर, वियतनाम और भारत के ई-वीजा के आधिकारिक नियमों, आवश्यक दस्तावेजों और आवेदन प्रक्रिया में मार्गदर्शन कर सकता हूँ। आप किस देश की यात्रा की योजना बना रहे हैं?`;
      } else {
        reply = `Welcome to AuraVisa Global AI Visa Assistant. I can help guide you through verified e-Visa requirements, document checklists, and application procedures for UAE (Dubai), UK, Schengen Europe, Singapore, Vietnam, and India. Which destination country are you planning to visit?`;
      }
    }

    return {
      reply,
      language: preferredLang,
      sources: relevantSources.length > 0 ? relevantSources : programs.slice(0, 2).flatMap((p) => p.officialSources),
      disclaimer: fallbackDisclaimer,
      provider: 'grounded-fallback',
    };
  }

  // Gemini API is configured: call gemini-3.8-flash with prompt and system instructions
  try {
    const systemPrompt = `You are the AuraVisa Global Senior e-Visa Consultant and Immigration Guide.
You assist travelers with visa requirements, document checklists, eligibility criteria, and step-by-step processes.

STRICT ACCURACY RULES:
1. Supported Languages: English, Gujarati (ગુજરાતી), and Hindi (हिंदी). You MUST respond in the language requested by the user or preferred language '${preferredLang}'.
2. Grounding: You must use the verified government visa data provided below. NEVER invent immigration rules, government fees, processing times, or government URLs.
3. If information is uncertain or not covered in the verified database, explicitly state uncertainty and refer the user to the official government portal or suggest booking an AuraVisa specialist consultation.
4. NEVER guarantee visa approval. Visa issuance is the sole prerogative of sovereign immigration authorities.
5. Provide clear, professional, well-formatted responses with bullet points, required document checklists, and verified official government portal links.

VERIFIED GOVERNMENT VISA DATABASE:
${verifiedKnowledge}

User preferred language: ${preferredLang} (${preferredLang === 'gu' ? 'Gujarati' : preferredLang === 'hi' ? 'Hindi' : 'English'}).`;

    const conversationHistory = history
      .slice(-6)
      .map((m) => `${m.role === 'user' ? 'Traveler' : 'AuraVisa Consultant'}: ${m.content}`)
      .join('\n');

    const fullPrompt = `${conversationHistory ? `Previous conversation:\n${conversationHistory}\n\n` : ''}Traveler Query: ${userQuery}\n\nPlease provide a helpful, structured response in ${
      preferredLang === 'gu' ? 'Gujarati' : preferredLang === 'hi' ? 'Hindi' : 'English'
    }. Include the official government portal URL where applicable.`;

    const apiCallPromise = ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.3,
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI assistant response timeout after 8000ms')), 8000)
    );

    const response = await Promise.race([apiCallPromise, timeoutPromise]);
    const reply = response.text || 'Thank you for your inquiry. Please consult our official visa listing or book a consultation.';

    return {
      reply,
      language: preferredLang,
      sources: relevantSources.length > 0 ? relevantSources : programs.slice(0, 2).flatMap((p) => p.officialSources),
      disclaimer: fallbackDisclaimer,
      provider: 'gemini',
    };
  } catch (error: any) {
    console.error('Gemini API call failed, using grounded fallback:', error?.message);

    // Safe failure state as instructed in prompt
    return {
      reply:
        preferredLang === 'gu'
          ? `ક્ષમા કરશો, AI સર્વિસ હાલમાં વ્યસ્ત છે. AuraVisa ની ચકાસાયેલ માહિતી અનુસાર: કૃપા કરીને તમારા પાસપોર્ટની ઓછામાં ઓછી ૬ મહિનાની માન્યતા અને સંબંધિત સરકારી પોર્ટલની વિગતો તપાસો અથવા અમારા વિઝા નિષ્ણાત સાથે પરામર્શ બુક કરો.`
          : preferredLang === 'hi'
          ? `क्षमा करें, AI सेवा अस्थायी रूप से व्यस्त है। AuraVisa की सत्यापित जानकारी के अनुसार: कृपया सुनिश्चित करें कि आपका पासपोर्ट कम से कम 6 महीने वैध हो और आधिकारिक सरकारी पोर्टल पर स्थिति देखें या हमारे सलाहकार से संपर्क करें।`
          : `We encountered a temporary delay connecting to the AI engine. According to AuraVisa's verified knowledge base: Ensure your passport has at least 6 months remaining validity. You can review detailed document requirements in our Visa Catalog or schedule a consultation with our verified consultants.`,
      language: preferredLang,
      sources: relevantSources.length > 0 ? relevantSources : [],
      disclaimer: fallbackDisclaimer,
      provider: 'grounded-fallback',
    };
  }
}
