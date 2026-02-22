import {
  getUser,
  isLoggedIn,
  getUserName,
  getUserRole,
  isTrainer,
  isAdmin,
  canManage,
} from '../../modules/users/selectors';

describe('users selectors', () => {
  it('basic getters for anonymous user', () => {
    const state = { users: { user: null } };
    expect(getUser(state)).toBeNull();
    expect(isLoggedIn(state)).toBe(false);
    expect(getUserName(state)).toBeNull();
    expect(getUserRole(state)).toBeNull();
    expect(isTrainer(state)).toBe(false);
    expect(isAdmin(state)).toBe(false);
    expect(canManage(state)).toBe(false);
  });

  it('trainer detection by string and formation', () => {
    const stateByString = { users: { user: { role: 'TRAINER', formation: '' } } };
    expect(isTrainer(stateByString)).toBe(true);

    const stateByFormation = { users: { user: { role: 'USER', formation: 'Coach' } } };
    expect(isTrainer(stateByFormation)).toBe(true);
  });

  it('admin detection by number, string and array', () => {
    const stateByNumber = { users: { user: { role: 2 } } };
    expect(isAdmin(stateByNumber)).toBe(true);

    const stateByString = { users: { user: { role: 'ROLE_ADMIN' } } };
    expect(isAdmin(stateByString)).toBe(true);

    const stateByArray = { users: { user: { role: ['ROLE_USER', 'ADMIN'] } } };
    expect(isAdmin(stateByArray)).toBe(true);
  });

  it('canManage is true when trainer or admin', () => {
    const trainerState = { users: { user: { role: 'TRAINER' } } };
    const adminState = { users: { user: { role: 'ADMIN' } } };
    expect(canManage(trainerState)).toBe(true);
    expect(canManage(adminState)).toBe(true);
  });
});

