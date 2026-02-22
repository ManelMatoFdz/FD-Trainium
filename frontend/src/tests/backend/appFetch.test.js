import NetworkError from '../../backend/NetworkError';
import {
  appFetch,
  fetchConfig,
  init,
  setReauthenticationCallback,
  setServiceToken,
} from '../../backend/appFetch';

function makeHeaders(contentType) {
  return {
    get: (name) => (name && name.toLowerCase() === 'content-type' ? contentType : null),
  };
}

function makeResponse({ ok, status, contentType, jsonPayload, blobPayload }) {
  return {
    ok,
    status,
    headers: makeHeaders(contentType),
    json: () => Promise.resolve(jsonPayload),
    blob: () => Promise.resolve(blobPayload ?? new Blob(['x'])),
  };
}

describe('backend/appFetch', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    localStorage.clear();
  });

  it('fetchConfig builds JSON body and adds Authorization when token exists', () => {
    setServiceToken('t-123');
    const cfg = fetchConfig('POST', { a: 1 });
    expect(cfg.method).toBe('POST');
    expect(cfg.headers['Content-Type']).toBe('application/json');
    expect(cfg.headers.Authorization).toBe('Bearer t-123');
    expect(cfg.body).toBe(JSON.stringify({ a: 1 }));
  });

  it('fetchConfig passes FormData through without JSON headers', () => {
    const fd = new FormData();
    fd.append('x', 'y');
    const cfg = fetchConfig('PUT', fd);
    expect(cfg.method).toBe('PUT');
    expect(cfg.body).toBe(fd);
    expect(cfg.headers).toBeUndefined();
  });

  it('calls onSuccess for 204 response when ok', async () => {
    const onSuccess = jest.fn();
    const onErrors = jest.fn();
    init(jest.fn());

    global.fetch = jest.fn().mockResolvedValue(
      makeResponse({ ok: true, status: 204, contentType: 'application/json' })
    );

    await appFetch('/x', fetchConfig('GET'), onSuccess, onErrors);
    await Promise.resolve();

    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onErrors).not.toHaveBeenCalled();
  });

  it('parses JSON ok response and passes payload + status to onSuccess', async () => {
    const onSuccess = jest.fn();
    init(jest.fn());

    global.fetch = jest.fn().mockResolvedValue(
      makeResponse({
        ok: true,
        status: 200,
        contentType: 'application/json',
        jsonPayload: { k: 1 },
      })
    );

    await appFetch('/x', fetchConfig('GET'), onSuccess);
    await Promise.resolve();
    await Promise.resolve();

    expect(onSuccess).toHaveBeenCalledWith({ k: 1 }, 200);
  });

  it('parses non-JSON ok response as blob', async () => {
    const onSuccess = jest.fn();
    init(jest.fn());

    const blob = new Blob(['abc']);
    global.fetch = jest.fn().mockResolvedValue(
      makeResponse({
        ok: true,
        status: 200,
        contentType: 'application/octet-stream',
        blobPayload: blob,
      })
    );

    await appFetch('/x', fetchConfig('GET'), onSuccess);
    await Promise.resolve();
    await Promise.resolve();

    expect(onSuccess).toHaveBeenCalledWith(blob, 200);
  });

  it('handles 4xx JSON errors by calling onErrors when payload has message', async () => {
    const onErrors = jest.fn();
    init(jest.fn());

    global.fetch = jest.fn().mockResolvedValue(
      makeResponse({
        ok: false,
        status: 400,
        contentType: 'application/json',
        jsonPayload: { message: 'bad' },
      })
    );

    await appFetch('/x', fetchConfig('GET'), undefined, onErrors);
    await Promise.resolve();
    await Promise.resolve();

    expect(onErrors).toHaveBeenCalledWith({ message: 'bad' }, 400);
  });

  it('401 triggers reauthentication callback (when configured)', async () => {
    const reauth = jest.fn();
    setReauthenticationCallback(reauth);
    init(jest.fn());

    global.fetch = jest.fn().mockResolvedValue(
      makeResponse({
        ok: false,
        status: 401,
        contentType: 'application/json',
        jsonPayload: {},
      })
    );

    await appFetch('/x', fetchConfig('GET'));
    await Promise.resolve();
    expect(reauth).toHaveBeenCalledTimes(1);
  });

  it('non-JSON 4xx throws NetworkError and is forwarded to init callback', async () => {
    const netCb = jest.fn();
    init(netCb);

    global.fetch = jest.fn().mockResolvedValue(
      makeResponse({ ok: false, status: 404, contentType: 'text/html' })
    );

    await appFetch('/x', fetchConfig('GET'));
    await Promise.resolve();

    expect(netCb).toHaveBeenCalled();
    const err = netCb.mock.calls[0][0];
    expect(err).toBeInstanceOf(NetworkError);
  });

  it('fetch rejection is forwarded to init callback', async () => {
    const netCb = jest.fn();
    init(netCb);
    global.fetch = jest.fn().mockRejectedValue(new Error('boom'));

    await appFetch('/x', fetchConfig('GET'));
    await Promise.resolve();

    expect(netCb).toHaveBeenCalled();
  });
});
