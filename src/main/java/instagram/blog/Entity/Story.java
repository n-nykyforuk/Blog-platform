package instagram.blog.Entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.Date;

@Entity
@Data
public class Story {

    public static final int MAX_VIDEO_DURATION = 30;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User user;

    private String mediaUrl;
    private Integer duration;
    private Date createdAt = new Date();
    private Boolean active = true;

    @Column
    private String mediaType;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = new Date();
    }
}
