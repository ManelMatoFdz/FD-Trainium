import * as routineService from '../../backend/routineService';
import { appFetch, fetchConfig } from '../../backend/appFetch';

jest.mock('../../backend/appFetch', () => ({
  appFetch: jest.fn(),
  fetchConfig: jest.fn(() => ({ method: 'GET' })),
}));

describe('routineService', () => {
  beforeEach(() => {
    appFetch.mockReset();
    fetchConfig.mockClear();
  });

  it('searchRoutines builds query params correctly', async () => {
    appFetch.mockImplementation((path, options, onSuccess) => {
      onSuccess({ items: [{ id: 1 }], existMoreItems: false });
    });

    const resp = await routineService.searchRoutines('cat1', ' fuerza ', 'AVANZADO', ['CHEST', 'BACK'], 2, 5);

    expect(resp.ok).toBe(true);
    expect(resp.payload.items[0].id).toBe(1);
    const url = appFetch.mock.calls[0][0];
    expect(url).toContain('/routines/search?');
    expect(url).toContain('categoryId=cat1');
    expect(url).toContain('keywords=fuerza');
    expect(url).toContain('level=AVANZADO');
    expect(url).toContain('muscles=CHEST');
    expect(url).toContain('muscles=BACK');
    expect(url).toContain('page=2');
    expect(url).toContain('size=5');
  });

  it('myRoutines adds page and size params', async () => {
    appFetch.mockImplementation((path, options, onSuccess) => {
      onSuccess({ items: [], existMoreItems: false });
    });

    const resp = await routineService.myRoutines(3, 20);
    expect(resp.ok).toBe(true);
    const url = appFetch.mock.calls[0][0];
    expect(url).toContain('/routines/myRoutines?');
    expect(url).toContain('page=3');
    expect(url).toContain('size=20');
  });
});

