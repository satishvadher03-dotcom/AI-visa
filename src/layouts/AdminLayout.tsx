import React, { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import {
  Shield,
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  Calendar,
  Globe2,
  FileCheck2,
  Activity,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { name: 'System Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Consultant Directory', path: '/admin/consultants', icon: Briefcase },
    { name: 'Case Assignments', path: '/admin/applications', icon: FileText },
    { name: 'All Consultations', path: '/admin/appointments', icon: Calendar },
    { name: 'Visa Programs (CRUD)', path: '/admin/visa-programs', icon: Globe2 },
    { name: 'Document Rules', path: '/admin/document-requirements', icon: FileCheck2 },
    { name: 'Security Audit Logs', path: '/admin/audit-logs', icon: Activity },
    { name: 'System Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white">
            <Shield className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-900 text-sm">Super Admin Console</span>
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
        <div className="overflow-y-auto">
          {/* Brand */}
          <div className="p-6 border-b border-slate-100 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 tracking-tight block">
                AuraVisa<span className="text-red-600">.</span>
              </span>
              <span className="text-[10px] font-semibold text-red-600 uppercase tracking-wider block">
                Executive Console
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
                    `flex items-center space-x-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? 'bg-red-50 text-red-700 border border-red-100'
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
        <div className="p-4 border-t border-slate-200 bg-slate-50/60 shrink-0">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-red-100 text-red-700 font-bold flex items-center justify-center text-xs shrink-0">
              A
            </div>
            <div className="overflow-hidden">
              <span className="text-xs font-bold text-slate-900 block truncate">
                {user?.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user?.email}
              </span>
              <span className="text-[10px] text-red-600 font-semibold block uppercase tracking-wider">
                System Administrator
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

export default AdminLayout;
