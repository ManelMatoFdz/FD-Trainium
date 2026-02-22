import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';
import backend from '../../../backend';
import { Avatar, Button, LoadingSpinner, useUrlPagination } from '../../common';
import FollowersFollowingModal from './FollowersFollowingModal';
import users from '../../users';
import FollowButton from './FollowButton';
import { BADGE_DEFINITIONS, badgeClassFor, collapseBadgeLevels, allBadgesCatalog } from './profileBadges';
import './profileBadges.css';
import Paginacion from '../../common/components/Paginacion.jsx';
import '../../routines/components/css/ExecutionsHistory.css';
import { toast } from "react-toastify";


/* eslint-disable */
// Justificación: función grande por la cantidad de UI y estados; dividirla sería más complejo que mantenerla así.
const PublicProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const intl = useIntl();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentUser = useSelector(users.selectors.getUser);
  const loggedIn = useSelector(users.selectors.isLoggedIn);
  const [execs, setExecs] = useState([]);
  const [execsLoading, setExecsLoading] = useState(true);
  const { page, setPage, resetPage } = useUrlPagination();
  const [showListType, setShowListType] = useState(null); // 'followers' | 'following'
  const [listLoading, setListLoading] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [legendOpen, setLegendOpen] = useState(false);
  const pageSize = 4;
  const [blockedByMe, setBlockedByMe] = useState(false);
  const [blockedMe, setBlockedMe] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const isBlocked = blockedByMe || blockedMe;

  const reservedRouteNames = ['login', 'signup', 'logout', 'view-profile', 'update-profile', 'change-password'];
  const isReservedRoute = userId && reservedRouteNames.includes(userId.toLowerCase());

  useEffect(() => {
    if (isReservedRoute) {
      navigate('/', { replace: true });
      return;
    }
    setLoading(true);
    backend.userService.findUserById(userId, (u) => {
      setUser(u);
      setLoading(false);
    }, (err) => {
      setError(err);
      setLoading(false);
    });
  }, [userId, isReservedRoute, navigate]);
  useEffect(() => {
    if (isReservedRoute) return;
    backend.userService.isBlockedUser(userId,
      (res) => { setBlockedByMe(!!res?.blockedByMe); setBlockedMe(!!res?.blockedMe); },
      () => { setBlockedByMe(false); setBlockedMe(false); }
    );
  }, [userId, isReservedRoute]);


  useEffect(() => {
    if (isReservedRoute) return;
    // Load this user's workouts
    setExecsLoading(true);
    backend.routineExecutionService.findByUserId(userId)
      .then(({ ok, payload }) => {
        if (ok) {
          const list = Array.isArray(payload) ? payload : [];
          // ordenar por fecha descendente
          list.sort((a, b) => {
            const ta = a?.performedAt ? new Date(a.performedAt).getTime() : 0;
            const tb = b?.performedAt ? new Date(b.performedAt).getTime() : 0;
            return tb - ta;
          });
          setExecs(list);
        }
      })
      .finally(() => setExecsLoading(false));
  }, [userId, isReservedRoute, resetPage]);

  // Redirect is happening, don't render anything
  if (isReservedRoute) {
    return null;
  }

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <LoadingSpinner overlay={true} size="md" message="" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="container mt-5 text-center">
        <p className="text-muted">
          <FormattedMessage id="project.profile.public.loadError" defaultMessage="No se pudo cargar el perfil." />
        </p>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          <FormattedMessage id="project.common.backLink.label" defaultMessage="Volver" />
        </Button>
      </div>
    );
  }

  const fields = [
    { label: 'Nombre', value: [user.firstName, user.lastName].filter(Boolean).join(' ') || '-' },
    { label: 'Email', value: user.email || '-' },
    { label: 'Rol', value: user.role || '-' },
    {
      label: 'Premium', value: user.isPremium ? (
        <span className="badge bg-warning text-dark">
          <FormattedMessage id="project.profile.premium.active" defaultMessage="ACTIVO" />
        </span>
      ) : (
        <span className="badge bg-secondary">
          <FormattedMessage id="project.profile.premium.inactive" defaultMessage="No activo" />
        </span>
      )
    },
    { label: 'Formación', value: user.formation || '-' },
  ];

  const avatarSrc = (() => {
    const url = user?.avatarUrl;
    if (!url || typeof url !== 'string') return undefined;
    if (/^(https?:\/\/|data:|blob:)/i.test(url)) return url;
    if (url.startsWith('/') && !/undefined/i.test(url)) return url;
    return undefined;
  })();

  const start = page * pageSize;
  const end = Math.min(start + pageSize, execs.length);
  const pagedExecs = execs.slice(start, end);
  const existMoreItems = end < execs.length;

  const closeModal = () => setShowListType(null);
  const loadList = (type) => {
    if (!user?.id) return;
    setShowListType(type);
    setListLoading(true);
    const handler = (payload) => {
      const arr = Array.isArray(payload) ? payload : (payload?.items || []);
      if (type === 'followers') setFollowers(arr); else setFollowing(arr);
      setListLoading(false);
    };
    const errorHandler = () => {
      if (type === 'followers') setFollowers([]); else setFollowing([]);
      setListLoading(false);
    };
    if (type === 'followers') backend.userService.getFollowers(user.id, handler, errorHandler);
    else backend.userService.getFollowing(user.id, handler, errorHandler);
  };
  const handleBlockToggle = () => {
    if (!user?.id) return;
    setBlocking(true);

    // Check if current user is ADMIN - use admin ban functionality
    const isCurrentUserAdmin = currentUser?.role === 'ADMIN';
    // For ADMIN: toggle bannedByAdmin status
    // For regular users: toggle blockedByMe status
    const isBanned = isCurrentUserAdmin ? user.bannedByAdmin : blockedByMe;

    const successHandler = () => {
      if (isCurrentUserAdmin) {
        // Update the user's bannedByAdmin status
        setUser(prev => ({ ...prev, bannedByAdmin: !prev.bannedByAdmin }));
        toast.success(!user.bannedByAdmin ? "Usuario baneado de la aplicación" : "Usuario desbaneado");
      } else {
        setBlockedByMe(!blockedByMe);
        toast.success(blockedByMe ? "Usuario desbloqueado" : "Usuario bloqueado");
      }
      setBlocking(false);
    };

    const errorHandler = (err) => {
      setBlocking(false);
      toast.error("Error al actualizar estado de bloqueo");
      console.error(err);
    };

    if (isCurrentUserAdmin) {
      // Admin ban/unban from the entire application
      if (user.bannedByAdmin) {
        backend.userService.adminUnbanUser(user.id, successHandler, errorHandler);
      } else {
        backend.userService.adminBanUser(user.id, successHandler, errorHandler);
      }
    } else {
      // Regular user block/unblock
      if (blockedByMe) {
        backend.userService.unblockUser(user.id, successHandler, errorHandler);
      } else {
        backend.userService.blockUser(user.id, successHandler, errorHandler);
      }
    }
  };


  const collapsedBadges = collapseBadgeLevels(user?.badges || []);

  return (
    <div className="container py-3">
      <div className="row">
        <div className="col-12 col-lg-6 col-xl-5 mb-3">
          <div className="card bg-white border-0 shadow-lg h-100">
            <div className="card-header text-center mb-0">
              <div className="avatar-preview" style={{
                display: 'block',
                margin: '0 auto 16px auto',
                border: '2px solid #000',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                borderRadius: '50%',
                width: 140,
                height: 140,
                overflow: 'hidden',
              }}>
                <Avatar seed={user?.avatarSeed || user?.userName} url={avatarSrc} size={140} />
              </div>
              <h2 style={{ margin: 0 }}><strong>{user.userName}</strong></h2>
              {user.premium && (
                <div className="mb-2">
                  <span className="badge bg-warning text-dark">
                    <i className="fa fa-crown me-1"></i>
                    <FormattedMessage id="project.profile.premium.active" defaultMessage="PREMIUM" />
                  </span>
                </div>
              )}
              {(user.firstName || user.lastName) && (
                <div className="text-muted">{[user.firstName, user.lastName].filter(Boolean).join(' ')}</div>
              )}

              {loggedIn && currentUser && currentUser.id !== user.id && user.role !== 'ADMIN' && (
                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant={(currentUser?.role === 'ADMIN' ? user.bannedByAdmin : blockedByMe) ? "secondary" : "danger"}
                    size="sm"
                    disabled={blocking}
                    onClick={handleBlockToggle}
                  >
                    {currentUser?.role === 'ADMIN' ? (
                      // Admin ban/unban text
                      user.bannedByAdmin ? (
                        <FormattedMessage id="project.profile.unban" defaultMessage="Desbanear" />
                      ) : (
                        <FormattedMessage id="project.profile.ban" defaultMessage="Banear" />
                      )
                    ) : (
                      // Regular user block/unblock text
                      blockedByMe ? (
                        <FormattedMessage id="project.profile.unblock" defaultMessage="Desbloquear" />
                      ) : (
                        <FormattedMessage id="project.profile.block" defaultMessage="Bloquear" />
                      )
                    )}
                  </Button>
                </div>
              )}


              {/* ALERTAS DE BLOQUEO */}
              {isBlocked && (
                <div className="alert alert-warning" style={{ marginTop: '1rem' }}>
                  {blockedMe ? (
                    <FormattedMessage
                      id="project.profile.blocked.message"
                      defaultMessage="Te ha bloqueado este usuario"
                    />
                  ) : (
                    <FormattedMessage
                      id="project.profile.blocked.message2"
                      defaultMessage="Has bloqueado a este usuario"
                    />
                  )}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
                {!isBlocked && (
                  <>
                    <button
                      type="button"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        font: 'inherit',
                        color: 'inherit'
                      }}
                      onClick={() => loadList('followers')}
                      title="Followers"
                      aria-label="Ver seguidores"
                    >
                      <span style={{ fontWeight: 600, marginRight: 6 }}>
                        <FormattedMessage id="project.profile.followers" defaultMessage="Followers" />:
                      </span>
                      <span style={{ fontWeight: 400 }}>{user.followersCount ?? 0}</span>
                    </button>
                    <button
                      type="button"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        font: 'inherit',
                        color: 'inherit'
                      }}
                      onClick={() => loadList('following')}
                      title="Following"
                      aria-label="Ver seguidos"
                    >
                      <span style={{ fontWeight: 600, marginRight: 6 }}>
                        <FormattedMessage id="project.profile.following" defaultMessage="Following" />:
                      </span>
                      <span style={{ fontWeight: 400 }}>{user.followingCount ?? 0}</span>
                    </button>

                    {/* Follow button aligned to the right of the followers block */}
                    <div style={{ marginLeft: '1rem' }}>
                      {loggedIn && currentUser && currentUser.id !== user.id && user.role !== 'ADMIN' ? (
                        <FollowButton
                          userId={user.id}
                          buttonStyle={{ borderRadius: 6 }}
                          buttonVariant={'primary'}
                          onFollowChange={(isFollowing) => {
                            setUser(prev => ({
                              ...prev,
                              followersCount: isFollowing
                                ? (prev.followersCount || 0) + 1
                                : Math.max((prev.followersCount || 0) - 1, 0)
                            }));
                          }}
                        />
                      ) : (
                        // Si no está logueado, mostrar un CTA para iniciar sesión
                        !loggedIn && user.role !== 'ADMIN' && (
                          <Button variant="secondary" size="sm" onClick={() => navigate('/login')}>
                            <FormattedMessage id="project.login.signup" defaultMessage="Iniciar sesión" />
                          </Button>
                        )
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
            {!isBlocked && (
              <div className="card-body">
                <div className="mb-3">
                  <div className="d-flex align-items-center justify-content-between mb-1 gap-2 flex-wrap">
                    <div className="fw-semibold">
                      <FormattedMessage id="project.profile.badges.title" defaultMessage="Insignias" />
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setLegendOpen(true)}>
                      <i className="fa fa-info-circle mr-2" aria-hidden="true" />
                      <FormattedMessage id="project.profile.badges.legendButton" defaultMessage="Ver leyenda" />
                    </Button>
                  </div>
                  {collapsedBadges.length === 0 ? (
                    <small className="text-muted">
                      <FormattedMessage
                        id="project.profile.badges.empty"
                        defaultMessage="Todavía no hay insignias. ¡Sigue entrenando!"
                      />
                    </small>
                  ) : (
                    <div className="d-flex flex-wrap" style={{ gap: '0.75rem', rowGap: '0.75rem' }}>
                      {collapsedBadges.map((code) => {
                        const def = BADGE_DEFINITIONS[code] || {};
                        const variant = badgeClassFor(code);
                        return (
                          <button
                            type="button"
                            key={code}
                            className={`profile-badge profile-badge--icon-only ${variant}`}
                            onClick={() => setSelectedBadge(code)}
                            aria-label={def.defaultMessage || code}
                          >
                            <i className={`fa ${def.icon || 'fa-medal'}`} aria-hidden="true" />
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {selectedBadge && (
                    <div className="badge-modal-backdrop" role="button" tabIndex={0} aria-label="Cerrar modal de insignia" onClick={() => setSelectedBadge(null)} onKeyDown={(e) => { if (e.key === 'Escape') setSelectedBadge(null); if (e.key === 'Enter' || e.key === ' ') {setSelectedBadge(false);e.preventDefault();}}}>
                      <dialog className="badge-modal" aria-labelledby="badge-detail-title" open onClick={(e) => e.stopPropagation()}>
                        {(() => {
                          const def = BADGE_DEFINITIONS[selectedBadge] || {};
                          const variant = badgeClassFor(selectedBadge);
                          return (
                            <>
                              <div className={`profile-badge ${variant} mb-2`}>
                                <i className={`fa ${def.icon || 'fa-medal'}`} aria-hidden="true" />
                                <FormattedMessage id={def.id || 'project.profile.badge.unknown'} defaultMessage={def.defaultMessage || selectedBadge} />
                              </div>
                              <p className="text-muted mb-3">
                                <FormattedMessage id={def.descId || `${def.id}.desc`} defaultMessage={def.defaultDesc || ''} />
                              </p>
                              <Button variant="secondary" size="sm" onClick={() => setSelectedBadge(null)}>
                                <FormattedMessage id="project.common.close" defaultMessage="Cerrar" />
                              </Button>
                            </>
                          );
                        })()}
                      </dialog>
                    </div>
                  )}
                  {legendOpen && (
                    <div className="badge-modal-backdrop" role="button" tabIndex={0} aria-label="Cerrar modal de insignia" onClick={() => setLegendOpen(false)} onKeyDown={(e) => { if (e.key === 'Escape') setLegendOpen(false); if (e.key === 'Enter' || e.key === ' ') {setLegendOpen(false);e.preventDefault();} }}>
                      <dialog className="badge-modal" aria-labelledby="badge-legend-title" open onClick={(e) => e.stopPropagation()}>
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <h6 className="mb-0">
                            <FormattedMessage id="project.profile.badges.legend" defaultMessage="Leyenda de insignias" />
                          </h6>
                          <Button variant="secondary" size="sm" onClick={() => setLegendOpen(false)}>
                            <FormattedMessage id="project.common.close" defaultMessage="Cerrar" />
                          </Button>
                        </div>
                        <div className="badge-legend-grid">
                          {allBadgesCatalog().map((code) => {
                            const def = BADGE_DEFINITIONS[code] || {};
                            const variant = badgeClassFor(code);
                            return (
                              <div key={`legend-${code}`} className="badge-legend-item">
                                <span className={`profile-badge profile-badge--icon-only ${variant}`} aria-hidden="true">
                                  <i className={`fa ${def.icon || 'fa-medal'}`} />
                                </span>
                                <div>
                                  <div className="fw-semibold">
                                    <FormattedMessage id={def.id || 'project.profile.badge.unknown'} defaultMessage={def.defaultMessage || code} />
                                  </div>
                                  <small className="text-muted">
                                    <FormattedMessage id={def.descId || `${def.id}.desc`} defaultMessage={def.defaultDesc || ''} />
                                  </small>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </dialog>
                    </div>
                  )}
                </div>
                {fields.map((f) => (
                  <div className="row mb-2" key={`field-${f.label}`}>
                    <div className="col-5 fw-semibold">{f.label}</div>
                    <div className="col-7">{f.value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {!isBlocked && (
          <div className="col-12 col-lg-6 col-xl-7 mb-3">
            <div className="recent-executions-card">
              <div className="section-header mb-3">
                <div className="d-flex justify-content-between align-items-end mb-2 flex-wrap" style={{ gap: '0.5rem' }}>
                  <h4 className="m-0">
                    <FormattedMessage id="project.publicProfile.workouts.title" defaultMessage="Rutinas realizadas" />
                  </h4>
                  <small className="text-muted ms-2">
                    {execs.length > 0 ? (
                      <FormattedMessage id="project.publicProfile.workouts.showing" defaultMessage="Mostrando {from}-{to} de {total}" values={{ from: start + 1, to: end, total: execs.length }} />
                    ) : (
                      <FormattedMessage id="project.publicProfile.workouts.noResults" defaultMessage="Sin resultados" />
                    )}
                  </small>
                </div>
              </div>


              {execsLoading ? (
                <div className="container mt-2 text-center">
                  <LoadingSpinner overlay={false} size="sm" message={intl.formatMessage({ id: 'project.publicProfile.workouts.loading', defaultMessage: 'Cargando rutinas...' })} />
                </div>
              ) : (

                <div className="list-group list-group-flush">
                  {pagedExecs.length === 0 ? (
                    <div className="alert alert-info m-0">Este usuario aún no tiene rutinas registradas</div>
                  ) : (
                    pagedExecs.map((exec) => (
                      <Link
                        key={exec.id}
                        to={`/routines/executions/${exec.id}`}
                        state={{ fromPublicProfile: true, userId: userId }}
                        className="list-group-item list-group-item-action execution-list-item"
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="execution-info">
                            <div className="routine-name">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="me-2" style={{ width: '18px', height: '18px', display: 'inline-block', verticalAlign: 'middle' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                              </svg>
                              {exec.routineName}
                            </div>
                            <div className="execution-meta">
                              <span className="date-time">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="me-1" style={{ width: '14px', height: '14px', display: 'inline-block', verticalAlign: 'middle' }}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                                </svg>
                                {exec.performedAt
                                  ? new Date(exec.performedAt).toLocaleString()
                                  : <FormattedMessage id="project.executions.noDate" defaultMessage="Fecha no disponible" />}
                              </span>
                              {exec.totalDurationSec && (
                                <span className="duration ms-3">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="me-1" style={{ width: '14px', height: '14px', display: 'inline-block', verticalAlign: 'middle' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                  </svg>
                                  {new Date(exec.totalDurationSec * 1000).toISOString().substring(11, 19)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="execution-badges d-flex align-items-center gap-2">
                            <span className="badge bg-light text-dark border">
                              {exec.exercises?.length || 0} <FormattedMessage id="project.executions.exercisesCount" defaultMessage="ejercicios" />
                            </span>
                            <span className="badge bg-danger-subtle text-danger border">
                              <i className="fa fa-heart me-1" aria-hidden="true"></i>
                              {exec.likesCount ?? 0}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}

                </div>

              )}

              {!execsLoading && execs.length > 0 && (
                <Paginacion page={page} existMoreItems={existMoreItems} setPage={setPage} />
              )}
            </div>
          </div>
        )}
      </div>
      {showListType && (
        <FollowersFollowingModal
          type={showListType}
          loading={listLoading}
          users={showListType === 'followers' ? followers : following}
          onClose={closeModal}
          isOwnProfile={false}
        />
      )}
    </div>
  );
};

export default PublicProfile;
