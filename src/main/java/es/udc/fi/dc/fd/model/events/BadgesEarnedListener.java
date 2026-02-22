package es.udc.fi.dc.fd.model.events;

import es.udc.fi.dc.fd.model.entities.NotificationDao;
import es.udc.fi.dc.fd.model.entities.Users;
import es.udc.fi.dc.fd.model.services.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

@Component
public class BadgesEarnedListener implements ApplicationListener<BadgesEarnedEvent> {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private NotificationDao notificationDao;

    @Override
    public void onApplicationEvent(BadgesEarnedEvent event) {

        Users user = event.getUser();

        for (String badgeCode : event.getBadges()) {
            boolean alreadySent = notificationDao.existsByUser_IdAndMessageContaining(user.getId(), badgeCode);

            if (!alreadySent) {
                notificationService.notifyBadgeEarned(event.getUser(), badgeCode);
            }
        }
    }
}
