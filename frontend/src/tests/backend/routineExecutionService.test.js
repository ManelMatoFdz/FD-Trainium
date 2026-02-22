import * as routineExecutionService from '../../backend/routineExecutionService';
import { appFetch, fetchConfig } from '../../backend/appFetch';

jest.mock('../../backend/appFetch', () => ({
  appFetch: jest.fn(),
  fetchConfig: jest.fn((method, body) => ({ method, body })),
}));

describe('routineExecutionService', () => {
  beforeEach(() => {
    appFetch.mockReset();
    fetchConfig.mockClear();
  });

  it('create posts execution payload', async () => {
    const exec = { routineId: 1, exercises: [] };
    appFetch.mockImplementation((_path, _opts, onSuccess) => onSuccess({ id: 10 }));
    const resp = await routineExecutionService.create(exec);
    expect(resp.ok).toBe(true);
    expect(appFetch).toHaveBeenCalledWith(
      '/routine-executions',
      fetchConfig('POST', exec),
      expect.any(Function),
      expect.any(Function)
    );
  });

  it('like/unlike use correct methods', async () => {
    appFetch.mockImplementation((_path, _opts, onSuccess) => onSuccess({ ok: true }));
    await routineExecutionService.like(5);
    expect(appFetch.mock.calls[0][0]).toBe('/routine-executions/5/like');
    expect(fetchConfig).toHaveBeenCalledWith('POST');

    await routineExecutionService.unlike(5);
    expect(appFetch.mock.calls[1][0]).toBe('/routine-executions/5/like');
    expect(fetchConfig).toHaveBeenCalledWith('DELETE');
  });
});
