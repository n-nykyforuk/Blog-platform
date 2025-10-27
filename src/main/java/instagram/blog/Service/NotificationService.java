package instagram.blog.Service;

import instagram.blog.Entity.NotificationItem;
import instagram.blog.Repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository repository;

    public NotificationService(NotificationRepository repository) {
        this.repository = repository;
    }

    public NotificationItem addNotification(String userId, String fromUser, NotificationItem.Type type) {
        NotificationItem item = new NotificationItem(userId, fromUser, type);
        return repository.save(item);
    }

    public List<NotificationItem> getAllNotifications(String userId) {
        return repository.findByUserIdOrderByTimestampDesc(userId);
    }

    public long getUnreadCount(String userId) {
        return repository.countByUserIdAndReadFalse(userId);
    }

    public void markAllAsRead(String userId) {
        List<NotificationItem> notifications = repository.findByUserIdOrderByTimestampDesc(userId);
        notifications.forEach(n -> n.setRead(true));
        repository.saveAll(notifications);
    }
}
