import * as categoryService from '../../backend/categoryService';
import { appFetch, fetchConfig } from '../../backend/appFetch';

jest.mock('../../backend/appFetch', () => ({
  appFetch: jest.fn(),
  fetchConfig: jest.fn(() => ({ method: 'GET' })),
}));

describe('categoryService', () => {
  beforeEach(() => {
    appFetch.mockReset();
    fetchConfig.mockClear();
  });

  it('findAll calls GET /categories and resolves {ok:true}', async () => {
    appFetch.mockImplementation((_path, _opts, onSuccess) =>
      onSuccess([{ id: 1, name: 'A' }])
    );
    const resp = await categoryService.findAll();
    expect(resp.ok).toBe(true);
    expect(resp.payload[0].id).toBe(1);
    expect(appFetch).toHaveBeenCalledWith(
      '/categories',
      fetchConfig('GET'),
      expect.any(Function),
      expect.any(Function)
    );
  });

  it('findAll resolves {ok:false} when onErrors is called', async () => {
    appFetch.mockImplementation((_path, _opts, _onSuccess, onErrors) =>
      onErrors({ message: 'nope' })
    );
    const resp = await categoryService.findAll();
    expect(resp.ok).toBe(false);
    expect(resp.payload.message).toBe('nope');
  });
});
