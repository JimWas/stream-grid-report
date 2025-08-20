
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full py-4 border-b-2 border-black">
      <h1 className="text-4xl md:text-5xl font-bold text-center font-mono tracking-tight uppercase">
        LIVE STREAM REPORT
      </h1>
      <div className="flex justify-center mt-2">
        <p className="font-mono text-sm">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>
    </header>
  );
};

export default Header;
