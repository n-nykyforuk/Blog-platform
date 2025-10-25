package instagram.blog.DTO;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class PostDTO {

    private Long id;
    private String content;
    private String imageUrl;
    private LocalDateTime createdAt;
    private List<LikeDTO> likes;
    private List<CommentDTO> comments;

}
