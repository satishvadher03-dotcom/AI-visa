import React from 'react';
import { Settings, Database, HardDrive, Bot, ShieldCheck, Terminal, Cpu } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <span className="text-xs font-bold text-red-600 uppercase tracking-wider block mb-0.5">
          System Administration
        </span>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          System Configuration & Runtime Diagnostics
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Infrastructure health, database ORM status, storage adapter, and AI service layer parameters
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Database & Storage */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
            <Database className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">Database & ORM Configuration</h3>
          </div>

          <div className="space-y-2.5 text-xs text-slate-600">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Database Engine:</span>
              <span className="font-mono font-semibold text-slate-800">SQLite 3</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">ORM Framework:</span>
              <span className="font-mono font-semibold text-slate-800">Prisma Client 6.4.1</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Database Path:</span>
              <span className="font-mono font-semibold text-slate-800">file:./prisma/dev.db</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Connection State:</span>
              <span className="font-semibold text-emerald-600">Synchronized & Seeded</span>
            </div>
          </div>
        </div>

        {/* Private Storage Adapter */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
            <HardDrive className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">Private Storage Adapter</h3>
          </div>

          <div className="space-y-2.5 text-xs text-slate-600">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Storage Location:</span>
              <span className="font-mono font-semibold text-slate-800">./storage/uploads</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Public CDN Exposure:</span>
              <span className="font-semibold text-emerald-600">NONE (Isolated outside web root)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">MIME & Magic Bytes:</span>
              <span className="font-semibold text-emerald-600">Strict Validation Active</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Naming Strategy:</span>
              <span className="font-mono font-semibold text-slate-800">UUIDv4 Randomized Keys</span>
            </div>
          </div>
        </div>

        {/* AI Engine */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
            <Bot className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-slate-900 text-sm">AI Visa Assistant Layer</h3>
          </div>

          <div className="space-y-2.5 text-xs text-slate-600">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">AI SDK:</span>
              <span className="font-mono font-semibold text-slate-800">@google/genai ^2.4.0</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Model Alias:</span>
              <span className="font-mono font-semibold text-slate-800">gemini-3.8-flash</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Grounding Knowledge:</span>
              <span className="font-semibold text-slate-800">Real-time SQLite Government DB</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Supported Languages:</span>
              <span className="font-semibold text-slate-800">English, Gujarati, Hindi</span>
            </div>
          </div>
        </div>

        {/* Security Parameters */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
            <ShieldCheck className="w-5 h-5 text-red-600" />
            <h3 className="font-bold text-slate-900 text-sm">Security & Privilege Boundaries</h3>
          </div>

          <div className="space-y-2.5 text-xs text-slate-600">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Session Cookie Name:</span>
              <span className="font-mono font-semibold text-slate-800">auravisa.sid (HttpOnly)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Password Hashing:</span>
              <span className="font-mono font-semibold text-slate-800">bcrypt (10 salt rounds)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Self-Demotion Guard:</span>
              <span className="font-semibold text-emerald-600">Active</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Audit Logging:</span>
              <span className="font-semibold text-emerald-600">All Mutating Actions Logged</span>
            </div>
          </div>
        </div>
      </div>

      {/* Deployment & PowerShell Operations Guide */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
          <Terminal className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-slate-900 text-sm">
            Windows PowerShell & Production Commands
          </h3>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <span className="font-bold text-slate-700 block mb-1">
              1. Install Dependencies & Initialize Database:
            </span>
            <pre className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-[11px] overflow-x-auto">
              npm install --legacy-peer-deps`nnpx prisma db push`nnpx tsx prisma/seed.ts
            </pre>
          </div>

          <div>
            <span className="font-bold text-slate-700 block mb-1">
              2. Start Full-Stack Development Server (Port 3000):
            </span>
            <pre className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-[11px] overflow-x-auto">
              npm run dev
            </pre>
          </div>

          <div>
            <span className="font-bold text-slate-700 block mb-1">
              3. Production Build & Execution:
            </span>
            <pre className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-[11px] overflow-x-auto">
              npm run build`n$env:NODE_ENV="production"; npm run start
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
