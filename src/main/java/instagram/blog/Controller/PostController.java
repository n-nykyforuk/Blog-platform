package instagram.blog.Controller;

import instagram.blog.DTO.CommentDTO;
import instagram.blog.DTO.CommentRequest;
import instagram.blog.Entity.*;
import instagram.blog.Repository.*;
import instagram.blog.Service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private LikeService likeService;

    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private CommentService commentService;

    @Autowired
    private PostService postService;

    @GetMapping
    public ResponseEntity<List<Post>> getAllPosts() {
        List<Post> posts = postRepository.findAll();
        return ResponseEntity.ok(posts);
    }

    @PostMapping("/{postId}/like")
    public ResponseEntity<String> toggleLike(@PathVariable Long postId) {
        String message = likeService.toggleLike(postId);
        return ResponseEntity.ok(message);
    }

    @GetMapping("/{postId}/likes/count")
    public ResponseEntity<Long> getLikeCount(@PathVariable Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        long likeCount = likeRepository.countByPost(post);
        return ResponseEntity.ok(likeCount);
    }

    @PostMapping("/post/{postId}")
    public ResponseEntity<String> addComment(@PathVariable Long postId, @RequestBody CommentRequest request) {
        commentService.addComment(postId, request.getText());
        return ResponseEntity.ok("Comment added successfully!");
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<String> deleteComment(@PathVariable Long commentId) {
        commentService.deleteComment(commentId);
        return ResponseEntity.ok("Comment deleted successfully!");
    }

    @GetMapping("/{postId}/comments")
    public ResponseEntity<List<CommentDTO>> getPostComments(@PathVariable Long postId) {
        List<CommentDTO> comments = postService.getCommentsByPostId(postId);
        return ResponseEntity.ok(comments);
    }

    @GetMapping("/{postId}")
    public ResponseEntity<Post> getPostById(@PathVariable Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        return ResponseEntity.ok(post);
    }
}
