import * as exerciseService from '../../backend/exerciseService';
import { appFetch, fetchConfig } from '../../backend/appFetch';

jest.mock('../../backend/appFetch', () => ({
  appFetch: jest.fn(),
  fetchConfig: jest.fn(() => ({ method: 'GET' })),
}));

describe('exerciseService find & findPending', () => {
  beforeEach(() => {
    appFetch.mockReset();
    fetchConfig.mockClear();
  });

  it('builds query params with array muscles in find', async () => {
    appFetch.mockImplementation((path, options, onSuccess) => {
      onSuccess({ items: [{ id: 1 }], existMoreItems: true });
    });

    const resp = await exerciseService.find({
      name: ' press ',
      material: ' barra ',
      muscles: ['CHEST', 'BACK'],
      page: 2,
    });

    expect(resp.ok).toBe(true);
    const url = appFetch.mock.calls[0][0];
    expect(url).toContain('/exercises?');
    expect(url).toContain('name=press');
    expect(url).toContain('material=barra');
    expect(url).toContain('muscles=CHEST%2CBACK');
    expect(url).toContain('page=2');
  });

  it('builds query params for findPending', async () => {
    appFetch.mockImplementation((path, options, onSuccess) => {
      onSuccess({ items: [], existMoreItems: false });
    });

    const resp = await exerciseService.findPending({
      name: ' pend ',
      material: ' rack ',
      muscles: 'LEGS',
      page: 0,
    });

    expect(resp.ok).toBe(true);
    const url = appFetch.mock.calls[0][0];
    expect(url).toContain('/exercises/pending?');
    expect(url).toContain('name=pend');
    expect(url).toContain('material=rack');
    expect(url).toContain('muscles=LEGS');
  });
});

