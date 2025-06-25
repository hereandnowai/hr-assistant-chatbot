
import { QuickAction, ApplicationSettings, MessageSender, FaqItemType, SupportedLanguage } from './types';

export const BRAND_CONFIG = {
  organizationShortName: "HERE AND NOW AI",
  organizationLongName: "HERE AND NOW AI - Artificial Intelligence Research Institute",
  website: "https://hereandnowai.com",
  email: "info@hereandnowai.com",
  mobile: "+91 996 296 1000",
  slogan: "designed with passion for innovation",
  colors: {
    primary: "#FFDF00",
    secondary: "#004040"
  },
  logo: {
    title: "https://raw.githubusercontent.com/hereandnowai/images/refs/heads/main/logos/HNAI%20Title%20-Teal%20%26%20Golden%20Logo%20-%20DESIGN%203%20-%20Raj-07.png",
    favicon: "https://raw.githubusercontent.com/hereandnowai/images/refs/heads/main/logos/favicon-logo-with-name.png"
  },
  chatbot: {
    avatar: "https://raw.githubusercontent.com/hereandnowai/images/refs/heads/main/logos/caramel.jpeg",
    face: "https://raw.githubusercontent.com/hereandnowai/images/refs/heads/main/logos/caramel-face.jpeg"
  },
  socialMedia: {
    blog: "https://hereandnowai.com/blog",
    linkedin: "https://www.linkedin.com/company/hereandnowai/",
    instagram: "https://instagram.com/hereandnow_ai",
    github: "https://github.com/hereandnowai",
    x: "https://x.com/hereandnow_ai",
    youtube: "https://youtube.com/@hereandnow_ai"
  }
};


export const COMPANY_NAME = BRAND_CONFIG.organizationShortName;
export const HR_CONTACT_INFO = `our HR team at ${BRAND_CONFIG.email} or visit our portal: ${BRAND_CONFIG.website}`;
export const HR_PORTAL_LINK = BRAND_CONFIG.website;
export const EMERGENCY_HR_CONTACT = `our emergency contact at ${BRAND_CONFIG.email} or the relevant authorities`;
export const MANAGER_CONTACT = "your direct manager";

export const QUICK_ACTIONS: QuickAction[] = [
  { label: "Leave Balance", query: "What is my current leave balance?" },
  { label: "Benefits Info", query: "Can you tell me about our health insurance benefits?" },
  { label: "Policy Search", query: "Where can I find the remote work policy?" },
  { label: "Onboarding Help", query: "I'm a new employee, what are the first steps for onboarding?" },
];

// This text will be translated if a non-English language is selected.
export const BASE_INITIAL_BOT_MESSAGE_TEXT = `Hello! I am your HR Assistant from ${COMPANY_NAME}. I can help with questions about policies, benefits, leave, and more. How can I assist you today?`;

export const getInitialBotMessage = (lang: string = 'en-US', text: string = BASE_INITIAL_BOT_MESSAGE_TEXT) => ({
  id: 'initial-bot-message-' + Date.now(),
  text: text,
  sender: MessageSender.Bot,
  timestamp: new Date(),
  lang: lang,
});


export const GEMINI_API_KEY_ERROR_MESSAGE = "Error: API_KEY environment variable is not set. Please ensure it is configured.";
export const FAILED_TO_INITIALIZE_ERROR_MESSAGE = `Failed to initialize HR Assistant for ${BRAND_CONFIG.organizationShortName}. Please try refreshing the page or check API key.`;

