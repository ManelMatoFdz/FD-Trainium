import {
  fetchConfig,
  appFetch,
  setServiceToken,
  getServiceToken,
  removeServiceToken,
  setReauthenticationCallback,
} from "./appFetch";

const processLoginSignUp = (authenticatedUser, reauthenticationCallback) => {
  setServiceToken(authenticatedUser.serviceToken);
  setReauthenticationCallback(reauthenticationCallback);
}

export const login = (
  userName,
  password,
  reauthenticationCallback, 
  onSuccess, 
  onErrors
) =>
  appFetch(
    "/users/login",
    fetchConfig("POST", { userName, password }),
    (authenticatedUser) => {
      processLoginSignUp(authenticatedUser, reauthenticationCallback);
      onSuccess(authenticatedUser)
    }, 
    onErrors
  );

export const tryLoginFromServiceToken = (
  reauthenticationCallback,
  onSuccess,
  onError
) => {
  const serviceToken = getServiceToken();

  if (!serviceToken) {
    return {ok: false, payload: null};
  }

  setReauthenticationCallback(reauthenticationCallback);

  appFetch(
    "/users/loginFromServiceToken",
    fetchConfig("POST"),
      (authenticatedUser) => {
          onSuccess(authenticatedUser);
      },
    () =>{
        removeServiceToken();
        if (onError) onError();
    }
  );
};

export const signUp = (user,reauthenticationCallback, onSuccess, onErrors) => {
  appFetch(
    "/users/signUp",
    fetchConfig("POST", user),
    (authenticatedUser) => {
      processLoginSignUp(authenticatedUser, reauthenticationCallback);
      onSuccess(authenticatedUser);
    },
    onErrors
  );
};

export const logout = () => removeServiceToken();

export const getProfile = (onSuccess, onErrors) => {
  return appFetch(`/users/myProfile`, fetchConfig("GET"), onSuccess, onErrors);
}

export const searchUsers = (query, requesterId, onSuccess, onErrors) => {
  const q = (query || "").trim();
  if (!q) { return onSuccess ? onSuccess([]) : undefined; }
  return appFetch(`/users/search?userName=${encodeURIComponent(q)}&requesterId=${encodeURIComponent(requesterId)}`, fetchConfig("GET"), onSuccess, onErrors);
}

export const findUserById = (id, onSuccess, onErrors) =>
  appFetch(`/users/${encodeURIComponent(id)}`, fetchConfig("GET"), onSuccess, onErrors);


export const updateProfile = (user, onSuccess, onErrors) =>
  appFetch(`/users/${user.id}`, fetchConfig("PUT", user), onSuccess, onErrors);

export const changePassword = (
  id,
  oldPassword,
  newPassword,
  onSuccess,
  onErrors
) =>
  appFetch(
    `/users/${id}/changePassword`,
    fetchConfig("POST", { oldPassword, newPassword }),
    onSuccess,
    onErrors
  );

// Follow / Unfollow / Check following status
export const followUser = (userId, onSuccess, onErrors) =>
  appFetch(
    `/users/${encodeURIComponent(userId)}/follow`,
    fetchConfig("POST"),
    onSuccess,
    onErrors
  );

export const unfollowUser = (userId, onSuccess, onErrors) =>
  appFetch(
    `/users/${encodeURIComponent(userId)}/unfollow`,
    fetchConfig("DELETE"),
    onSuccess,
    onErrors
  );

export const isFollowingUser = (userId, onSuccess, onErrors) =>
  appFetch(
    `/users/${encodeURIComponent(userId)}/isFollowing`,
    fetchConfig("GET"),
    onSuccess,
    onErrors
  );

// Lists of followers / following
export const getFollowers = (userId, onSuccess, onErrors) =>
  appFetch(
    `/users/${encodeURIComponent(userId)}/followers`,
    fetchConfig("GET"),
    onSuccess,
    onErrors
  );

export const getFollowing = (userId, onSuccess, onErrors) =>
  appFetch(
    `/users/${encodeURIComponent(userId)}/following`,
    fetchConfig("GET"),
    onSuccess,
    onErrors
  );

// Premium functionality
export const activatePremium = (userId, onSuccess, onErrors) =>
    appFetch(
        `/users/${encodeURIComponent(userId)}/premium`,
        fetchConfig("POST"),
        onSuccess,
        onErrors
    );

export const deactivatePremium = (userId, onSuccess, onErrors) =>
    appFetch(
        `/users/${encodeURIComponent(userId)}/premium/remove`,
        fetchConfig("POST"),
        onSuccess,
        onErrors
    );
export const blockUser = (userId, onSuccess, onErrors) =>
    appFetch(`/users/${encodeURIComponent(userId)}/block`,
        fetchConfig("POST"),
        onSuccess,
        onErrors
    );

export const unblockUser = (userId, onSuccess, onErrors) =>
    appFetch(`/users/${encodeURIComponent(userId)}/unblock`,
        fetchConfig("DELETE"),
        onSuccess,
        onErrors
    );

export const isBlockedUser = (userId, onSuccess, onErrors) =>
    appFetch(`/users/${encodeURIComponent(userId)}/isBlocked`,
        fetchConfig("GET"),
        onSuccess,
        onErrors
    );

export const getBlockedUsers = (userId, onSuccess, onErrors) =>
    appFetch(
        `/users/blocked?userId=${encodeURIComponent(userId)}`,
        fetchConfig("GET"),
        onSuccess,
        onErrors
    );

// Wrapped - Yearly Statistics
export const getWrapped = (year, onSuccess, onErrors) => {
    const url = year ? `/users/wrapped?year=${encodeURIComponent(year)}` : `/users/wrapped`;
    return appFetch(url, fetchConfig("GET"), onSuccess, onErrors);
};

// Admin ban/unban functionality (ADMIN only)
export const adminBanUser = (userId, onSuccess, onErrors) =>
    appFetch(`/users/${encodeURIComponent(userId)}/admin-ban`,
        fetchConfig("POST"),
        onSuccess,
        onErrors
    );

export const adminUnbanUser = (userId, onSuccess, onErrors) =>
    appFetch(`/users/${encodeURIComponent(userId)}/admin-ban`,
        fetchConfig("DELETE"),
        onSuccess,
        onErrors
    );

export const getBannedUsers = (onSuccess, onErrors) =>
    appFetch(`/users/admin-banned`,
        fetchConfig("GET"),
        onSuccess,
        onErrors
    );
