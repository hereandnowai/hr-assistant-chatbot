import React from 'react';
import FeatureCard from './FeatureCard';
import { BRAND_CONFIG } from '../constants';
import { CalendarDays, Gift, ScrollText, UsersRound, ConciergeBell, Sparkles, Send } from 'lucide-react';

interface HomePageProps {
  onStartChat: () => void;
}

const features = [
  {
    icon: <CalendarDays size={40} strokeWidth={1.5} />,
    title: "Leave Management",
    description: "Understand leave types, application processes, balances, and policies. Plan your time off effectively.",
  },
  {
    icon: <Gift size={40} strokeWidth={1.5} />,
    title: "Benefits & Compensation",
    description: "Explore health insurance, retirement plans, perks, and salary details. Maximize your employee benefits.",
  },
  {
    icon: <ScrollText size={40} strokeWidth={1.5} />,
    title: "Policy Clarification",
    description: "Get clear explanations on company policies: attendance, dress code, remote work, conduct, and more.",
  },
  {
    icon: <UsersRound size={40} strokeWidth={1.5} />,
    title: "Admin & HR Support",
    description: "Assistance with document submissions, payroll queries, HR contacts, and general administrative questions.",
  },
  {
    icon: <ConciergeBell size={40} strokeWidth={1.5} />,
    title: "Onboarding & Offboarding",
    description: "Smooth guidance for new hires through onboarding and support for employees during offboarding processes.",
  },
  {
    icon: <Sparkles size={40} strokeWidth={1.5} />,
    title: "Smart Features",
    description: "Engage in multi-turn conversations, get insights from company documents, and even upload files for context.",
  },
];

const HomePage: React.FC<HomePageProps> = ({ onStartChat }) => {
  return (
    <div className="bg-white p-6 md:p-10 rounded-lg shadow-xl text-center flex-grow flex flex-col justify-center">
      <img 
        src={BRAND_CONFIG.chatbot.face} 
        alt={`${BRAND_CONFIG.organizationShortName} HR Assistant Face`}
        className="w-32 h-32 md:w-40 md:h-40 rounded-full mx-auto mb-6 shadow-md border-4 border-[#FFDF00]"
      />
      <h1 className="text-3xl md:text-4xl font-bold text-[#004040] mb-3">
        Welcome to the {BRAND_CONFIG.organizationShortName} HR Assistant!
      </h1>
      <p className="text-lg text-gray-700 mb-4">
        Your friendly, intelligent partner for all HR-related queries.
      </p>
      <p className="text-md text-gray-600 mb-10 italic">
        "{BRAND_CONFIG.slogan}"
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {features.map((feature) => (
          <FeatureCard
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>

      <button
        onClick={onStartChat}
        className="bg-[#004040] hover:bg-[#003030] text-[#FFDF00] font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out text-lg focus:outline-none focus:ring-2 focus:ring-[#FFDF00] focus:ring-opacity-75 transform hover:scale-105 flex items-center justify-center mx-auto"
      >
        <Send size={20} className="mr-2" />
        Start HR Assistant
      </button>
    </div>
  );
};

export default HomePage;
