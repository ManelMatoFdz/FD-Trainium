import reducer from '../../modules/users/reducer';
import * as actionTypes from '../../modules/users/actionTypes';

describe('users reducer', () => {
  it('returns initial state by default', () => {
    const state = reducer(undefined, { type: '@@INIT' });
    expect(state).toEqual({ user: null });
  });

  it('stores user on SIGN_UP_COMPLETED and LOGIN_COMPLETED', () => {
    const user = { id: 1, userName: 'alice' };
    const signupState = reducer(undefined, {
      type: actionTypes.SIGN_UP_COMPLETED,
      authenticatedUser: { user },
    });
    expect(signupState.user).toEqual(user);

    const loginState = reducer(undefined, {
      type: actionTypes.LOGIN_COMPLETED,
      authenticatedUser: { user },
    });
    expect(loginState.user).toEqual(user);
  });

  it('clears user on LOGOUT', () => {
    const state = reducer({ user: { id: 1 } }, { type: actionTypes.LOGOUT });
    expect(state.user).toBeNull();
  });

  it('updates user on profile actions', () => {
    const profile = { id: 1, userName: 'bob' };
    const s1 = reducer(undefined, {
      type: actionTypes.FIND_PROFILE_COMPLETED,
      user: profile,
    });
    expect(s1.user).toEqual(profile);

    const updated = { id: 1, userName: 'bob2' };
    const s2 = reducer(s1, {
      type: actionTypes.UPDATE_PROFILE_COMPLETED,
      user: updated,
    });
    expect(s2.user).toEqual(updated);
  });
});

