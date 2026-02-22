import React, {useEffect, useRef, useState} from 'react';
import {useSelector} from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import {Avatar} from '../../common';
import users from '../../users';
import './Header.css';
import {FormattedMessage} from 'react-intl';
import Notifications from "../../users/components/Notifications";
import backend from '../../../backend';

// Función auxiliar para determinar si la ruta de rutinas está activa
const isRoutinesActive = (isActive) => {
    return isActive('/routines') && 
           !isActive('/routines/my') && 
           !isActive('/routines/executions') && 
           !isActive('/routines/statistics');
};

// Función auxiliar para determinar si la ruta de ejercicios está activa
const isExercisesActive = (isActive) => {
    return isActive('/exercises') && 
           !isActive('/exercises/stats');
};

// Componente para los enlaces de navegación principales
function MainNavLinks({ isActive, canManage, user }) {
    const canViewExecutions = user && (user.role === 'USER' || user.role === 'ADMIN');
    
    return (
        <nav className="navbar-nav main-links" aria-label="Navegación principal">
            <ul className="navbar-nav main-links">
            <li className="nav-item" role="none">
                <Link 
                    role="menuitem"
                    className={`nav-link ${isRoutinesActive(isActive) ? 'active' : ''}`}
                    id="routines" 
                    to="/routines"
                >
                    <FormattedMessage id="project.header.routines" defaultMessage="Rutinas"/>
                </Link>
            </li>
            <li className="nav-item" role="none">
                <Link 
                    role="menuitem"
                    className={`nav-link ${isActive('/savedRoutines') ? 'active' : ''}`}
                    id="savedRoutines" 
                    to="/savedRoutines"
                >
                    <FormattedMessage id="project.header.savedRoutines" defaultMessage="Rutinas Guardadas"/>
                </Link>
            </li>
            {canManage && (
                <>
                    <li className="nav-item" role="none">
                        <Link 
                            role="menuitem"
                            className={`nav-link ${isActive('/routines/my', true) ? 'active' : ''}`}
                            id="myRoutines" 
                            to="/routines/my"
                        >
                            <FormattedMessage id="project.header.myRoutines" defaultMessage="Mis Rutinas"/>
                        </Link>
                    </li>
                    <li className="nav-item" role="none">
                        <Link 
                            role="menuitem"
                            className={`nav-link ${isExercisesActive(isActive) ? 'active' : ''}`}
                            id="exercises" 
                            to="/exercises"
                        >
                            <FormattedMessage id="project.header.exercises" defaultMessage="Ejercicios"/>
                        </Link>
                    </li>
                </>
            )}
            <li className="nav-item" role="none">
                <Link 
                    role="menuitem"
                    className={`nav-link ${isActive('/feed') ? 'active' : ''}`}
                    id="feed" 
                    to="/feed"
                >
                    <FormattedMessage id="project.header.feed" defaultMessage="Feed"/>
                </Link>
            </li>
            {user && (
                <li className="nav-item" role="none">
                    <Link
                        role="menuitem"
                        className={`nav-link ${isActive('/exercises/stats') ? 'active' : ''}`}
                        id="exerciseStats"
                        to="/exercises/stats"
                    >
                        <FormattedMessage id="project.header.exerciseStats" defaultMessage="Ranking"/>
                    </Link>
                </li>
            )}
            {canViewExecutions && (
                <>
                    <li className="nav-item" role="none">
                        <Link
                            role="menuitem"
                            className={`nav-link ${isActive('/routines/statistics') ? 'active' : ''}`}
                            id="statistics"
                            to="/routines/statistics"
                        >
                            <FormattedMessage id="project.header.statistics" defaultMessage="Estadísticas"/>
                        </Link>
                    </li>
                    <li className="nav-item" role="none">
                        <Link
                            role="menuitem"
                            className={`nav-link ${isActive('/routines/executions') ? 'active' : ''}`}
                            id="executions"
                            to="/routines/executions"
                        >
                            <FormattedMessage id="project.header.executions" defaultMessage="Historial"/>
                        </Link>
                    </li>
                </>
            )}
            </ul>
        </nav>
    );
}