export const GEMINI_SYSTEM_INSTRUCTION = `You are an intelligent HR Assistant chatbot designed to help employees with their HR-related queries. You work for ${COMPANY_NAME} (${BRAND_CONFIG.organizationLongName}) and have comprehensive knowledge about company policies, benefits, leave procedures, and general HR practices.

Your Core Identity and Role:
- You are a professional, friendly, and empathetic HR assistant.
- You provide accurate, helpful, and timely responses to employee inquiries.
- You maintain confidentiality and handle sensitive information appropriately.
- You escalate complex issues to human HR representatives when necessary.

Primary Functionalities (You can assist with topics related to):
1. Leave Management Support (types of leave, application processes, balances, policies, eligibility).
2. Benefits and Compensation Information (health insurance, retirement plans, perks, salary structures, enrollment).
3. Policy Clarification (attendance, dress code, conduct, remote work, disciplinary procedures, performance reviews, compliance).
4. Administrative Assistance (document submissions, payroll, HR contacts, system access, office info).
5. Onboarding and Offboarding Support (processes, documentation, company culture, exit procedures).

Response Guidelines:
- Professional Communication: Maintain a professional yet friendly tone. Use clear, concise language, avoiding HR jargon. Provide step-by-step instructions when applicable. Offer multiple contact options for complex issues.
- Information Accuracy: Only provide information you're certain about. When uncertain, direct employees to appropriate HR personnel. Always mention that policies may be subject to change. Provide relevant policy document references when available (e.g., "You can find more details in the 'Leave Policy Document' on ${HR_PORTAL_LINK}").
- Privacy and Confidentiality: Never request or store personal sensitive information. Remind employees about confidentiality when discussing sensitive topics. Direct personal grievances to appropriate human HR representatives. Maintain professional boundaries in all interactions.

Escalation Protocol:
When you encounter queries that require human intervention, or if you are asked about personal employee records, making policy decisions/exceptions, legal advice, complex grievances, or processing actual applications/changes, respond with:
"This query requires personalized attention from our HR team. Please contact ${BRAND_CONFIG.email} or submit a ticket through ${HR_PORTAL_LINK} for detailed assistance."

Response Structure:
1. Acknowledge the employee's query with empathy.
2. Provide clear, actionable information.
3. Include relevant policy references or links when applicable (use placeholders like "[link to policy_name on ${HR_PORTAL_LINK}]").
4. Offer additional resources or next steps.
5. Invite follow-up questions.
6. Provide escalation options for complex matters as per the Escalation Protocol.

Limitations and Boundaries:
- You cannot access personal employee records or confidential data.
- You cannot make policy decisions or exceptions.
- You cannot handle legal advice or complex grievance procedures.
- You cannot process actual leave applications or benefit changes directly in this chat.
- You must escalate disciplinary matters to human HR representatives.

Emergency Protocols:
For urgent matters (safety concerns, harassment, discrimination), immediately respond:
"This appears to be an urgent matter that requires immediate attention. Please contact ${EMERGENCY_HR_CONTACT}. You can also reach out to ${MANAGER_CONTACT} if needed."

File Context:
If a user mentions uploading a file or a file is referenced in their prompt (e.g., "[Attached file: document.pdf]" or an image is provided), acknowledge it and use its potential content as context for your response if relevant. For example: "I see you've attached/mentioned [filename]. How can I help you with that?" or "Regarding the [filename] you mentioned...". If it's an image, describe it or use its content if relevant to the query.

Company Name: The company you work for is ${COMPANY_NAME}. Slogan: ${BRAND_CONFIG.slogan}.

IMPORTANT: Do not make up information if you don't know it. Politely state you cannot provide the information and suggest contacting HR.
Be concise and helpful. Use markdown for formatting lists or emphasis if it improves readability.
`;

// Settings Constants
export const SETTINGS_STORAGE_KEY = 'hrAppPreferences';

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'en-US', name: 'English (US)', geminiLangCode: 'en' },
  { code: 'fr-FR', name: 'Français (France)', geminiLangCode: 'fr' },
  { code: 'fr-CA', name: 'Français (Canada)', geminiLangCode: 'fr' }, // Gemini uses 'fr', context of Canadian French can be in prompt.
  { code: 'nl-NL', name: 'Nederlands (Netherlands)', geminiLangCode: 'nl' },
  { code: 'es-ES', name: 'Español (España)', geminiLangCode: 'es' },
  // { code: 'de-DE', name: 'Deutsch (Deutschland)', geminiLangCode: 'de' },
];

export const DEFAULT_SETTINGS: ApplicationSettings = {
  showQuickActions: true,
  preferDarkBackground: false,
  selectedLanguageCode: SUPPORTED_LANGUAGES[0].code, // Default to English
};

// Chat History Constants
export const CHAT_HISTORY_STORAGE_KEY = 'hrAppChatHistory';

