import React, { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import {
  Briefcase,
  Users,
  FileCheck,
  Calendar,
  CheckSquare,
  LogOut,
  Globe,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';

export const ConsultantLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { name: 'Case Desk', path: '/consultant/dashboard', icon: Briefcase },
    { name: 'Assigned Applicants', path: '/consultant/customers', icon: Users },
    { name: 'Case Verification', path: '/consultant/applications', icon: FileCheck },
    { name: 'Scheduled Consultations', path: '/consultant/appointments', icon: Calendar },
    { name: 'Action Tasks', path: '/consultant/tasks', icon: CheckSquare },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <Briefcase className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-900 text-sm">Consultant Case Desk</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-slate-600 hover:text-slate-900 rounded-md"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand */}
          <div className="p-6 border-b border-slate-100 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 tracking-tight block">
                AuraVisa<span className="text-blue-600">.</span>
              </span>
              <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider block">
                Senior Case Desk
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 border border-blue-100'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/60">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
              {user?.profile?.firstName?.charAt(0) || 'C'}
            </div>
            <div className="overflow-hidden">
              <span className="text-xs font-bold text-slate-900 block truncate">
                {user?.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user?.email}
              </span>
              <span className="text-[10px] text-blue-600 font-semibold block uppercase tracking-wider">
                Accredited Specialist
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
            <Link
              to="/"
              className="py-1.5 px-2 text-center text-[11px] font-medium text-slate-600 hover:text-blue-600 bg-white border border-slate-200 rounded-lg flex items-center justify-center space-x-1"
            >
              <span>Site</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
            <button
              onClick={() => logout()}
              className="py-1.5 px-2 text-center text-[11px] font-medium text-red-600 hover:bg-red-50 bg-white border border-slate-200 rounded-lg flex items-center justify-center space-x-1 cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ConsultantLayout;
