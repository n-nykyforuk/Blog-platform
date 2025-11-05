package instagram.blog.Entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class NotificationItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fromUser;

    @Column(name = "is_read", nullable = false)
    private boolean read;

    @Column(name = "created_at")
    private LocalDateTime timestamp;

    @Enumerated(EnumType.STRING)
    private Type type; // звичайний enum

    private String userId;

    public NotificationItem() {

    }

    @PrePersist
    public void prePersist() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }

    public enum Type {
        COMMENT,
        FOLLOW,
        LIKE,
        MESSAGE
    }

    public NotificationItem(String userId, String fromUser, Type type) {
        this.userId = userId;
        this.fromUser = fromUser;
        this.type = type;
        this.read = false; // за замовчуванням непрочитане
        this.timestamp = LocalDateTime.now();
    }
}
