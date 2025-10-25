package instagram.blog.Controller;

import instagram.blog.DTO.CreatePostRequest;
import instagram.blog.Entity.Post;
import instagram.blog.Service.PostService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/create-post")
public class CreatePostController {

    private final PostService postService;

    public CreatePostController(PostService postService) {
        this.postService = postService;
    }

    @PostMapping
    public ResponseEntity<?> createPost(
            @RequestParam("content") String content,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) {
        CreatePostRequest request = new CreatePostRequest();
        request.setContent(content);
        request.setImage(image);

        try {
            Post post = postService.createPost(request);
            return ResponseEntity.ok(post);
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Failed to upload image");
        }
    }
}
