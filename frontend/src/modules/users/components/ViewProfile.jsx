import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Avatar, Button, LoadingSpinner, ConfirmModal } from '../../common';
import * as selectors from '../selectors';
import * as actions from '../actions';
import backend from '../../../backend';
import { FormattedMessage, useIntl } from 'react-intl';
import FollowersFollowingModal from './FollowersFollowingModal';
import WrappedButton, { isWrappedVisible } from './WrappedButton';
import { toast } from "react-toastify";
import { BADGE_DEFINITIONS, badgeClassFor, collapseBadgeLevels, allBadgesCatalog } from './profileBadges';
import './profileBadges.css';

const toNumber = (v) => (v === '' || v == null) ? null : Number(v);

export const calcBmi = (heightCm, weightKg) => {
    const h = toNumber(heightCm);
    const w = toNumber(weightKg);
    if (!h || !w || h <= 0 || w <= 0) return null;
    const m = h / 100;
    return w / (m * m);
};

export const classifyBmi = (bmi) => {
    if (bmi == null) return null;
    if (bmi < 18.5) return 'UNDERWEIGHT';
    if (bmi < 25) return 'NORMAL';
    if (bmi < 30) return 'OVERWEIGHT';
    return 'OBESITY';
};

export const formatBmi = (bmi) => (typeof bmi === 'number' && isFinite(bmi)) ? bmi.toFixed(1) : '-';

export const getBmiCategoryNode = (bmi, bmiCategory, intl) => {
    const category = bmiCategory || classifyBmi(bmi);
    if (!category) return <span>-</span>;
    return <FormattedMessage id={`project.profile.bmiCategory.value.${category}`} defaultMessage={category} />;
};

export const getGenderNode = (gender) => {
    if (!gender) return <span>-</span>;
    const key = gender.toString().toUpperCase();
    return <FormattedMessage id={`project.profile.gender.value.${key}`} defaultMessage={gender} />;
};

export const getAvatarSrc = (avatarUrl, avatarSeed, userName) => {
    if (!avatarUrl || typeof avatarUrl !== 'string') return undefined;
    if (/^(https?:\/\/|data:|blob:)/i.test(avatarUrl)) return avatarUrl;
    if (avatarUrl.startsWith('/') && !/undefined/i.test(avatarUrl)) return avatarUrl;
    return undefined;
};

