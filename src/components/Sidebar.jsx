import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, CreditCard, MessageSquare, Bell,
  UserCog, BarChart3, LogOut, Shield, Wrench, CalendarCheck,
  Building2, ClipboardList,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const navConfig = {
  admin: [
    { to: '/admin',            label: 'Dashboard',      icon: LayoutDashboard },
    { to: '/admin/residents',  label: 'Residents',      icon: Users },
    { to: '/admin/fees',       label: 'Fees',           icon: CreditCard },
    { to: '/admin/complaints', label: 'Complaints',     icon: MessageSquare },
    { to: '/admin/notices',    label: 'Notices',        icon: Bell },
    { to: '/admin/amenities',  label: 'Amenities',      icon: Building2 },
    { to: '/admin/staff',      label: 'Staff',          icon: UserCog },
    { to: '/admin/reports',    label: 'Reports',        icon: BarChart3 },
  ],
  resident: [
    { to: '/resident',              label: 'Dashboard',  icon: LayoutDashboard },
    { to: '/resident/fees',         label: 'My Fees',    icon: CreditCard },
    { to: '/resident/complaints',   label: 'Complaints', icon: MessageSquare },
    { to: '/resident/amenities',    label: 'Amenities',  icon: Building2 },
    { to: '/resident/notices',      label: 'Notices',    icon: Bell },
  ],
  security: [
    { to: '/security',          label: 'Dashboard',  icon: LayoutDashboard },
    { to: '/security/visitors', label: 'Visitor Log', icon: ClipboardList },
  ],
  maintenance: [
    { to: '/maintenance',             label: 'Dashboard',  icon: LayoutDashboard },
    { to: '/maintenance/tasks',       label: 'My Tasks',   icon: ClipboardList },
    { to: '/maintenance/complaints',  label: 'Complaints', icon: MessageSquare },
  ],
};

const roleColors = {
  admin:       { bg: 'from-primary-900 to-primary-800', accent: 'primary' },
  resident:    { bg: 'from-emerald-900 to-emerald-800', accent: 'emerald' },
  security:    { bg: 'from-slate-900 to-slate-800',     accent: 'slate' },
  maintenance: { bg: 'from-orange-900 to-orange-800',   accent: 'orange' },
};

const roleIcons = {
  admin: <Shield size={16} />,
  resident: <Users size={16} />,
  security: <Shield size={16} />,
  maintenance: <Wrench size={16} />,
};

export function Sidebar() {
  const { user, logout, societyInfo } = useAuthStore();
  const nav = navConfig[user?.role] || [];
  const colors = roleColors[user?.role] || roleColors.admin;

  return (
    <div className={`w-60 h-full bg-gradient-to-b ${colors.bg} flex flex-col text-white flex-shrink-0`}>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <Building2 size={16} />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight">{societyInfo?.name || 'Society Mgmt'}</p>
            <p className="text-[10px] text-white/50 uppercase tracking-wider">Management System</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="bg-white/10 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
              {user?.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              {user?.flat_no && <p className="text-[11px] text-white/60">Flat {user.flat_no}</p>}
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-white/50">{roleIcons[user?.role]}</span>
            <span className="text-xs text-white/60 capitalize">{user?.role}</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === `/admin` || to === `/resident` || to === `/security` || to === `/maintenance`}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-white/20 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all w-full"
        >
          <LogOut size={17} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
