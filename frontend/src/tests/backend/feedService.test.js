import * as feedService from '../../backend/feedService';
import { appFetch, fetchConfig } from '../../backend/appFetch';

jest.mock('../../backend/appFetch', () => ({
  appFetch: jest.fn(),
  fetchConfig: jest.fn(() => ({ method: 'GET' })),
}));

describe('feedService', () => {
  beforeEach(() => {
    appFetch.mockReset();
    fetchConfig.mockClear();
  });

  it('getFeed builds page and size params', async () => {
    appFetch.mockImplementation((path, _opts, onSuccess) => {
      expect(path).toContain('/users/feed?');
      expect(path).toContain('page=2');
      expect(path).toContain('size=15');
      onSuccess({ items: [] });
    });

    const resp = await feedService.getFeed(2, 15);
    expect(resp.ok).toBe(true);
  });
});
