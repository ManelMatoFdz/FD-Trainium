import reducer from '../../modules/routines/reducer';
import * as actionTypes from '../../modules/routines/actionTypes';

describe('routines reducer', () => {
  it('returns initial state by default', () => {
    const state = reducer(undefined, { type: '@@INIT' });
    expect(state).toEqual({
      list: [],
      current: null,
      categories: [],
      searchResults: { items: [], existMoreItems: false },
      savedUsers: [],
    });
  });

  it('handles FIND_ALL_COMPLETED and SAVE_COMPLETED on list', () => {
    const items = [{ id: 1 }, { id: 2 }];
    const state = reducer(undefined, { type: actionTypes.FIND_ALL_COMPLETED, items });
    expect(state.list).toEqual(items);

    const updated = reducer(state, {
      type: actionTypes.SAVE_COMPLETED,
      item: { id: 1, name: 'X' },
    });
    expect(updated.list[0].name).toBe('X');

    const added = reducer(state, {
      type: actionTypes.SAVE_COMPLETED,
      item: { id: 999, name: 'New' },
    });
    expect(added.list[0].id).toBe(999);
  });

  it('handles current routine and delete', () => {
    const state = reducer(undefined, {
      type: actionTypes.FIND_BY_ID_COMPLETED,
      item: { id: 10, name: 'R' },
    });
    expect(state.current.id).toBe(10);

    const afterDelete = reducer(state, {
      type: actionTypes.DELETE_COMPLETED,
      id: 10,
    });
    expect(afterDelete.current).toBeNull();
  });

  it('handles follow creator flags on current routine', () => {
    const base = reducer(undefined, {
      type: actionTypes.FIND_BY_ID_COMPLETED,
      item: { id: 10, name: 'R' },
    });

    const isFollowing = reducer(base, {
      type: actionTypes.IS_FOLLOWING_CREATOR_COMPLETED,
      routineId: 10,
      isFollowing: true,
    });
    expect(isFollowing.current.isFollowing[10]).toBe(true);

    const afterFollow = reducer(base, {
      type: actionTypes.FOLLOW_CREATOR_COMPLETED,
      routineId: 10,
    });
    expect(afterFollow.current.isFollowing[10]).toBe(true);

    const afterUnfollow = reducer(base, {
      type: actionTypes.UNFOLLOW_CREATOR_COMPLETED,
      routineId: 10,
    });
    expect(afterUnfollow.current.isFollowing[10]).toBe(false);
  });

  it('handles categories and searchResults and savedUsers', () => {
    const categoriesState = reducer(undefined, {
      type: actionTypes.FIND_ALL_CATEGORIES_COMPLETED,
      categories: [{ id: 'A' }],
    });
    expect(categoriesState.categories.length).toBe(1);

    const searchState = reducer(undefined, {
      type: actionTypes.SEARCH_ROUTINES_COMPLETED,
      searchResults: { items: [{ id: 1 }], existMoreItems: true },
    });
    expect(searchState.searchResults.existMoreItems).toBe(true);

    const savedUsersState = reducer(undefined, {
      type: actionTypes.SAVED_USERS_COMPLETED,
      users: [{ id: 1 }],
    });
    expect(savedUsersState.savedUsers.length).toBe(1);
  });
});

