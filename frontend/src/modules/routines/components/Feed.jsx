import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FormattedMessage, FormattedDate, FormattedTime } from 'react-intl';
import PropTypes from 'prop-types';

import backend from '../../../backend';
import { Avatar, LoadingSpinner, useUrlPagination } from '../../common';
import Paginacion from '../../common/components/Paginacion.jsx';
import users from '../../users';

import './css/ExecutionsHistory.css';
import './Feed.css';

/**
 * Componente para mostrar un item individual del feed.
 */
const FeedItem = ({ item, onLikeToggle }) => {
    const [likeLoading, setLikeLoading] = useState(false);

    const formatDuration = (seconds) => {
        if (!seconds) return null;
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hours > 0) {
            return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }
        return `${minutes}:${String(secs).padStart(2, '0')}`;
    };

    const handleLikeClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (likeLoading || item.type !== 'EXECUTION') return;

        setLikeLoading(true);
        try {
            const service = item.likedByCurrentUser
                ? backend.routineExecutionService.unlike
                : backend.routineExecutionService.like;
            const response = await service(item.id);
            if (response.ok) {
                onLikeToggle(item.id, !item.likedByCurrentUser);
            }
        } catch (err) {
            console.error('Error toggling like:', err);
        } finally {
            setLikeLoading(false);
        }
    };

    const performedAt = item.performedAt ? new Date(item.performedAt) : null;

    // Normalize routine level to a stable key (map Spanish display values to english keys)
    const getLevelKey = (level) => {
        if (!level) return null;
        const s = level.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const map = {
            'facil': 'easy',
            'basico': 'basic',
            'intermedio': 'intermediate',
            'avanzado': 'advanced',
            'experto': 'expert'
        };
        return map[s] || s;
    };

    // URL de destino con state para volver
    const detailUrl = item.type === 'EXECUTION'
        ? `/routines/executions/${item.id}`
        : `/routines/${item.routineId}`;

    return (
        <article className="feed-item" data-testid="feed-item">
            {/* Header con autor */}
            <div className="feed-item-author">
                <Link to={`/users/${item.authorId}`} className="feed-item-avatar-link">
                    <Avatar seed={item.authorAvatarSeed || item.authorUserName} size={36} />
                </Link>
                <div className="feed-item-author-details">
                    <Link
                        to={`/users/${item.authorId}`}
                        className="feed-item-author-name"
                    >
                        {item.authorUserName}
                    </Link>
                    <span className="feed-item-type-badge">
                        {item.type === 'EXECUTION' ? (
                            <span className="badge-execution">
                                <i className="fa fa-check-circle" aria-hidden="true"></i>
                                <span><FormattedMessage id="project.feed.type.execution" defaultMessage="Entrenamiento completado" /></span>
                            </span>
                        ) : (
                            <span className="badge-routine">
                                <i className="fa fa-plus-circle" aria-hidden="true"></i>
                                <span><FormattedMessage id="project.feed.type.routine" defaultMessage="Nueva rutina" /></span>
                            </span>
                        )}
                    </span>
                </div>
            </div>

            {/* Contenido principal - link a la ejecución */}
            <Link
                to={detailUrl}
                state={{ fromFeed: true }}
                className="execution-list-item feed-item-content"
            >
                <div className="d-flex justify-content-between align-items-center">
                    <div className="execution-info">
                        <div className="routine-name">
                            <i className="fa fa-check-circle me-2" aria-hidden="true"></i>
                            {item.routineName}
                        </div>
                        <div className="execution-meta">
                            {performedAt && (
                                <span className="date-time">
                                    <i className="fa fa-calendar me-1" aria-hidden="true"></i>
                                    <FormattedDate value={performedAt} /> <FormattedTime value={performedAt} />
                                </span>
                            )}
                            {item.totalDurationSec && (
                                <span className="duration ms-3">
                                    <i className="fa fa-clock-o me-1" aria-hidden="true"></i>
                                    {formatDuration(item.totalDurationSec)}
                                </span>
                            )}
                            {item.categoryName && (
                                <span className="category ms-3">
                                    <i className="fa fa-tag me-1" aria-hidden="true"></i>
                                    {item.categoryName}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="execution-badges d-flex align-items-center gap-2">
                        {item.routineLevel && (
                            <span className="badge bg-light text-dark border">
                                <FormattedMessage id={`project.routines.search.level.options.${getLevelKey(item.routineLevel)}`} defaultMessage={item.routineLevel} />
                            </span>
                        )}
                        <span className="badge bg-light text-dark border">
                            <i className="fa fa-comment me-1" aria-hidden="true"></i>
                            {item.commentsCount ?? 0}
                        </span>
                        {item.type === 'EXECUTION' ? (
                            <button
                                type="button"
                                onClick={handleLikeClick}
                                disabled={likeLoading}
                                className={`feed-like-button ${item.likedByCurrentUser ? 'feed-like-button--liked' : ''} ${likeLoading ? 'feed-like-button--loading' : ''}`}
                            >
                                <svg
                                    className="feed-like-icon"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill={item.likedByCurrentUser ? "currentColor" : "none"}
                                    stroke="currentColor"
                                    strokeWidth={item.likedByCurrentUser ? "0" : "1.5"}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                                </svg>
                                <span className="feed-like-count">{item.likesCount ?? 0}</span>
                            </button>
                        ) : (
                            <span className="feed-like-button feed-like-button--readonly">
                                <svg
                                    className="feed-like-icon"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                                </svg>
                                <span className="feed-like-count">{item.likesCount ?? 0}</span>
                            </span>
                        )}
                    </div>
                </div>
            </Link>
        </article>
    );
};

FeedItem.propTypes = {
    item: PropTypes.shape({
        id: PropTypes.number.isRequired,
        routineId: PropTypes.number,
        routineName: PropTypes.string,
        authorId: PropTypes.number,
        authorUserName: PropTypes.string,
        authorAvatarSeed: PropTypes.string,
        performedAt: PropTypes.string,
        type: PropTypes.oneOf(['EXECUTION', 'ROUTINE']),
        likesCount: PropTypes.number,
        commentsCount: PropTypes.number,
        totalDurationSec: PropTypes.number,
        routineLevel: PropTypes.string,
        categoryName: PropTypes.string,
        likedByCurrentUser: PropTypes.bool,
    }).isRequired,
    onLikeToggle: PropTypes.func.isRequired,
};

/**
 * Componente principal del Feed.
 * Muestra la actividad reciente de los usuarios seguidos.
 */
const Feed = () => {
    const loggedIn = useSelector(users.selectors.isLoggedIn);

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { page} = useUrlPagination();
    const [totalPages, setTotalPages] = useState(0);

    const PAGE_SIZE = 10;

    const loadFeed = useCallback(async (pageNum) => {
        setLoading(true);
        setError(null);

        try {
            const response = await backend.feedService.getFeed(pageNum, PAGE_SIZE);

            if (response.ok) {
                const data = response.payload;
                setItems(data.content || []);
                setTotalPages(data.totalPages || 0);
            } else {
                setError(response.payload?.message || 'Error al cargar el feed');
            }
        } catch (err) {
            setError(err.message || 'Error de conexión');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (loggedIn) {
            loadFeed(page);
        }
    }, [loggedIn, loadFeed, page]);

    // Callback para manejar el toggle de like
    const handleLikeToggle = useCallback((itemId, isNowLiked) => {
        setItems(prevItems => prevItems.map(item => {
            if (item.id === itemId && item.type === 'EXECUTION') {
                return {
                    ...item,
                    likedByCurrentUser: isNowLiked,
                    likesCount: isNowLiked
                        ? (item.likesCount ?? 0) + 1
                        : Math.max(0, (item.likesCount ?? 1) - 1)
                };
            }
            return item;
        }));
    }, []);

    const existMoreItems = page < totalPages - 1;

    // Si no está logueado, no mostrar el feed
    if (!loggedIn) {
        return null;
    }

    // Estado de carga inicial
    if (loading) {
        return (
            <div className="container executions-history-page" data-testid="feed-container">
                <div className="executions-history-header">
                    <h1 className="page-title">
                        <i className="fa fa-users me-2" aria-hidden="true"></i>
                        <FormattedMessage id="project.feed.title" defaultMessage="Actividad de amigos" />
                    </h1>
                </div>
                <div className="text-center py-5">
                    <LoadingSpinner overlay={false} size="md" message="" />
                </div>
            </div>
        );
    }

    // Estado de error
    if (error) {
        return (
            <div className="container executions-history-page" data-testid="feed-container">
                <div className="executions-history-header">
                    <h1 className="page-title">
                        <i className="fa fa-users me-2" aria-hidden="true"></i>
                        <FormattedMessage id="project.feed.title" defaultMessage="Actividad de amigos" />
                    </h1>
                </div>
                <div className="alert alert-danger" role="alert">
                    <FormattedMessage id="project.feed.error" defaultMessage="Error al cargar el feed" />
                    : {error}
                </div>
            </div>
        );
    }

    // Feed vacío
    if (items.length === 0) {
        return (
            <div className="container executions-history-page" data-testid="feed-container">
                <div className="executions-history-header">
                    <h1 className="page-title">
                        <i className="fa fa-users me-2" aria-hidden="true"></i>
                        <FormattedMessage id="project.feed.title" defaultMessage="Actividad de amigos" />
                    </h1>
                </div>
                <div className="empty-state-card">
                    <div className="empty-state-icon">
                        <i className="fa fa-users"></i>
                    </div>
                    <h4><FormattedMessage id="project.feed.empty.title" defaultMessage="Sin actividad reciente" /></h4>
                    <p>
                        <FormattedMessage
                            id="project.feed.empty"
                            defaultMessage="No hay actividad de tus seguidos. ¡Sigue a más usuarios para ver su actividad!"
                        />
                    </p>
                </div>
            </div>
        );
    }

    // Feed con items
    return (
        <div className="container executions-history-page" data-testid="feed-container">
            <div className="executions-history-header">
                <h1 className="page-title">
                    <i className="fa fa-users me-2" aria-hidden="true"></i>
                    <FormattedMessage id="project.feed.title" defaultMessage="Actividad de amigos" />
                </h1>
            </div>

            <div className="recent-executions-card">
                <div className="section-header">
                    <h5>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        <FormattedMessage id="project.feed.recentActivity" defaultMessage="Actividad reciente" />
                    </h5>
                    <small>
                        <FormattedMessage
                            id="project.feed.showing"
                            defaultMessage="Página {page} de {total}"
                            values={{ page: page + 1, total: totalPages || 1 }}
                        />
                    </small>
                </div>

                <div className="feed-items-list">
                    {items.map(item => (
                        <FeedItem
                            key={`${item.type}-${item.id}`}
                            item={item}
                            onLikeToggle={handleLikeToggle}
                        />
                    ))}
                </div>

                <Paginacion
                    page={page}
                    existMoreItems={existMoreItems}
                    setPage={(newPage) => {
                        if (typeof newPage === 'function') {
                            loadFeed(newPage(page));
                        } else {
                            loadFeed(newPage);
                        }
                    }}
                />
            </div>
        </div>
    );
};

export default Feed;
