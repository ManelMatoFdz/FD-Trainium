package es.udc.fi.dc.fd.model.entities;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationDao extends JpaRepository<Notification, Long> {

    // Listar por usuario (más recientes primero)
    List<Notification> findByUser_IdOrderByCreatedAtDesc(Long userId);

    // Contar no leídas
    long countByUser_IdAndReadFalse(Long userId);

    // Marcar todas como leídas de un usuario
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Notification n SET n.read = true WHERE n.user.id = :userId AND n.read = false")
    int markAllAsRead(@Param("userId") Long userId);

    // Marcar una notificación individual como leída
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Notification n SET n.read = true WHERE n.id = :notificationId AND n.user.id = :userId AND n.read = false")
    int markAsRead(@Param("userId") Long userId, @Param("notificationId") Long notificationId);

    // Borrar todas las notificaciones de un usuario (opcional)
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM Notification n WHERE n.user.id = :userId")
    int deleteAllByUserId(@Param("userId") Long userId);

    boolean existsByUser_IdAndMessageContaining(Long userId, String messagePart);
}