MainNavLinks.propTypes = {
    isActive: PropTypes.func.isRequired,
    canManage: PropTypes.bool,
    user: PropTypes.shape({
        role: PropTypes.oneOf(['USER', 'ADMIN', 'TRAINER'])
    })
};

// Hook personalizado para la búsqueda de usuarios
const useUserSearch = (userName) => {
    const [q, setQ] = useState("");
    const [results, setResults] = useState([]);
    const [searchOpen, setSearchOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const searchBoxRef = useRef(null);
    const debounceRef = useRef(null);
    const navigate = useNavigate();

    // Buscar usuarios con debounce
    useEffect(() => {
        if (!userName) { return; }
        if (debounceRef.current) clearTimeout(debounceRef.current);
        const term = q.trim();
        if (!term) { 
            setResults([]); 
            setSearchOpen(false); 
            return; 
        }
        debounceRef.current = setTimeout(() => {
            setLoading(true);
            backend.userService.searchUsers(term, userName.id,(list) => {
                setResults(Array.isArray(list) ? list.slice(0, 8) : []);
                setSearchOpen(true);
                setLoading(false);
            }, () => { 
                setResults([]); 
                setSearchOpen(false); 
                setLoading(false); 
            });
        }, 300);
        return () => { 
            if (debounceRef.current) clearTimeout(debounceRef.current); 
        };
    }, [q, userName]);

    // Cierra resultados al click fuera
    useEffect(() => {
        const onDocClick = (e) => {
            if (!searchBoxRef.current) return;
            if (!searchBoxRef.current.contains(e.target)) {
                setSearchOpen(false);
            }
        };
        document.addEventListener('click', onDocClick);
        return () => document.removeEventListener('click', onDocClick);
    }, []);

    const goToUser = (id) => {
        setQ("");
        setResults([]);
        setSearchOpen(false);
        navigate(`/users/${id}`);
    };

    const clearSearch = () => {
        setQ('');
        setResults([]);
        setSearchOpen(false);
    };

    return {
        q,
        setQ,
        results,
        searchOpen,
        setSearchOpen,
        loading,
        searchBoxRef,
        goToUser,
        clearSearch
    };
};

// Componente para el buscador de usuarios
const UserSearch = ({ userName }) => {
    const { q, setQ, results, searchOpen, setSearchOpen, loading, searchBoxRef, goToUser, clearSearch } = useUserSearch(userName);
    
    const handleFocus = () => {
        if (results.length > 0) {
            setSearchOpen(true);
        }
    };

    const hasResults = results.length > 0;
    const showDropdown = searchOpen && (hasResults || loading);
    const hasName = (user) => user.firstName || user.lastName;
    const getUserFullName = (user) => {
        return [user.firstName, user.lastName].filter(Boolean).join(' ');
    };

    return (
        <li className="nav-item d-flex align-items-center" role="none">
            <div className="header-search" ref={searchBoxRef}>
                <i className="fa fa-search search-icon" aria-hidden="true" />
                <input
                    type="text"
                    className="search-input"
                    value={q}
                    onChange={e => setQ(e.target.value)}
                    placeholder="Buscar usuarios..."
                    aria-label="Buscar usuarios"
                    onFocus={handleFocus}
                />
                {q && (
                    <button 
                        type="button" 
                        aria-label="Limpiar búsqueda" 
                        className="search-clear" 
                        onClick={clearSearch}
                    >
                        <span aria-hidden="true">×</span>
                    </button>
                )}
                {showDropdown && (
                    <div className="dropdown-menu show search-dropdown">
                        {loading && (
                            <span className="dropdown-item text-muted">Buscando...</span>
                        )}
                        {!loading && results.map(u => (
                            <button 
                                key={u.id} 
                                className="dropdown-item d-flex align-items-center" 
                                onClick={() => goToUser(u.id)}
                            >
                                <span className="mr-2" style={{width:24, height:24, display:'inline-flex'}}>
                                    <Avatar seed={u.avatarSeed || u.userName} url={u.avatarUrl} size={24} />
                                </span>
                                <span>
                                    <strong>{u.userName}</strong>
                                    {hasName(u) && (
                                        <small className="text-muted ml-1">{getUserFullName(u)}</small>
                                    )}
                                </span>
                            </button>
                        ))}
                        {!loading && !hasResults && (
                            <span className="dropdown-item text-muted">Sin resultados</span>
                        )}
                    </div>
                )}
            </div>
        </li>
    );
};

UserSearch.propTypes = {
    userName: PropTypes.string
};

// Componente para el menú de usuario
const UserMenu = ({ user, userName, dropdownRef, menuRef }) => {
    return (
        <li className="nav-item dropdown user-dropdown user-dropdown-hover" role="none" ref={dropdownRef}>
            <button
                type="button"
                className="nav-link dropdown-toggle user-trigger"
                id="userMenuToggle"
                aria-haspopup="true"
                aria-expanded="false"
                onClick={(e) => e.preventDefault()}
                style={{border: 'none', background: 'none', padding: 0}}
            >
                <div className="user-avatar" aria-hidden="true">
                    {user && (
                        <Avatar
                            seed={user.avatarSeed || userName}
                            url={user.avatarUrl}
                            size={28}
                            alt="avatar"
                            className="user-avatar-img"
                        />
                    )}
                </div>
                <span className="user-name-text">{userName}</span>
            </button>
            <div 
                className="dropdown-menu dropdown-menu-right user-menu"
                aria-labelledby="userMenuToggle"
                ref={menuRef}
            >
                <Link className="dropdown-item" to="/users/view-profile">
                    <FormattedMessage id="project.header.viewProfile" defaultMessage="Ver Perfil"/>
                </Link>
                <Link className="dropdown-item" to="/users/blocked">
                    <FormattedMessage id="project.header.blockedUsers" defaultMessage="Usuarios Bloqueados"/>
                </Link>
                <Link className="dropdown-item" to="/users/update-profile">
                    <FormattedMessage id="project.header.updateProfile" defaultMessage="Actualizar Perfil"/>
                </Link>
                <Link className="dropdown-item" to="/users/change-password">
                    <FormattedMessage id="project.header.changePassword" defaultMessage="Cambiar Contraseña"/>
                </Link>
                <div className="dropdown-divider"/>
                <Link className="dropdown-item logout-item" to="/users/logout">
                    <FormattedMessage id="project.header.logout" defaultMessage="Cerrar Sesión"/>
                </Link>
            </div>
        </li>
    );
};

UserMenu.propTypes = {
    user: PropTypes.shape({
        avatarSeed: PropTypes.string,
        avatarUrl: PropTypes.string
    }),
    userName: PropTypes.string.isRequired,
    dropdownRef: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.shape({ current: PropTypes.instanceOf(Element) })
    ]).isRequired,
    menuRef: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.shape({ current: PropTypes.instanceOf(Element) })
    ]).isRequired
};

