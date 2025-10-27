package instagram.blog.Repository;

import instagram.blog.Entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<NotificationItem, Long> {
    List<NotificationItem> findByUserIdOrderByTimestampDesc(String userId);
    long countByUserIdAndReadFalse(String userId);
}
