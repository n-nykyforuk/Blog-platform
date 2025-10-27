package instagram.blog.Controller;

import instagram.blog.Entity.NotificationItem;
import instagram.blog.Service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService service;


    @GetMapping("/{userId}")
    public List<NotificationItem> getNotifications(@PathVariable String userId) {
        return service.getAllNotifications(userId);
    }

    @GetMapping("/{userId}/unreadCount")
    public long getUnreadCount(@PathVariable String userId) {
        return service.getUnreadCount(userId);
    }

    @PostMapping
    public NotificationItem addNotification(@RequestParam String userId,
                                            @RequestParam String fromUser,
                                            @RequestParam NotificationItem.Type type) {
        return service.addNotification(userId, fromUser, type);
    }

    @PostMapping("/{userId}/markAllRead")
    public void markAllAsRead(@PathVariable String userId) {
        service.markAllAsRead(userId);
    }
}
