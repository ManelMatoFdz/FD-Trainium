import { appFetch, fetchConfig } from "./appFetch";

function run(path, method, body) {
    return new Promise((resolve, reject) => {
        const options = fetchConfig(method, body);
        appFetch(path, options, resolve, reject);
    });
}

export function fetchNotifications(userId) {
    return run(`/users/${userId}/notifications`, 'GET');
}

export function fetchUnreadCount(userId) {
// Backend returns a number; handleResponse in appFetch should parse JSON/text accordingly
    return run(`/users/${userId}/notifications/unread/count`, 'GET');
}

export function markAllAsRead(userId) {
// Returns an int = number of rows updated
    return run(`/users/${userId}/notifications/mark-all-read`, 'POST');
}

export function markAsRead(userId, notificationId) {
// Marks a single notification as read
    return run(`/users/${userId}/notifications/${notificationId}/mark-read`, 'POST');
}