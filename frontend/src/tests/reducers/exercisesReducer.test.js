import reducer from '../../modules/exercises/reducer';
import * as actionTypes from '../../modules/exercises/actionTypes';

describe('exercises reducer', () => {
  it('returns initial state by default', () => {
    const state = reducer(undefined, { type: '@@INIT' });
    expect(state).toEqual({ list: [], current: null, loading: false });
  });

  it('handles FIND_ALL_COMPLETED by replacing list', () => {
    const items = [{ id: 1 }, { id: 2 }];
    const state = reducer(undefined, { type: actionTypes.FIND_ALL_COMPLETED, items });
    expect(state.list).toEqual(items);
  });

  it('handles SAVE_COMPLETED by adding or updating item', () => {
    const initial = { list: [{ id: 1, name: 'A' }], current: null, loading: false };
    const updated = reducer(initial, {
      type: actionTypes.SAVE_COMPLETED,
      item: { id: 1, name: 'B' },
    });
    expect(updated.list[0].name).toBe('B');

    const added = reducer(initial, {
      type: actionTypes.SAVE_COMPLETED,
      item: { id: 2, name: 'C' },
    });
    expect(added.list.length).toBe(2);
  });

  it('handles DELETE_COMPLETED and UPDATE_COMPLETED on list/current', () => {
    const state = {
      list: [{ id: 1, name: 'A' }],
      current: { id: 1, name: 'A' },
      loading: false,
    };
    const updated = reducer(state, {
      type: actionTypes.UPDATE_COMPLETED,
      item: { id: 1, name: 'B' },
    });
    expect(updated.list[0].name).toBe('B');
    expect(updated.current.name).toBe('B');

    const afterDelete = reducer(updated, {
      type: actionTypes.DELETE_COMPLETED,
      id: 1,
    });
    expect(afterDelete.list).toEqual([]);
  });

  it('updates loading flag', () => {
    const state = reducer(undefined, { type: actionTypes.SET_LOADING, loading: true });
    expect(state.loading).toBe(true);
  });
});

