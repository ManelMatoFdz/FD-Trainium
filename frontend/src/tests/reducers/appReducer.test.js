import reducer from '../../modules/app/reducer';
import * as actionTypes from '../../modules/app/actionTypes';

describe('app reducer', () => {
  it('returns initial state by default', () => {
    const state = reducer(undefined, { type: '@@INIT' });
    expect(state).toEqual({ error: null });
  });

  it('stores error on ERROR action', () => {
    const state = reducer(undefined, { type: actionTypes.ERROR, error: { message: 'oops' } });
    expect(state.error).toEqual({ message: 'oops' });
  });
});

