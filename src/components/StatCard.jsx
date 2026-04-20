export function StatCard({ title, value, subtitle, icon: Icon, color = 'primary', trend }) {
  const colors = {
    primary: 'bg-primary-50 text-primary-600',
    success: 'bg-green-50 text-green-600',
    warning: 'bg-yellow-50 text-yellow-600',
    danger:  'bg-red-50 text-red-600',
    info:    'bg-blue-50 text-blue-600',
    purple:  'bg-purple-50 text-purple-600',
  };
  return (
    <div className="card flex items-start gap-4">
      <div className={`p-3 rounded-xl ${colors[color] || colors.primary}`}>
        {Icon && <Icon size={22} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 font-medium truncate">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}
