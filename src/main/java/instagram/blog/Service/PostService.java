package instagram.blog.Service;

import instagram.blog.DTO.CommentDTO;
import instagram.blog.DTO.CreatePostRequest;
import instagram.blog.Entity.*;
import instagram.blog.Repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.*;
import java.nio.file.*;
import java.util.List;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public PostService(PostRepository postRepository, UserRepository userRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    public Post createPost(CreatePostRequest request) throws IOException {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsernameOrEmail(username, username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = new Post();
        post.setUser(user);
        post.setContent(request.getContent());

        MultipartFile image = request.getImage();
        if (image != null && !image.isEmpty()) {
            String fileName = System.currentTimeMillis() + "_" + image.getOriginalFilename();

            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            Path filePath = uploadPath.resolve(fileName);
            image.transferTo(filePath.toFile());

            post.setImageUrl("/uploads/" + fileName);
        }

        System.out.println("Uploading post by user: " + username);
        System.out.println("Upload directory: " + uploadDir);
        System.out.println("File name: " + (image != null ? image.getOriginalFilename() : "No image"));


        return postRepository.save(post);
    }

    public List<CommentDTO> getCommentsByPostId(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        return post.getComments().stream().map(c -> {
            CommentDTO dto = new CommentDTO();
            dto.setId(c.getId());
            dto.setText(c.getText());
            dto.setUsername(c.getUser().getUsername());
            return dto;
        }).toList();
    }
}
