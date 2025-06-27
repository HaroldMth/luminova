import React, { useState, useEffect } from 'react';
import { formatTimeLeft } from '../../utils/helpers';

interface CountdownTimerProps {
  endDate: Date;
  onEnd?: () => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ endDate, onEnd }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const formatted = formatTimeLeft(endDate);
      setTimeLeft(formatted);
      
      if (formatted === "Ended" && onEnd) {
        onEnd();
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate, onEnd]);

  if (timeLeft === "Ended") {
    return (
      <span className="text-red-500 font-semibold">Giveaway Ended</span>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-3">
      <div className="text-center">
        <div className="text-sm text-gray-600 mb-1">Time Left</div>
        <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          {timeLeft}
        </div>
      </div>
    </div>
  );
};