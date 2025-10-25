package instagram.blog.DTO;

import lombok.Data;

@Data
public class CommentDTO {

    private Long id;
    private String text;
    private String username;
}
