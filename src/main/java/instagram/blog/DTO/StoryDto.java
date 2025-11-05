package instagram.blog.DTO;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StoryDto {

    private Long id;
    private String mediaUrl;
    private String mediaType;
    private LocalDateTime createdAt;
    private String username;
    private String avatarUrl;
}
