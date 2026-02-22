const getModuleState = state => state.users;

export const getUser = state => 
    getModuleState(state).user;

export const isLoggedIn = state =>
    getUser(state) !== null

export const getUserName = state => 
    isLoggedIn(state) ? getUser(state).userName : null;

export const getUserRole = state =>
    isLoggedIn(state) ? getUser(state).role : null;

// Determina si el usuario es entrenador
export const isTrainer = state => {
    const user = getUser(state);
    if (!user) return false;
    const role = user.role;
    // Soporta role numérico (1) o string ('TRAINER'), y usa formation como pista
    const byNumber = typeof role === 'number' && role === 1;
    const byString = typeof role === 'string' && role.toUpperCase() === 'TRAINER';
    const byFormation = !!user.formation;
    return Boolean(byNumber || byString || byFormation);
};

export const isAdmin = state => {
    const user = getUser(state);
    if (!user) return false;
    const role = user.role;

    // Admite:
    // - número 2
    // - string 'ADMIN', 'ROLE_ADMIN', 'ADMINISTRATOR' (cualquier string que contenga 'ADMIN')
    // - array de roles (strings o números)
    if (typeof role === 'number') {
        return role === 2;
    }
    if (typeof role === 'string') {
        return role.toUpperCase().includes('ADMIN');
    }
    if (Array.isArray(role)) {
        return role.some(r => {
            if (typeof r === 'number') return r === 2;
            if (typeof r === 'string') return r.toUpperCase().includes('ADMIN');
            return false;
        });
    }
    return false;
};

// ¿puede gestionar (admin o entrenador)?
export const canManage = state =>
    isTrainer(state) || isAdmin(state);