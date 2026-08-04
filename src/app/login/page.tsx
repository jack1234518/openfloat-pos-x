'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Building2, Mail, Lock, AlertCircle, UserCircle, ChevronDown } from 'lucide-react';

// All available roles with their credentials
const DEMO_CREDENTIALS = {
  Owner: {
    email: 'owner@openfloat.com',
    password: 'admin123',
    icon: '👑',
    description: 'Full system access'
  },
  Director: {
    email: 'director@openfloat.com',
    password: 'director123',
    icon: '🎯',
    description: 'Executive oversight'
  },
  'Branch Manager': {
    email: 'manager@openfloat.com',
    password: 'manager123',
    icon: '📊',
    description: 'Branch operations'
  },
  Accountant: {
    email: 'accountant@openfloat.com',
    password: 'accountant123',
    icon: '💰',
    description: 'Financial management'
  },
  Storekeeper: {
    email: 'storekeeper@openfloat.com',
    password: 'storekeeper123',
    icon: '📦',
    description: 'Inventory management'
  },
  Cashier: {
    email: 'cashier@openfloat.com',
    password: 'cashier123',
    icon: '💳',
    description: 'POS operations'
  },
  'Human Resource Officer': {
    email: 'hr@openfloat.com',
    password: 'hr123',
    icon: '👔',
    description: 'HR management'
  },
  'Procurement Officer': {
    email: 'procurement@openfloat.com',
    password: 'procurement123',
    icon: '📋',
    description: 'Procurement management'
  },
  'Sales Representative': {
    email: 'sales@openfloat.com',
    password: 'sales123',
    icon: '🤝',
    description: 'Sales operations'
  },
  'Delivery Rider': {
    email: 'rider@openfloat.com',
    password: 'rider123',
    icon: '🚚',
    description: 'Logistics & delivery'
  },
  'System Administrator': {
    email: 'admin@openfloat.com',
    password: 'admin123',
    icon: '🛠️',
    description: 'System administration'
  }
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('Owner');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  // Auto-fill credentials when role is selected
  const handleRoleSelect = (role: string) => {
    const creds = DEMO_CREDENTIALS[role as keyof typeof DEMO_CREDENTIALS];
    if (creds) {
      setSelectedRole(role);
      setEmail(creds.email);
      setPassword(creds.password);
      setShowRoleDropdown(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
        setLoading(false);
        return;
      }

      router.push('/');
      router.refresh();
    } catch (error) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-blue-600 p-3 rounded-xl text-white shadow-lg">
              <Building2 className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">OpenFloat POS X</h1>
          <p className="text-slate-400 mt-2">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <div className="bg-slate-950/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-800 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-950/50 border border-red-800 rounded-xl p-3 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <span className="text-sm text-red-300">{error}</span>
              </div>
            )}

            {/* Role Selection Dropdown */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Select Role
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white flex items-center justify-between hover:bg-slate-800 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {DEMO_CREDENTIALS[selectedRole as keyof typeof DEMO_CREDENTIALS]?.icon || '👤'}
                    </span>
                    <div className="text-left">
                      <div className="font-medium">{selectedRole}</div>
                      <div className="text-xs text-slate-400">
                        {DEMO_CREDENTIALS[selectedRole as keyof typeof DEMO_CREDENTIALS]?.description || ''}
                      </div>
                    </div>
                  </div>
                  <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Role Dropdown Menu */}
                {showRoleDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto">
                    {Object.entries(DEMO_CREDENTIALS).map(([role, creds]) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => handleRoleSelect(role)}
                        className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-slate-800 transition border-b border-slate-800/50 last:border-0 ${
                          selectedRole === role ? 'bg-slate-800/50' : ''
                        }`}
                      >
                        <span className="text-2xl">{creds.icon}</span>
                        <div className="flex-1">
                          <div className="font-medium text-white">{role}</div>
                          <div className="text-xs text-slate-400">{creds.description}</div>
                        </div>
                        {selectedRole === role && (
                          <span className="text-blue-400">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition transform hover:scale-[1.02] shadow-lg shadow-blue-900/30"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="text-center text-xs text-slate-500 border-t border-slate-800 pt-4">
              <p className="mb-2 text-slate-400">Quick Select Role:</p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {Object.entries(DEMO_CREDENTIALS).slice(0, 4).map(([role, creds]) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleRoleSelect(role)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition ${
                      selectedRole === role 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {creds.icon} {role.length > 12 ? role.substring(0, 10) + '…' : role}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap justify-center gap-1.5 mt-1">
                {Object.entries(DEMO_CREDENTIALS).slice(4).map(([role, creds]) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleRoleSelect(role)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition ${
                      selectedRole === role 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {creds.icon} {role.length > 12 ? role.substring(0, 10) + '…' : role}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-slate-500">
          <p>OpenFloat POS X v4.0 — Intelligent Commerce Platform</p>
        </div>
      </div>
    </div>
  );
}