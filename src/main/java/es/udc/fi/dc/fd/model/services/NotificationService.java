package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Notification;
import es.udc.fi.dc.fd.model.entities.Users;

import java.util.List;

public interface NotificationService {

    List<Notification> getUserNotifications(Long userId);

    long countUnreadNotifications(Long userId);

    int markAllAsRead(Long userId);

    int markAsRead(Long userId, Long notificationId);

    int deleteAllByUser(Long userId);

    void checkDailyStreakWarning(Long userId) throws InstanceNotFoundException;

    void notifyBadgeEarned(Users user, String badgeCode);
}
