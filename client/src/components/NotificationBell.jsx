import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { notificationApi } from '../api/reviewApi';

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef(null);

  const load = async () => {
    try {
      const { data } = await notificationApi.mine({ limit: 8 });
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      // silent — notification polling shouldn't disrupt the UI
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = async () => {
    setOpen((o) => !o);
  };

  const handleItemClick = async (n) => {
    if (!n.isRead) {
      try {
        await notificationApi.markRead(n._id);
        setUnreadCount((c) => Math.max(0, c - 1));
        setNotifications((list) => list.map((item) => (item._id === n._id ? { ...item, isRead: true } : item)));
      } catch {
        // ignore
      }
    }
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-lg hover:bg-ink-50 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={20} className="text-ink-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-rust-500 text-white text-[0.62rem] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-paper-soft border border-ink-100 rounded-card shadow-card z-50 max-h-96 overflow-y-auto">
          <div className="px-4 py-3 border-b border-ink-100 flex items-center justify-between">
            <p className="font-semibold text-sm text-ink-800">Notifications</p>
          </div>
          {notifications.length === 0 ? (
            <p className="text-sm text-ink-400 text-center py-8">No notifications yet.</p>
          ) : (
            <ul>
              {notifications.map((n) => (
                <li key={n._id} className="border-b border-ink-50 last:border-b-0">
                  <Link
                    to={n.link || '#'}
                    onClick={() => handleItemClick(n)}
                    className={`block px-4 py-3 hover:bg-ink-50 transition-colors ${!n.isRead ? 'bg-brass-50/40' : ''}`}
                  >
                    <p className="text-sm font-medium text-ink-800">{n.title}</p>
                    <p className="text-xs text-ink-500 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[0.68rem] text-ink-300 mt-1">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
