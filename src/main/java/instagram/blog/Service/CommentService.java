package instagram.blog.Service;

import instagram.blog.Entity.*;
import instagram.blog.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService; // ✅ додаємо NotificationService

    public void addComment(Long postId, String text) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsernameOrEmail(username, username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        Comment comment = new Comment();
        comment.setText(text);
        comment.setUser(user);
        comment.setPost(post);

        commentRepository.save(comment);

        User postOwner = post.getUser();
        if (!postOwner.getId().equals(user.getId())) {
            notificationService.addNotification(
                    postOwner.getId().toString(),
                    user.getUsername(),
                    NotificationItem.Type.COMMENT
            );
        }
    }

    public void deleteComment(Long commentId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsernameOrEmail(username, username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getUser().getId().equals(currentUser.getId()) &&
                !comment.getPost().getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You are not allowed to delete this comment!");
        }

        commentRepository.delete(comment);
    }
}
