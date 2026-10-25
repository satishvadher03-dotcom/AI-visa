import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import {
  Globe,
  Bot,
  Calendar,
  CheckCircle,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  Shield,
  Briefcase,
} from 'lucide-react';

interface NavbarProps {
  onOpenAiAssistant?: () => void;
  onOpenEligibility?: () => void;
  onOpenAppointment?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAiAssistant,
  onOpenEligibility,
  onOpenAppointment,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getPortalLink = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'CONSULTANT') return '/consultant/dashboard';
    return '/customer/dashboard';
  };

  const getRoleBadge = () => {
    if (!user) return null;
    if (user.role === 'ADMIN') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
          <Shield className="w-3 h-3 mr-1" />
          Admin
        </span>
      );
    }
    if (user.role === 'CONSULTANT') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <Briefcase className="w-3 h-3 mr-1" />
          Consultant
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <UserIcon className="w-3 h-3 mr-1" />
        Customer
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">
                AuraVisa<span className="text-blue-600 font-extrabold">.</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 block leading-none">
                Global e-Visa Systems
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              to="/visas"
              className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 rounded-md transition"
            >
              Visa Catalog
            </Link>

            <button
              onClick={onOpenEligibility}
              className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 rounded-md transition flex items-center space-x-1.5 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Eligibility Checker</span>
            </button>

            <button
              onClick={onOpenAiAssistant}
              className="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50/70 hover:bg-blue-50 rounded-md transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Bot className="w-4 h-4" />
              <span>AI Visa Assistant</span>
            </button>

            <button
              onClick={onOpenAppointment}
              className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 rounded-md transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Book Consultation</span>
            </button>

            <Link
              to="/contact"
              className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 rounded-md transition"
            >
              Support
            </Link>
          </nav>

          {/* Right Action / Auth */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                {getRoleBadge()}
                <Link
                  to={getPortalLink()}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition"
                >
                  My Workspace
                </Link>
                <button
                  onClick={() => logout()}
                  title="Sign out"
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition"
                >
                  Apply Online
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center space-x-2">
            {user && (
              <Link
                to={getPortalLink()}
                className="px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 rounded"
              >
                Portal
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-md"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          <Link
            to="/visas"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-800"
          >
            Visa Catalog
          </Link>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenEligibility?.();
            }}
            className="w-full text-left py-2 text-base font-medium text-slate-800 flex items-center justify-between"
          >
            <span>Eligibility Checker</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenAiAssistant?.();
            }}
            className="w-full text-left py-2 text-base font-medium text-blue-600 flex items-center justify-between"
          >
            <span>AI Visa Assistant</span>
            <Bot className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenAppointment?.();
            }}
            className="w-full text-left py-2 text-base font-medium text-slate-800 flex items-center justify-between"
          >
            <span>Book Consultation</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </button>
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-800"
          >
            Contact & Support
          </Link>

          <div className="pt-4 border-t border-slate-100 flex flex-col space-y-2">
            {user ? (
              <>
                <div className="flex items-center justify-between py-1">
                  <span className="text-xs text-slate-500">{user.email}</span>
                  {getRoleBadge()}
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate(getPortalLink());
                  }}
                  className="w-full py-2.5 text-center text-sm font-semibold text-white bg-blue-600 rounded-lg"
                >
                  Open Dashboard
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full py-2 text-center text-sm font-medium text-slate-600 hover:text-red-600"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center text-sm font-medium border border-slate-200 rounded-lg text-slate-700"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center text-sm font-semibold bg-blue-600 text-white rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
