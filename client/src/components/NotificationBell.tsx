import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { AppSocket } from '../context/SocketContext';
import type { AppNotification, NotificationsResponse } from '../lib/types';

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationBell({ socket }: { socket: AppSocket | null }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<NotificationsResponse>('/api/notifications?limit=10');
      setNotifications(res.data);
      setUnreadCount(res.unreadCount);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!socket) return;
    const handler = (notif: unknown) => {
      setNotifications((prev) => [notif as AppNotification, ...prev].slice(0, 10));
      setUnreadCount((c) => c + 1);
    };
    socket.on('notification', handler);
    return () => {
      socket.off('notification', handler);
    };
  }, [socket]);

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  async function handleMarkOne(notif: AppNotification) {
    setOpen(false);
    if (!notif.read) {
      setNotifications((prev) =>
        prev.map((n) => (n._id === notif._id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      try {
        await api.patch(`/api/notifications/${notif._id}/read`, {});
      } catch {
        // rollback
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, read: false } : n))
        );
        setUnreadCount((c) => c + 1);
      }
    }
    if (notif.type === 'interest_received') {
      navigate('/dashboard?tab=interest');
    } else {
      navigate('/dashboard?tab=requests');
    }
  }

  async function handleMarkAll() {
    const prev = notifications;
    const prevCount = unreadCount;
    setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await api.patch('/api/notifications/read-all', {});
    } catch {
      setNotifications(prev);
      setUnreadCount(prevCount);
    }
  }

  const badgeLabel = unreadCount > 9 ? '9+' : String(unreadCount);

  return (
    <div ref={wrapperRef} style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        onClick={() => setOpen((o) => !o)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          color: 'var(--color-forest)',
        }}
      >
        {/* Bell icon */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '0',
              right: '0',
              background: 'var(--color-clay)',
              color: 'white',
              borderRadius: '9999px',
              fontSize: '0.6rem',
              fontWeight: 700,
              fontFamily: 'var(--font-sans)',
              minWidth: '16px',
              height: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 3px',
            }}
          >
            {badgeLabel}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            width: '320px',
            background: 'var(--color-paper)',
            border: '1px solid var(--color-rule)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
            zIndex: 100,
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderBottom: '1px solid var(--color-rule)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontWeight: 700,
                fontSize: '1rem',
                color: 'var(--color-ink)',
              }}
            >
              Notifications
            </span>
            <button
              onClick={handleMarkAll}
              disabled={unreadCount === 0}
              style={{
                background: 'none',
                border: 'none',
                cursor: unreadCount === 0 ? 'default' : 'pointer',
                color: unreadCount === 0 ? 'var(--color-forest)' : 'var(--color-clay)',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.75rem',
                fontWeight: 600,
                opacity: unreadCount === 0 ? 0.5 : 1,
              }}
            >
              Mark all read
            </button>
          </div>

          {/* Body */}
          <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
            {loading && (
              <div style={{ padding: '12px 16px' }}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="skeleton"
                    style={{
                      height: '48px',
                      marginBottom: '8px',
                      background: 'var(--color-rule)',
                    }}
                  />
                ))}
              </div>
            )}
            {!loading && error && (
              <div
                style={{
                  padding: '24px 16px',
                  textAlign: 'center',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.85rem',
                  color: 'var(--color-clay)',
                }}
              >
                {error}
                <br />
                <button
                  onClick={fetchNotifications}
                  style={{
                    marginTop: '8px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-clay)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                    textDecoration: 'underline',
                    fontSize: '0.8rem',
                  }}
                >
                  Retry
                </button>
              </div>
            )}
            {!loading && !error && notifications.length === 0 && (
              <div
                style={{
                  padding: '32px 16px',
                  textAlign: 'center',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.875rem',
                  color: 'var(--color-forest)',
                }}
              >
                No notifications yet.
              </div>
            )}
            {!loading &&
              !error &&
              notifications.map((notif) => (
                <button
                  key={notif._id}
                  onClick={() => handleMarkOne(notif)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    width: '100%',
                    padding: '12px 16px',
                    background: notif.read ? 'transparent' : '#fdf6f0',
                    border: 'none',
                    borderBottom: '1px solid var(--color-rule)',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {/* Unread dot */}
                  <span
                    style={{
                      flexShrink: 0,
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: notif.read ? 'transparent' : 'var(--color-clay)',
                      marginTop: '4px',
                    }}
                    aria-hidden="true"
                  />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        display: 'block',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.85rem',
                        color: 'var(--color-ink)',
                        lineHeight: 1.4,
                      }}
                    >
                      {notif.message}
                    </span>
                    <span
                      style={{
                        display: 'block',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.75rem',
                        color: 'var(--color-forest)',
                        marginTop: '2px',
                      }}
                    >
                      {relativeTime(notif.createdAt)}
                    </span>
                  </span>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
