package es.udc.fi.dc.fd.rest.controllers;

import es.udc.fi.dc.fd.model.services.NotificationService;
import es.udc.fi.dc.fd.rest.dtos.NotificationConversor;
import es.udc.fi.dc.fd.rest.dtos.NotificationDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users/{userId}/notifications")
public class NotificationController {

    @Autowired
    private NotificationService service;

    @GetMapping
    public List<NotificationDto> list(@PathVariable Long userId) {
        return service.getUserNotifications(userId)
                .stream()
                .map(NotificationConversor::toDto)
                .toList();
    }

    @GetMapping("/unread/count")
    public long unreadCount(@PathVariable Long userId) {
        return service.countUnreadNotifications(userId);
    }

    @PostMapping("/mark-all-read")
    public int markAllAsRead(@PathVariable Long userId) {
        return service.markAllAsRead(userId);
    }

    @PostMapping("/{notificationId}/mark-read")
    public int markAsRead(@PathVariable Long userId, @PathVariable Long notificationId) {
        return service.markAsRead(userId, notificationId);
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAll(@PathVariable Long userId) {
        service.deleteAllByUser(userId);
    }

}
