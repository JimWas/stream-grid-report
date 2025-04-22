
import React from "react";

interface AdminLoginButtonProps {
  onLogin: (password: string) => void;
}

const AdminLoginButton: React.FC<AdminLoginButtonProps> = ({ onLogin }) => (
  <div className="text-right mb-4">
    <button
      onClick={() => {
        const password = prompt('Enter admin password:');
        if (password) {
          onLogin(password);
        }
      }}
      className="text-xs font-mono underline"
    >
      ADMIN LOGIN
    </button>
  </div>
);

export default AdminLoginButton;
