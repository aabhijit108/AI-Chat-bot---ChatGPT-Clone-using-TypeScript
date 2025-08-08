
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface HeaderProps {
  onOpenProfile?: () => void;
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

export default function Header({ onOpenProfile, onToggleSidebar, sidebarOpen }: HeaderProps) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('model_api_keys');
    setUser(null);
    window.location.reload();
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4">
        <div className="flex items-center space-x-3">
          {/* Mobile Menu Button */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            <div className="w-5 h-5 flex items-center justify-center">
              {sidebarOpen ? (
                <i className="ri-close-line text-lg"></i>
              ) : (
                <i className="ri-menu-line text-lg"></i>
              )}
            </div>
          </button>

          <Link href="/" className="font-['Pacifico'] text-xl sm:text-2xl text-blue-600">
            AI Chat - ChatGPT Clone
          </Link>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          {user ? (
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-medium">
                  {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                </div>
                <span className="text-gray-700 text-xs sm:text-sm truncate max-w-24 sm:max-w-none">
                  {user.name || user.email}
                </span>
              </div>
              
              <div className="flex items-center space-x-1 sm:space-x-2">
                <button
                  onClick={onOpenProfile}
                  className="text-gray-500 hover:text-gray-700 text-xs sm:text-sm whitespace-nowrap cursor-pointer flex items-center space-x-1"
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-settings-3-line text-sm"></i>
                  </div>
                  <span className="hidden sm:inline">Profile</span>
                </button>
                <div className="w-px h-4 bg-gray-300 hidden sm:block"></div>
                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-gray-700 text-xs sm:text-sm whitespace-nowrap cursor-pointer"
                >
                  <span className="hidden sm:inline">Sign Out</span>
                  <div className="w-4 h-4 flex items-center justify-center sm:hidden">
                    <i className="ri-logout-box-line text-sm"></i>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-xs sm:text-sm">Not signed in</div>
          )}
        </div>
      </div>
    </header>
  );
}