const Header = () => {
    const userName = useSelector(users.selectors.getUserName);
    const canManage = useSelector(users.selectors.canManage);
    const location = useLocation();
    const user = useSelector(users.selectors.getUser);
    const dropdownRef = useRef(null);
    const menuRef = useRef(null);

    const isActive = (path, exact = false) => {
        if (exact) return location.pathname === path;
        return location.pathname.startsWith(path);
    };

    // Manejar dropdown con hover
    useEffect(() => {
        const dropdown = dropdownRef.current;
        const menu = menuRef.current;
        
        if (!dropdown || !menu) return;

        let timeoutId = null;

        const showMenu = () => {
            if (timeoutId) clearTimeout(timeoutId);
            menu.classList.add('show');
        };

        const hideMenu = () => {
            timeoutId = setTimeout(() => {
                menu.classList.remove('show');
            }, 100); // Pequeño delay para permitir mover el mouse al menú
        };

        dropdown.addEventListener('mouseenter', showMenu);
        dropdown.addEventListener('mouseleave', hideMenu);
        menu.addEventListener('mouseenter', showMenu);
        menu.addEventListener('mouseleave', hideMenu);

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            dropdown.removeEventListener('mouseenter', showMenu);
            dropdown.removeEventListener('mouseleave', hideMenu);
            menu.removeEventListener('mouseenter', showMenu);
            menu.removeEventListener('mouseleave', hideMenu);
        };
    }, [userName]); // Re-run cuando cambia el usuario

    return (
        <header className="app-navbar-wrapper" role="banner">
            <nav className="navbar navbar-expand-xl navbar-dark main-navbar" aria-label="Principal">
                <div className="navbar-frame container-fluid">
                    <Link className="navbar-brand brand-combo d-flex align-items-center" to="/" aria-label="Inicio">
                        <div className="brand-logo-wrapper d-flex align-items-center justify-content-center">
                            <img
                                src={process.env.PUBLIC_URL + '/trainium-logo-2.png'}
                                width="48"
                                height="48"
                                className="brand-logo"
                                alt="Trainium"
                                onError={(e) => {
                                    e.currentTarget.style.opacity = '0.35';
                                }}
                            />
                        </div>
                        <span className="brand-text ml-2 text-uppercase">Trainium</span>
                    </Link>

                    {/* Notificaciones y perfil siempre visibles (fuera del collapse) */}
                    {userName && (
                        <div className="navbar-nav d-flex flex-row align-items-center ml-auto mr-2 navbar-always-visible">
                            <Notifications userId={user.id} />
                            <UserMenu user={user} userName={userName} dropdownRef={dropdownRef} menuRef={menuRef} />
                        </div>
                    )}

                    {/* Botón toggler (Bootstrap 4 sintaxis) */}
                    <button className="navbar-toggler" type="button"
                            data-toggle="collapse"
                            data-target="#navbarMainContent"
                            aria-controls="navbarMainContent"
                            aria-expanded="false"
                            aria-label="Mostrar menú">
                        <span className="navbar-toggler-icon"/>
                    </button>

                    {/* Contenido colapsable: solo buscador y páginas */}
                    <div className="collapse navbar-collapse" id="navbarMainContent">
                        {userName ? (
                            <>
                                {/* Buscador arriba en el menú colapsable (solo móvil) */}
                                <nav className="navbar-nav w-100 d-xl-none" aria-label="Buscador">
                                    <UserSearch userName={userName} />
                                </nav>
                                
                                {/* Páginas de navegación */}
                                <MainNavLinks isActive={isActive} canManage={canManage} user={user} />
                                
                                {/* Buscador + Notificaciones + Perfil en desktop (dentro del collapse) */}
                                <nav className="navbar-nav user-nav ml-auto d-none d-xl-flex" aria-label="Navegación de usuario">
                                    <ul className="navbar-nav user-nav ml-auto">
                                        <UserSearch userName={userName} />
                                        <li className="nav-item" role="none">
                                            <Notifications userId={user.id} />
                                        </li>
                                        <UserMenu user={user} userName={userName} dropdownRef={dropdownRef} menuRef={menuRef} />
                                    </ul>
                                </nav>
                            </>
                        ) : (
                            <nav className="navbar-nav auth-links ml-auto" aria-label="Navegación de autenticación">
                                <ul className="navbar-nav auth-links ml-auto">
                                <li className="nav-item" role="none">
                                    <Link 
                                        role="menuitem"
                                        className={`nav-link ${isActive('/users/login', true) ? 'active' : ''}`}
                                        id="loginLink" 
                                        to="/users/login"
                                    >
                                        <FormattedMessage id="project.header.login" defaultMessage="Iniciar Sesión"/>
                                    </Link>
                                </li>
                                </ul>
                            </nav>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;