// FAQ Constants
export const FAQS: FaqItemType[] = [
  {
    id: 'faq1',
    question: `How do I apply for annual leave?`,
    answer: `You can apply for annual leave through the ${COMPANY_NAME} HR Portal. Navigate to the "Leave Management" section, select "Annual Leave," fill in the required dates and reason, and submit your request. Ensure you have sufficient balance and apply at least two weeks in advance where possible. Your manager will review and approve it. You can find the detailed policy document on the portal under "Policies > Leave Policy".`
  },
  {
    id: 'faq2',
    question: `What are the company's working hours?`,
    answer: `Standard working hours at ${COMPANY_NAME} are from 9:00 AM to 5:30 PM, Monday to Friday, with a 30-minute lunch break. Some roles or departments may have different schedules based on operational needs. Please refer to your employment contract or discuss with your manager for specific details related to your role.`
  },
  {
    id: 'faq3',
    question: `How can I update my personal information (e.g., address, bank details)?`,
    answer: `To update your personal information, please log in to the HR Portal. Look for the "My Profile" or "Personal Details" section. You can usually edit your address, contact number, and emergency contact directly. For changes to bank details, there might be an additional verification step or a specific form to fill out. If you face any issues, contact HR at ${BRAND_CONFIG.email}.`
  },
  {
    id: 'faq4',
    question: `Where can I find the company's dress code policy?`,
    answer: `The ${COMPANY_NAME} dress code policy is available on the HR Portal under "Company Policies > Code of Conduct". Generally, we follow a business casual dress code. However, specific requirements may apply depending on your role, client interactions, or department. Always aim for a professional and appropriate appearance.`
  },
  {
    id: 'faq5',
    question: `What is the process for performance reviews?`,
    answer: `Performance reviews at ${COMPANY_NAME} are typically conducted annually, with a mid-year check-in. The process involves self-assessment, manager review, and a one-on-one discussion to set goals and discuss development. You'll receive notifications and guidelines from HR prior to each review cycle. More details can be found in the "Performance Management Policy" on the HR Portal.`
  },
   {
    id: 'faq6',
    question: `How do I report an IT issue?`,
    answer: `For IT issues, please submit a ticket through the IT Helpdesk Portal (link available on the company intranet or ${HR_PORTAL_LINK}/it-support). For urgent issues affecting your ability to work, you can call the IT support hotline at [IT_SUPPORT_PHONE_NUMBER_IF_APPLICABLE_OR_MENTION_PORTAL_PRIORITY]. Provide as much detail as possible about the issue, including screenshots if helpful.`
  },
  {
    id: 'faq7',
    question: `What benefits are offered for professional development?`,
    answer: `${COMPANY_NAME} encourages continuous learning. We offer access to online learning platforms, potential sponsorship for relevant certifications, and internal training sessions. Discuss your development goals with your manager, and check the "Learning & Development" section on the HR Portal for available resources and application procedures.`
  }
];

export const SPEECH_RECOGNITION_NOT_SUPPORTED = "Speech recognition is not supported by your browser. Please type your message.";
export const MICROPHONE_PERMISSION_DENIED = "Microphone permission was denied. Please enable it in your browser settings to use voice input.";
export const SPEECH_SYNTHESIS_NOT_SUPPORTED = "Speech synthesis is not supported by your browser. Bot responses will not be spoken.";
export const TRANSLATION_ERROR_MESSAGE = "Sorry, I encountered an error trying to process your message in the selected language. Please try again or switch to English.";
export const TTS_ERROR_MESSAGE = "Sorry, I could not voice the response in the selected language.";

// Helper to get Gemini language code from BCP 47 code
export const getGeminiLangCode = (bcp47Code: string): string => {
  const lang = SUPPORTED_LANGUAGES.find(l => l.code === bcp47Code);
  return lang ? lang.geminiLangCode : 'en'; // Default to English
};

// Helper to get full language name from BCP 47 code for prompts
export const getLanguageName = (bcp47Code: string): string => {
    const lang = SUPPORTED_LANGUAGES.find(l => l.code === bcp47Code);
    if (lang) { // Extract part before parenthesis if present
        const match = lang.name.match(/^([^(]+)/);
        return match ? match[1].trim() : lang.name;
    }
    return 'English';
};