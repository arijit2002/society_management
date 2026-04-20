import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Eye, EyeOff, Shield, Users, Wrench, Lock } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { toast } from '../../components/Toast';

const demoAccounts = [
  { label: 'Admin',       email: 'admin@society.com',  password: 'admin123',    icon: Shield,  color: 'bg-primary-50 text-primary-700 border-primary-200' },
  { label: 'Resident',    email: 'john@society.com',   password: 'resident123', icon: Users,   color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { label: 'Security',    email: 'guard1@society.com', password: 'guard123',    icon: Lock,    color: 'bg-slate-50 text-slate-700 border-slate-200' },
  { label: 'Maintenance', email: 'tech1@society.com',  password: 'staff123',    icon: Wrench,  color: 'bg-orange-50 text-orange-700 border-orange-200' },
];

export default function Login() {
  const navigate = useNavigate();
  const { setUser, setSocietyInfo } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      const res = await window.api.login({ email, password });
      if (res.success) {
        const info = await window.api.getSocietyInfo();
        setSocietyInfo(info);
        setUser(res.user);
        const routes = { admin: '/admin', resident: '/resident', security: '/security', maintenance: '/maintenance' };
        navigate(routes[res.user.role] || '/');
      } else {
        toast.error(res.message || 'Login failed');
      }
    } catch (e) {
      toast.error('Something went wrong');
    }
    setLoading(false);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    handleLogin(form.email, form.password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-0 bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Left panel */}
        <div className="bg-gradient-to-br from-primary-700 to-indigo-800 p-10 flex flex-col justify-between text-white hidden md:flex">
          <div>
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
              <Building2 size={24} />
            </div>
            <h1 className="text-3xl font-bold mb-3">Society Management System</h1>
            <p className="text-primary-200 text-sm leading-relaxed">
              A complete solution for managing residents, maintenance fees, complaints, security, and society operations — all in one place.
            </p>
          </div>
          <div className="space-y-3">
            <p className="text-xs text-primary-300 uppercase tracking-wider font-semibold">Quick Access (Demo)</p>
            {demoAccounts.map(({ label, email, password, icon: Icon, color }) => (
              <button key={label} onClick={() => handleLogin(email, password)}
                className="w-full flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-xl px-4 py-2.5 text-sm transition-all text-white">
                <Icon size={15} />
                <span className="font-medium">{label}</span>
                <span className="ml-auto text-primary-300 text-xs">{email}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="p-10 flex flex-col justify-center">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6 md:hidden">
              <Building2 size={22} className="text-primary-600" />
              <span className="font-bold text-gray-900">Society Management</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-500 text-sm mt-1">Sign in to your account to continue</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <input type="email" className="input" placeholder="you@society.com"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} className="input pr-10"
                  placeholder="Enter your password"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-2">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 md:hidden">
            <p className="text-xs text-gray-400 text-center mb-3">Quick Demo Login</p>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map(({ label, email, password }) => (
                <button key={label} onClick={() => handleLogin(email, password)}
                  className="text-xs border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 text-gray-600 transition-colors">
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
