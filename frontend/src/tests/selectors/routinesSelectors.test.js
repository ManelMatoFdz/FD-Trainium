import { getList, getCurrent, getCategories, getSearchResults } from '../../modules/routines/selectors';

describe('routines selectors', () => {
  const state = {
    routines: {
      list: [{ id: 1 }],
      current: { id: 2 },
      categories: [{ id: 'A' }],
      searchResults: { items: [1], existMoreItems: false },
    },
  };

  it('returns list', () => {
    expect(getList(state)).toEqual([{ id: 1 }]);
  });

  it('returns current', () => {
    expect(getCurrent(state)).toEqual({ id: 2 });
  });

  it('returns categories', () => {
    expect(getCategories(state)).toEqual([{ id: 'A' }]);
  });

  it('returns searchResults', () => {
    expect(getSearchResults(state)).toEqual({ items: [1], existMoreItems: false });
  });
});

