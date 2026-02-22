import { getList, getCurrent, isLoading } from '../../modules/exercises/selectors';

describe('exercises selectors', () => {
  const state = {
    exercises: {
      list: [{ id: 1 }],
      current: { id: 2 },
      loading: true,
    },
  };

  it('getList returns exercises.list', () => {
    expect(getList(state)).toEqual([{ id: 1 }]);
  });

  it('getCurrent returns exercises.current', () => {
    expect(getCurrent(state)).toEqual({ id: 2 });
  });

  it('isLoading returns loading flag', () => {
    expect(isLoading(state)).toBe(true);
  });
});

