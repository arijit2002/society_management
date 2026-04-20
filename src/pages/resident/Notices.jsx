import { useEffect, useState } from 'react';
import { Bell, AlertTriangle, Info } from 'lucide-react';
import { Badge } from '../../components/Badge';

const priorityIcons = {
  urgent: <AlertTriangle size={14} className="text-red-500"/>,
  important: <Bell size={14} className="text-yellow-500"/>,
  normal: <Info size={14} className="text-blue-400"/>,
};
const priorityBorder = { urgent:'border-l-4 border-red-500', important:'border-l-4 border-yellow-400', normal:'border-l-4 border-blue-300' };

export default function ResidentNotices() {
  const [notices, setNotices] = useState([]);

  useEffect(() => { window.api.getNotices().then(setNotices); }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">Notices & Announcements</h1>
        <p className="text-sm text-gray-500">{notices.length} active notices</p>
      </div>

      {notices.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <Bell size={36} className="mx-auto mb-3 opacity-30"/>
          <p>No notices at this time</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notices.map(n => (
            <div key={n.id} className={`card ${priorityBorder[n.priority]||''}`}>
              <div className="flex items-start gap-3 mb-2">
                {priorityIcons[n.priority]}
                <h3 className="font-semibold text-gray-900">{n.title}</h3>
                <div className="flex gap-1 ml-auto">
                  <Badge variant={n.priority==='urgent'?'danger':n.priority==='important'?'warning':'info'}>{n.priority}</Badge>
                  <Badge variant="default">{n.category}</Badge>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{n.content}</p>
              <div className="flex gap-4 mt-3 text-xs text-gray-400">
                <span>Posted: {n.created_at?.split('T')[0]}</span>
                {n.expires_at && <span>Expires: {n.expires_at?.split('T')[0]}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
