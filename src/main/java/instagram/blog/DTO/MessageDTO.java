package instagram.blog.DTO;

import lombok.Data;

@Data
public class MessageDTO {

    private Long id;
    private String content;
    private String senderUsername;
    private String senderAvatarUrl;
    private boolean read;
}
