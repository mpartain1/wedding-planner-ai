import React from 'react';
import { Calendar, Heart } from 'lucide-react';

const Header: React.FC = () => {
  // Get wedding details from environment or defaults
  const weddingName = import.meta.env.VITE_WEDDING_PLANNER_NAME || "Sarah's Wedding";
  const weddingDate = import.meta.env.VITE_WEDDING_DATE || "September 15, 2024";

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  return (
    <header className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Left side - Clean logo/brand */}
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 bg-gradient-to-br from-rose-400 to-pink-500 rounded-lg flex items-center justify-center shadow-sm">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-normal text-gray-700 italic" style={{ fontFamily: 'Georgia, serif', fontSize: '18px' }}>{weddingName}</h1>
            </div>
          </div>
          
          {/* Right side - Wedding date */}
          <div className="flex items-center space-x-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{formatDate(weddingDate)}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;