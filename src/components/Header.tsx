
import React from 'react';
import AdminLoginButton from '@/components/AdminLoginButton';
import AuthButton from '@/components/AuthButton';

interface HeaderProps {
  onAdminLogin?: (password: string) => void;
  isAdmin?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onAdminLogin, isAdmin }) => {
  return (
    <header className="w-full py-4 border-b-2 border-black">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          {/* Empty div for layout balance */}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-center font-mono tracking-tight uppercase flex-1">
          LIVE STREAM REPORT
        </h1>
        <div className="flex items-center gap-4 flex-1 justify-end">
          <AuthButton />
          {!isAdmin && onAdminLogin && (
            <AdminLoginButton onLogin={onAdminLogin} />
          )}
        </div>
      </div>
      <div className="flex justify-center">
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
