import * as notificationsService from '../../backend/notificationsService';
import { appFetch, fetchConfig } from '../../backend/appFetch';

jest.mock('../../backend/appFetch', () => ({
  appFetch: jest.fn(),
  fetchConfig: jest.fn((method, body) => ({ method, body })),
}));

describe('notificationsService', () => {
  beforeEach(() => {
    appFetch.mockReset();
  });

  it('fetchNotifications uses GET and resolves payload', async () => {
    appFetch.mockImplementation((_p, _o, resolve) => resolve([{ id: 1 }]));
    const resp = await notificationsService.fetchNotifications(7);
    expect(appFetch.mock.calls[0][0]).toBe('/users/7/notifications');
    expect(resp[0].id).toBe(1);
    expect(fetchConfig.mock.calls[0][0]).toBe('GET');
  });

  it('markAllAsRead uses POST', async () => {
    appFetch.mockImplementation((_p, _o, resolve) => resolve(3));
    const count = await notificationsService.markAllAsRead(9);
    expect(appFetch.mock.calls[0][0]).toBe('/users/9/notifications/mark-all-read');
    expect(fetchConfig.mock.calls[0][0]).toBe('POST');
    expect(count).toBe(3);
  });

  it('markAsRead uses POST with notification id', async () => {
    appFetch.mockImplementation((_p, _o, resolve) => resolve({ ok: true }));
    await notificationsService.markAsRead(9, 22);
    expect(appFetch.mock.calls[0][0]).toBe('/users/9/notifications/22/mark-read');
    expect(fetchConfig.mock.calls[0][0]).toBe('POST');
  });
});
