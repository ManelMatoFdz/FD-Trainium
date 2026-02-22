import { getError } from '../../modules/app/selectors';

describe('app selectors', () => {
  it('getError returns app.error', () => {
    const state = { app: { error: { message: 'x' } } };
    expect(getError(state)).toEqual({ message: 'x' });
  });
});

