export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default:    'bg-gray-100 text-gray-700',
    primary:    'bg-primary-100 text-primary-700',
    success:    'bg-green-100 text-green-700',
    warning:    'bg-yellow-100 text-yellow-700',
    danger:     'bg-red-100 text-red-700',
    info:       'bg-blue-100 text-blue-700',
    purple:     'bg-purple-100 text-purple-700',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
}

export function statusVariant(status) {
  const map = {
    open: 'danger', in_progress: 'warning', resolved: 'success', closed: 'default',
    pending: 'warning', paid: 'success', overdue: 'danger', waived: 'purple',
    inside: 'info', exited: 'default',
    approved: 'success', rejected: 'danger', cancelled: 'default',
    completed: 'success',
  };
  return map[status] || 'default';
}

export function priorityVariant(priority) {
  return { urgent: 'danger', high: 'warning', medium: 'info', low: 'default' }[priority] || 'default';
}

export function formatStatus(status) {
  return status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '';
}
