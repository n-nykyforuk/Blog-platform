package instagram.blog.Entity;

import jakarta.persistence.*;
import jakarta.persistence.GenerationType;
import lombok.Data;

import java.lang.reflect.Type;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
public class NotificationItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userId;
    private String fromUser;

    @Enumerated(EnumType.STRING)
    private Type type;

    private boolean read = false;
    private LocalDateTime timestamp = LocalDateTime.now();

    public enum Type {
        LIKE, COMMENT, MESSAGE, FOLLOW
    }

    public NotificationItem(String userId, String fromUser, Type type) {
        this.userId = userId;
        this.fromUser = fromUser;
        this.type = type;
    }
}
