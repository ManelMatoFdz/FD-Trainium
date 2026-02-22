package es.udc.fi.dc.fd.model.events;

import es.udc.fi.dc.fd.model.entities.Users;
import org.springframework.context.ApplicationEvent;

import java.util.List;

public class BadgesEarnedEvent extends ApplicationEvent {

    private final Users user;
    private final List<String> badges;

    public BadgesEarnedEvent(Object source, Users user, List<String> badges) {
        super(source);
        this.user = user;
        this.badges = badges;
    }

    public Users getUser() {
        return user;
    }

    public List<String> getBadges() {
        return badges;
    }
}
