import { useEffect, useRef, useState } from 'react';
import {
    fetchNotifications,
    fetchUnreadCount,
    markAllAsRead,
    markAsRead,
} from '../../../backend/notificationsService.js';
import './Notifications.css';
import { LoadingSpinner } from '../../common';
import PropTypes from 'prop-types';


function Notifications({ userId }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [items, setItems] = useState([]);
    const [unread, setUnread] = useState(0);
    const panelRef = useRef(null);

    // Cargar el conteo de notificaciones no leídas al iniciar
    useEffect(() => {
        const loadUnreadCount = async () => {
            try {
                const c = await fetchUnreadCount(userId).then(res => res);
                setUnread(Number(c));
            } catch (e) {
                console.error('Error loading unread count:', e);
            }
        };
        
        if (userId) {
            loadUnreadCount();
        }
    }, [userId]);

    const openDropdown = async () => {
        setOpen(true);
        setLoading(true);
        setError(null);
        try {
            const c = await fetchUnreadCount(userId).then(res => res);
            setUnread(Number(c));
            const list = await fetchNotifications(userId).then(res => res);
            setItems(list);
        } catch (e) {
            setError(e.message || 'Error loading notifications');
        } finally {
            setLoading(false);
        }
    };

    const closeDropdown = () => {
        setOpen(false);
    };

    useEffect(() => {
        if (!open) return;
        function onDocClick(e) {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                closeDropdown();
            }
        }
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, [open]);

    const handleMarkAll = async () => {
        try {
            console.log('Marking all as read for user:', userId);
            const response = await markAllAsRead(userId);
            console.log('Mark all response:', response);
            setUnread(0);
            setItems((prev) => prev.map((n) => ({ ...n, read: true })));
        } catch (e) {
            console.error('Error marking all as read:', e);
            setError(e.message || 'Error marking as read');
        }
    };

    const handleMarkOne = async (notificationId) => {
        if (!notificationId) {
            console.error('No notification ID provided');
            return;
        }

        try {
            console.log('Marking notification as read:', notificationId);
            const response = await markAsRead(userId, notificationId);
            console.log('Mark as read response:', response);
            
            setUnread((prev) => Math.max(0, prev - 1));
            setItems((prev) =>
                prev.map((n) =>
                    n.id === notificationId ? { ...n, read: true } : n
                )
            );
        } catch (e) {
            console.error('Error marking notification as read:', e);
        }
    };

    return (
        <div className="ntf-container">
            <button
                type="button"
                aria-label="Abrir notificaciones"
                className="ntf-bell-btn"
                onClick={() => (open ? closeDropdown() : openDropdown())}
            >
                <BellIcon />
                {unread > 0 && (
                    <span className="ntf-badge" aria-label={`${unread} sin leer`}>{unread > 99 ? '99+' : unread}</span>
                )}
            </button>

            {open && (
                <dialog
                    ref={panelRef}
                    className="ntf-panel"
                    aria-label="Notificaciones"
                    open={open}
                >
                    <div className="ntf-panel-header">
                        <div className="ntf-header-content">
                            <h3 className="ntf-title-main">Notificaciones</h3>
                            {unread > 0 && (
                                <span className="ntf-unread-count">{unread} nueva{unread !== 1 ? 's' : ''}</span>
                            )}
                        </div>
                        <div className="ntf-actions">
                            {items.length > 0 && unread > 0 && (
                                <button className="ntf-markall" onClick={handleMarkAll} title="Marcar todas como leídas">
                                    <CheckAllIcon />
                                    <span>Marcar todas</span>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="ntf-content">
                        {loading && (
                            <div className="ntf-empty">
                                <LoadingSpinner overlay={false} size="sm" message="" className="ntf-inline-spinner" />
                                <span>Cargando notificaciones...</span>
                            </div>
                        )}
                        
                        {error && (
                            <div className="ntf-error">
                                <ErrorIcon />
                                <span>{error}</span>
                            </div>
                        )}

                        {!loading && !error && items.length === 0 && (
                            <div className="ntf-empty">
                                <EmptyIcon />
                                <span>No hay notificaciones</span>
                            </div>
                        )}

                        {!loading && !error && items.length > 0 && (
                            <ul className="ntf-list">
                                {items.map((n, index) => (
                                    <li 
                                        key={n.id || index} 
                                        className={`ntf-item ${n.read ? '' : 'ntf-unread'}`}
                                    >
                                        <button
                                            type="button"
                                            className="ntf-item-button"
                                            onClick={() => {
                                                console.log('Clicked notification:', n);
                                                if (!n.read && n.id) {
                                                    handleMarkOne(n.id);
                                                }
                                            }}
                                            aria-label={n.read ? `Notificación leída: ${n.title}` : `Marcar como leída: ${n.title}`}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                padding: 0,
                                                width: '100%',
                                                textAlign: 'left',
                                                cursor: n.read || !n.id ? 'default' : 'pointer'
                                            }}
                                        >
                                            {!n.read && <span className="ntf-dot" aria-hidden="true" />}
                                            <div className="ntf-item-content">
                                                <div className="ntf-item-title">{n.title}</div>
                                                <div className="ntf-message">{n.message}</div>
                                                <div className="ntf-meta">
                                                    <TimeIcon />
                                                    {formatRelativeTime(n.createdAt)}
                                                </div>
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </dialog>
            )}
        </div>
    );
}

Notifications.propTypes = {
    userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};

function BellIcon() {
    return (
        <svg className="ntf-bell" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
    );
}

function CheckAllIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
    );
}

function TimeIcon() {
    return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    );
}

function EmptyIcon() {
    return (
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.3">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
    );
}

function ErrorIcon() {
    return (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    );
}

/* Using shared LoadingSpinner from common components to keep styling consistent */

function formatRelativeTime(isoLike) {
    if (!isoLike) return '';
    const d = new Date(isoLike);
    const diff = Date.now() - d.getTime();
    const sec = Math.floor(diff / 1000);
    const min = Math.floor(sec / 60);
    const hr = Math.floor(min / 60);
    const day = Math.floor(hr / 24);
    if (sec < 60) return `hace ${sec}s`;
    if (min < 60) return `hace ${min}m`;
    if (hr < 24) return `hace ${hr}h`;
    if (day < 7) return `hace ${day}d`;
    return d.toLocaleString();
}

export default Notifications