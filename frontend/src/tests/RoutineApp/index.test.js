import RoutineApp from '../../RoutineApp';

describe('RoutineApp store', () => {
  it('exports a configured redux store', () => {
    expect(typeof RoutineApp.getState).toBe('function');
    expect(typeof RoutineApp.dispatch).toBe('function');
  });
});