const ViewProfile = () => {
    const user = useSelector(selectors.getUser);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const intl = useIntl();

    const [backendErrors, setBackendErrors] = useState(null);
    const [showListType, setShowListType] = useState(null); // 'followers' | 'following'
    const [listLoading, setListLoading] = useState(false);
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [premiumAction, setPremiumAction] = useState(null);
    const [selectedBadge, setSelectedBadge] = useState(null);
    const [legendOpen, setLegendOpen] = useState(false);

    const isOwnProfile = true;

    useEffect(() => {
        if (!user?.id) return;
        backend.userService.getProfile(
            (fresh) => dispatch(actions.findProfileCompleted(fresh)),
            (errors) => setBackendErrors(errors)
        );
    }, [user?.id, dispatch]);

    const loadList = (type) => {
        if (!user?.id) return;
        setShowListType(type);
        setListLoading(true);

        const handler = (payload) => {
            const arr = Array.isArray(payload) ? payload : (payload?.items || []);
            type === 'followers' ? setFollowers(arr) : setFollowing(arr);
            setListLoading(false);
        };
        const errorHandler = () => {
            type === 'followers' ? setFollowers([]) : setFollowing([]);
            setListLoading(false);
        };
        type === 'followers'
            ? backend.userService.getFollowers(user.id, handler, errorHandler)
            : backend.userService.getFollowing(user.id, handler, errorHandler);
    };

    const handlePremiumAction = (action) => {
        setPremiumAction(action);
        setShowPremiumModal(true);
    };

    const handleConfirmPremium = () => {
        if (!user?.id) return;
        setShowPremiumModal(false);

        const successHandler = (updatedUser, message) => {
            dispatch(actions.findProfileCompleted(updatedUser));
            toast.success(message);
        };
        const errorHandler = (msg) => toast.error(msg);

        if (premiumAction === 'activate') {
            backend.userService.activatePremium(
                user.id,
                (updatedUser) => successHandler(updatedUser, "¡Felicidades! Ahora eres usuario Premium"),
                () => errorHandler("Error al activar premium")
            );
        } else {
            backend.userService.deactivatePremium(
                user.id,
                (updatedUser) => successHandler(updatedUser, "Premium desactivado correctamente"),
                () => errorHandler("Error al desactivar premium")
            );
        }
        setPremiumAction(null);
    };

    const handleCancelPremium = () => {
        setShowPremiumModal(false);
        setPremiumAction(null);
    };

    if (backendErrors) return null;
    if (!user) {
        return (
            <div className="container mt-5 text-center">
                <LoadingSpinner overlay size="md" message="" />
            </div>
        );
    }


    const bmiValue = typeof user?.bmi === 'number' ? user.bmi : calcBmi(user?.heightCm, user?.weightKg);
    const bmiCategoryNode = getBmiCategoryNode(bmiValue, user?.bmiCategory, intl);
    const genderNode = getGenderNode(user?.gender);
    const avatarSrc = getAvatarSrc(user?.avatarUrl, user?.avatarSeed, user?.userName);
    const collapsedBadges = collapseBadgeLevels(user?.badges || []);

    const genderIcon = (gender) => {
        if (!gender) return <i className="fa fa-genderless text-secondary" />;
        const g = gender.toString().toUpperCase();

        return {
            MALE: <i className="fa fa-mars" title="Hombre"></i>,
            FEMALE: <i className="fa fa-venus" title="Mujer"></i>,
            NON_BINARY: <i className="fa fa-genderless" title="No binario"></i>
        }[g] || <i className="fa fa-genderless text-secondary" />;
    };

    return (
        <div className="container py-5">
            {/* Profile card */}
            <div className="row justify-content-center">
                <div className="col-12 col-lg-10 col-xl-9">
                    <div className="card bg-white border-0 shadow-lg p-5 rounded-5">
                        <div className="card-header text-center mb-0 border-0 bg-transparent">
                            <div className="avatar-preview" style={{
                                display: 'block', margin: '0 auto 16px', border: '2px solid #000',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.2)', borderRadius: '50%',
                                width: 160, height: 160, overflow: 'hidden'
                            }}>
                                <Avatar seed={user?.avatarSeed || user?.userName} url={avatarSrc} size={160} />
                            </div>
                            <h2><strong>{user.userName}</strong></h2>

                            {/* Followers / Following */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
                                <button
                                    type="button"
                                    className="follower-item"
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
                                    className="follower-item"
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
                            </div>


                        </div>

                        <div className="card-body">
                            <div className="mb-3">
                                <div className="d-flex align-items-center justify-content-between mb-1 gap-2 flex-wrap">
                                    <div className="fw-semibold">
                                        <FormattedMessage id="project.profile.badges.title" defaultMessage="Insignias:" />
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
                                    <>
                                        <button
                                            type="button"
                                            className="badge-modal-backdrop"
                                            onClick={() => setSelectedBadge(null)}
                                            aria-label="Cerrar modal de insignia"
                                            style={{
                                                position: 'fixed',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                background: 'rgba(0, 0, 0, 0.5)',
                                                border: 'none',
                                                zIndex: 1040,
                                                cursor: 'pointer'
                                            }}
                                        />

                                        <dialog
                                            className="badge-modal"
                                            aria-labelledby="badge-detail-title"
                                            open
                                            style={{
                                                position: 'fixed',
                                                inset: 0,
                                                margin: 'auto',
                                                padding: '16px',
                                                zIndex: 1050,
                                                background: 'white',
                                                borderRadius: '6px',
                                                border: '1px solid #ccc',
                                                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.12)',
                                                maxWidth: '800px',
                                                width: 'fit-content',
                                                minWidth: '280px',
                                                height: 'fit-content',
                                                maxHeight: '85vh',
                                                overflowY: 'auto'
                                            }}
                                        >
                                                {(function renderBadgeContent() {
                                                    const def = BADGE_DEFINITIONS[selectedBadge] || {};
                                                    const variant = badgeClassFor(selectedBadge);
                                                    return (
                                                        <>
                                                            <div className={`profile-badge ${variant} mb-2`}>
                                                                <i className={`fa ${def.icon || 'fa-medal'}`} aria-hidden="true" />
                                                                <FormattedMessage id={def.id || 'project.profile.badge.unknown'} defaultMessage={def.defaultMessage || selectedBadge}
                                                                />
                                                            </div>
                                                            <p className="text-muted mb-3">
                                                                <FormattedMessage id={def.descId || `${def.id}.desc`} defaultMessage={def.defaultDesc || ''}
                                                                />
                                                            </p>
                                                            <Button variant="secondary" size="sm" onClick={() => setSelectedBadge(null)}>
                                                                <FormattedMessage id="project.common.close" defaultMessage="Cerrar" />
                                                            </Button>
                                                        </>
                                                    );
                                                })()}
                                        </dialog>
                                    </>
                                )}

                                {legendOpen && (
                                    <>
                                        <button
                                            type="button"
                                            className="badge-modal-backdrop"
                                            onClick={() => setLegendOpen(false)}
                                            aria-label="Cerrar leyenda de insignias"
                                            style={{
                                                position: 'fixed',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                background: 'rgba(0, 0, 0, 0.5)',
                                                border: 'none',
                                                zIndex: 1040,
                                                cursor: 'pointer'
                                            }}
                                        />

                                        <dialog
                                            className="badge-modal"
                                            aria-labelledby="badge-legend-title"
                                            open
                                            style={{
                                                position: 'fixed',
                                                inset: 0,
                                                margin: 'auto',
                                                padding: 0,
                                                zIndex: 1050,
                                                background: 'white',
                                                borderRadius: '6px',
                                                border: '1px solid #ccc',
                                                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.12)',
                                                maxWidth: '600px',
                                                width: 'fit-content',
                                                minWidth: '280px',
                                                height: 'fit-content',
                                                maxHeight: '85vh',
                                                overflowY: 'auto'
                                            }}
                                        >
                                                <div className="d-flex align-items-center justify-content-between mb-2">
                                                    <h6 className="mb-0" id="badge-legend-title">
                                                        <FormattedMessage id="project.profile.badges.legend" defaultMessage="Leyenda de insignias" />
                                                    </h6>
                                                    <Button variant="secondary" size="sm" onClick={() => setLegendOpen(false)}>
                                                        <FormattedMessage id="project.common.close" defaultMessage="Cerrar" />
                                                    </Button>
                                                </div>
                                                <div className="badge-legend-grid">
                                                    {(function renderLegendItems() {
                                                        const badges = allBadgesCatalog();
                                                        const items = [];

                                                        for (const code of badges) {
                                                            const def = BADGE_DEFINITIONS[code] || {};
                                                            const variant = badgeClassFor(code);

                                                            items.push(
                                                                <div key={`legend-${code}`} className="badge-legend-item">
                                                                    <span className={`profile-badge profile-badge--icon-only ${variant}`} aria-hidden="true">
                                                                        <i className={`fa ${def.icon || 'fa-medal'}`} />
                                                                    </span>
                                                                    <div>
                                                                        <div className="fw-semibold">
                                                                            <FormattedMessage
                                                                                id={def.id || 'project.profile.badge.unknown'}
                                                                                defaultMessage={def.defaultMessage || code}
                                                                            />
                                                                        </div>
                                                                        <small className="text-muted">
                                                                            <FormattedMessage
                                                                                id={def.descId || `${def.id}.desc`}
                                                                                defaultMessage={def.defaultDesc || ''}
                                                                            />
                                                                        </small>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }
                                                        return items;
                                                    })()}
                                                </div>
                                        </dialog>
                                    </>
                                )}
                            </div>
                            {/* ------------ Two Columns ------------ */}
                            <div className="row">

                                {/* Left column - user data */}
                                <div className="col-md-5">

                                    <h5 className="mb-3">
                                        <strong><FormattedMessage id="project.profile.section.personal" defaultMessage="Datos del usuario" /></strong>
                                    </h5>

                                    <div className="row mb-3">
                                        <div className="col-6">
                                            <strong><FormattedMessage id="project.profile.firstName" defaultMessage="Nombre" /></strong>
                                            <div>{user.firstName ?? '-'}</div>
                                        </div>
                                        <div className="col-6">
                                            <strong><FormattedMessage id="project.profile.lastName" defaultMessage="Apellidos" /></strong>
                                            <div>{user.lastName ?? '-'}</div>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <strong><FormattedMessage id="project.profile.email" defaultMessage="Email" /></strong>
                                        <div>{user.email ?? '-'}</div>
                                    </div>

                                    <div className="mb-3">
                                        <strong><FormattedMessage id="project.profile.role" defaultMessage="Rol" /></strong>
                                        <div>{user.role ?? '-'}</div>
                                    </div>

                                    {user.role === 'TRAINER' && (
                                        <>
                                            <div className="mb-3">
                                                <strong><FormattedMessage id="project.profile.formation" defaultMessage="Formación" /></strong>
                                                <div>{user.formation ?? '-'}</div>
                                            </div>

                                            <div className="mb-3">
                                                <strong><FormattedMessage id="project.profile.premium" defaultMessage="Premium" /></strong>
                                                <div>
                                                    {user.isPremium ? (
                                                        <span className="badge bg-warning text-dark">ACTIVO</span>
                                                    ) : (
                                                        <span className="badge bg-secondary">NO activo</span>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Separator */}
                                <div className="col-md-2 d-none d-md-flex justify-content-center">
                                    <div style={{ width: 2, background: '#ddd', height: '100%' }} />
                                </div>

                                {/* Right column - physical data */}
                                <div className="col-md-5">
                                    <h5 className="fw-bold mb-3">
                                        <strong><FormattedMessage id="project.profile.section.physical" defaultMessage="Datos físicos" /></strong>
                                    </h5>

                                    <div className="mb-3">
                                        <strong><FormattedMessage id="project.profile.gender" defaultMessage="Género" /></strong>
                                        <div>
                                            {genderIcon(user.gender)}{' '}
                                            {genderNode}
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <strong><FormattedMessage id="project.profile.heightCm" defaultMessage="Altura" /></strong>
                                        <div>{user.heightCm ?? '-'}</div>
                                    </div>

                                    <div className="mb-3">
                                        <strong><FormattedMessage id="project.profile.weightKg" defaultMessage="Peso" /></strong>
                                        <div>{user.weightKg ?? '-'}</div>
                                    </div>

                                    <div className="mb-3">
                                        <strong>IMC</strong>
                                        <div>{formatBmi(bmiValue)}</div>
                                    </div>

                                    <div className="mb-3">
                                        <strong><FormattedMessage id="project.profile.bmiCategory" defaultMessage="Categoría IMC" /></strong>
                                        <div>{bmiCategoryNode}</div>
                                    </div>
                                </div>
                            </div>

                            {/* ------------ Action Buttons Container ------------ */}
                            <div className="mt-4 pt-4 border-top">
                                <div className="d-flex flex-column align-items-center" style={{ width: '100%', maxWidth: '300px', margin: '0 auto' }}>
                                    {/* Edit Profile Button */}
                                    <Button variant="primary" icon="fa-edit"
                                        className="profile-action-button"
                                        fullWidth
                                        style={{ marginBottom: '1rem' }}
                                        onClick={() => navigate('/users/update-profile')}>
                                        <FormattedMessage id="project.profile.edit" defaultMessage="Editar" />
                                    </Button>
                                    
                                    {/* Premium Toggle Button (only for TRAINER) */}
                                    {isOwnProfile && user.role === 'TRAINER' && (
                                        <Button
                                            variant={user.isPremium ? "outline" : "primary"}
                                            icon="fa-crown"
                                            className="profile-action-button"
                                            fullWidth
                                            style={{ marginBottom: '1rem' }}
                                            onClick={() => handlePremiumAction(user.isPremium ? 'deactivate' : 'activate')}
                                        >
                                            <FormattedMessage
                                                id={user.isPremium ? "project.premium.deactivate" : "project.premium.activate"}
                                                defaultMessage={user.isPremium ? "Quitar Premium" : "Hacerse Premium"} />
                                        </Button>
                                    )}
                                    
                                    {/* Wrapped Button */}
                                    {isWrappedVisible() && (
                                        <WrappedButton style={{ width: '100%' }} />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Followers / Following Modal */}
            {showListType && (
                <FollowersFollowingModal
                    type={showListType}
                    loading={listLoading}
                    users={showListType === 'followers' ? followers : following}
                    onClose={() => setShowListType(null)}
                    isOwnProfile
                />
            )}

            {/* Premium Benefits */}
            {user.role === 'TRAINER' && (
                <div className="row justify-content-center mt-4">
                    <div className="col-12 col-lg-10 col-xl-9">
                        <div className="card bg-light border-0 rounded-5">
                            <div className="card-header bg-white rounded-top-5">
                                <h5 className="mb-0 fw-bold">
                                    <FormattedMessage id="project.premium.benefits.title" defaultMessage="Beneficios Premium" />
                                    {user.isPremium && <span className="badge bg-success ms-2"><FormattedMessage id="project.premium.active" defaultMessage="ACTIVO" /></span>}
                                </h5>
                            </div>
                            <div className="card-body">
                                {["create_exercises", "unlimited_routines", "more_exercises"].map((key) => (
                                    <div key={key} className={`benefit-item d-flex align-items-center mb-2 ${user.isPremium ? 'text-success' : 'text-muted'}`}>
                                        <span className="me-2">{user.isPremium ? '✅' : '○'}</span>
                                        <span>
                                            <FormattedMessage id={`project.premium.benefit.${key}`} defaultMessage={key.replace("_", " ")} />
                                        </span>
                                    </div>
                                ))}
                                {!user.isPremium && (
                                    <div className="mt-3 text-center">
                                        <p className="text-muted mb-0">
                                            <FormattedMessage id="project.premium.upgrade.message" defaultMessage="Actualiza a Premium para desbloquear todas las funcionalidades" />
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Premium Modal */}
            <ConfirmModal
                isOpen={showPremiumModal}
                title={premiumAction === 'activate'
                    ? intl.formatMessage({ id: 'project.premium.confirmActivate.title', defaultMessage: 'Activar cuenta Premium' })
                    : intl.formatMessage({ id: 'project.premium.confirmDeactivate.title', defaultMessage: 'Desactivar cuenta Premium' })}
                message={premiumAction === 'activate'
                    ? intl.formatMessage({ id: 'project.premium.confirmActivate.message', defaultMessage: '¿Estás seguro de que quieres activar tu cuenta Premium?' })
                    : intl.formatMessage({ id: 'project.premium.confirmDeactivate.message', defaultMessage: '¿Estás seguro de que quieres desactivar tu cuenta Premium?' })}
                onConfirm={handleConfirmPremium}
                onClose={handleCancelPremium}
                confirmText={premiumAction === 'activate'
                    ? intl.formatMessage({ id: 'project.premium.confirmActivate.confirm', defaultMessage: 'Activar Premium' })
                    : intl.formatMessage({ id: 'project.premium.confirmDeactivate.confirm', defaultMessage: 'Desactivar' })}
                cancelText={intl.formatMessage({ id: 'project.common.cancel', defaultMessage: 'Cancelar' })}
                variant={premiumAction === 'activate' ? 'success' : 'warning'}
            />
        </div>
    );
};

export default ViewProfile;
