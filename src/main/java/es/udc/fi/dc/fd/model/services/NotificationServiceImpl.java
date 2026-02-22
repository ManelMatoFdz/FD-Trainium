package es.udc.fi.dc.fd.model.services;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Notification;
import es.udc.fi.dc.fd.model.entities.NotificationDao;
import es.udc.fi.dc.fd.model.entities.RoutineExecution;
import es.udc.fi.dc.fd.model.entities.RoutineExecutionDao;
import es.udc.fi.dc.fd.model.entities.Users;

@Service
@Transactional
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private NotificationDao notificationDao;

    @Autowired
    private RoutineExecutionDao routineExecutionDao;

    @Autowired
    private PermissionChecker permissionChecker;

    @Autowired
    private MessageSource messageSource;

    @Autowired
    private Clock clock;

    @Override
    public List<Notification> getUserNotifications(Long userId) {
        return notificationDao.findByUser_IdOrderByCreatedAtDesc(userId);
    }

    @Override
    public long countUnreadNotifications(Long userId) {
        return notificationDao.countByUser_IdAndReadFalse(userId);
    }

    @Transactional
    @Override
    public int markAllAsRead(Long userId) {
        return notificationDao.markAllAsRead(userId);
    }

    @Transactional
    @Override
    public int markAsRead(Long userId, Long notificationId) {
        return notificationDao.markAsRead(userId, notificationId);
    }

    @Transactional
    @Override
    public int deleteAllByUser(Long userId) {
        return notificationDao.deleteAllByUserId(userId);
    }

    @Override
    public void checkDailyStreakWarning(Long userId) throws InstanceNotFoundException {
        Users user = permissionChecker.checkUser(userId);

        //Notifica solo a partir de las 16:00
        LocalTime limit = LocalTime.of(16, 0);
        LocalTime now = LocalTime.now(clock);
        if (now.isBefore(limit)) {
            return;
        }

        List<RoutineExecution> executions = routineExecutionDao.findAllByUserOrdered(userId);
        if (executions.isEmpty()) return;

        LocalDate today = LocalDate.now(clock);
        LocalDate yesterday = today.minusDays(1);

        RoutineExecution lastExecution = executions.get(0);
        LocalDate lastDate = lastExecution.getPerformedAt().toLocalDate();

        if (lastDate.isEqual(today)) return;

        if (!lastDate.isEqual(yesterday)) return;

        int streak = 1;
        LocalDate expectedDay = yesterday.minusDays(1);
        for (int i = 1; i < executions.size(); i++) {
            LocalDate d = executions.get(i).getPerformedAt().toLocalDate();
            if (!d.isEqual(expectedDay)) break;
            streak++;
            expectedDay = expectedDay.minusDays(1);
        }

        var locale = LocaleContextHolder.getLocale();
        String title = messageSource.getMessage("notification.streak.title", null, locale);
        String message = messageSource.getMessage(
                "notification.streak.message",
                new Object[]{streak},
                locale
        );

        notificationDao.save(new Notification(user, title, message));
    }

    @Override
    public void notifyBadgeEarned(Users user, String badgeCode) {

        var locale = LocaleContextHolder.getLocale();

        String readableName = badgeCode == null ? "" : badgeCode.replace("_", " ").replaceAll("\\s+", " ").trim();

        String title = messageSource.getMessage(
            "notification.badge.title",
            null,
            locale
        );

        String message = messageSource.getMessage(
            "notification.badge.message",
            new Object[]{ readableName },
            locale
        );

        // Garantiza que el texto legible del badge aparezca aunque el bundle no tenga el placeholder
        if (!readableName.isBlank() && !message.contains(readableName)) {
            message = message + " " + readableName;
        }

        notificationDao.save(new Notification(user, title, message));
    }

}