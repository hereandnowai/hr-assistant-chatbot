import React from 'react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-[#FFDF00] text-[#004040] p-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out flex flex-col items-center text-center h-full">
      <div className="mb-4 text-[#004040]">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-[#004040]">{title}</h3>
      <p className="text-sm text-[#004040]/90 leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default FeatureCard;
