package instagram.blog.DTO;

import lombok.Data;

import java.util.Date;

@Data
public class ChatDTO {
    private Long id;
    private String user1Username;
    private String user2Username;
    private Date createdAt;
}
