import * as userService from '../../backend/userService';
import { appFetch, fetchConfig, setServiceToken, removeServiceToken } from '../../backend/appFetch';

jest.mock('../../backend/appFetch', () => ({
    appFetch: jest.fn(),
    fetchConfig: jest.fn(() => ({ method: 'GET' })),
    setServiceToken: jest.fn(),
    removeServiceToken: jest.fn(),
    setReauthenticationCallback: jest.fn(),
    getServiceToken: jest.fn(),
}));

describe('userService', () => {
    beforeEach(() => {
        appFetch.mockReset();
        fetchConfig.mockClear();
        setServiceToken.mockClear();
        removeServiceToken.mockClear();
    });

    // ---------------- LOGIN ----------------
    it('login calls appFetch with correct URL and payload', async () => {
        const onSuccess = jest.fn();
        const onErrors = jest.fn();
        const reauth = jest.fn();

        appFetch.mockImplementation((path, options, success) => {
            success({ serviceToken: 'token123', userName: 'alice' });
        });

        await userService.login('alice', 'pwd', reauth, onSuccess, onErrors);

        expect(appFetch).toHaveBeenCalledWith(
            '/users/login',
            fetchConfig('POST', { userName: 'alice', password: 'pwd' }),
            expect.any(Function),
            onErrors
        );
        expect(setServiceToken).toHaveBeenCalledWith('token123');
        expect(onSuccess).toHaveBeenCalledWith({ serviceToken: 'token123', userName: 'alice' });
    });

    // ---------------- SIGNUP ----------------
    it('signUp calls appFetch with correct URL and payload', async () => {
        const user = { userName: 'bob', password: 'pwd' };
        const onSuccess = jest.fn();
        const onErrors = jest.fn();
        const reauth = jest.fn();

        appFetch.mockImplementation((path, options, success) => success({ serviceToken: 't', userName: 'bob' }));

        await userService.signUp(user, reauth, onSuccess, onErrors);

        expect(appFetch).toHaveBeenCalledWith(
            '/users/signUp',
            fetchConfig('POST', user),
            expect.any(Function),
            onErrors
        );
        expect(setServiceToken).toHaveBeenCalledWith('t');
        expect(onSuccess).toHaveBeenCalledWith({ serviceToken: 't', userName: 'bob' });
    });

    // ---------------- LOGOUT ----------------
    it('logout calls removeServiceToken', () => {
        userService.logout();
        expect(removeServiceToken).toHaveBeenCalled();
    });

    // ---------------- GET PROFILE ----------------
    it('getProfile calls appFetch with GET', () => {
        const onSuccess = jest.fn();
        const onErrors = jest.fn();
        userService.getProfile(onSuccess, onErrors);

        expect(appFetch).toHaveBeenCalledWith(
            '/users/myProfile',
            fetchConfig('GET'),
            onSuccess,
            onErrors
        );
    });

    // ---------------- SEARCH USERS ----------------
    it('searchUsers trims query and builds URL correctly', () => {
        const onSuccess = jest.fn();
        const onErrors = jest.fn();
        userService.searchUsers(' alice ', 99, onSuccess, onErrors);

        const expectedUrl = '/users/search?userName=alice&requesterId=99';
        expect(appFetch).toHaveBeenCalledWith(
            expectedUrl,
            fetchConfig('GET'),
            onSuccess,
            onErrors
        );
    });

    it('searchUsers empty query calls onSuccess with empty array', () => {
        const onSuccess = jest.fn();
        userService.searchUsers('   ', 1, onSuccess);
        expect(onSuccess).toHaveBeenCalledWith([]);
    });

    // ---------------- BLOCK / UNBLOCK / ISBLOCKED ----------------
    it('blockUser calls correct endpoint', () => {
        const onSuccess = jest.fn();
        const onErrors = jest.fn();
        userService.blockUser(5, onSuccess, onErrors);

        expect(appFetch).toHaveBeenCalledWith(
            '/users/5/block',
            fetchConfig('POST'),
            onSuccess,
            onErrors
        );
    });

    it('unblockUser calls correct endpoint', () => {
        const onSuccess = jest.fn();
        const onErrors = jest.fn();
        userService.unblockUser(5, onSuccess, onErrors);

        expect(appFetch).toHaveBeenCalledWith(
            '/users/5/unblock',
            fetchConfig('DELETE'),
            onSuccess,
            onErrors
        );
    });

    it('isBlockedUser calls correct endpoint', () => {
        const onSuccess = jest.fn();
        const onErrors = jest.fn();
        userService.isBlockedUser(5, onSuccess, onErrors);

        expect(appFetch).toHaveBeenCalledWith(
            '/users/5/isBlocked',
            fetchConfig('GET'),
            onSuccess,
            onErrors
        );
    });

    // ---------------- GET BLOCKED USERS ----------------
    it('getBlockedUsers calls correct endpoint with userId and triggers onSuccess', () => {
        const onSuccess = jest.fn();
        const onErrors = jest.fn();
        const userId = 42;

        const mockBlockedList = [
            { id: 1, userName: 'alice', avatarUrl: null, avatarSeed: 'seed1' },
            { id: 2, userName: 'bob', avatarUrl: null, avatarSeed: 'seed2' }
        ];

        appFetch.mockImplementation((path, options, success) => {
            success(mockBlockedList);
        });

        userService.getBlockedUsers(userId, onSuccess, onErrors);

        expect(appFetch).toHaveBeenCalledWith(
            `/users/blocked?userId=${encodeURIComponent(userId)}`,
            fetchConfig("GET"),
            onSuccess,
            onErrors
        );

        expect(onSuccess).toHaveBeenCalledWith(mockBlockedList);
    });

});
