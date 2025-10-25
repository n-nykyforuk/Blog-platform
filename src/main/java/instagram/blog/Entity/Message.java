package instagram.blog.Entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;

@Entity
@Data
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Chat chat;

    @ManyToOne
    private User sender;

    private String content;
    private Date timestamp = new Date();

    @Column(name = "is_read")
    private boolean read = false;
}
