package instagram.blog.Service;

import instagram.blog.Entity.Story;
import instagram.blog.Entity.User;
import instagram.blog.Repository.StoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;

@Service
public class StoryService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Autowired
    private StoryRepository storyRepository;

    @Autowired
    private UserService userService;

    public Story createStory(MultipartFile file, Integer durationInSeconds) {
        User currentUser = userService.getCurrentUser();

        try {
            // Створюємо папку stories, якщо не існує
            Path uploadPath = Paths.get(uploadDir, "stories");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Генеруємо ім'я файлу
            String originalName = file.getOriginalFilename();
            String fileName = currentUser.getUsername() + "_" + System.currentTimeMillis() + "_" + originalName;
            Path filePath = uploadPath.resolve(fileName);

            // Копіюємо файл
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Створюємо Story
            Story story = new Story();
            story.setUser(currentUser);
            story.setMediaUrl("/uploads/stories/" + fileName);
            story.setDuration(durationInSeconds != null ? durationInSeconds : 0);
            story.setCreatedAt(new Date());


            // Визначаємо тип медіа
            String contentType = file.getContentType();
            if (contentType != null && contentType.startsWith("video/")) {
                story.setMediaType("video");
            } else {
                story.setMediaType("image");
            }

            // Зберігаємо в БД
            return storyRepository.save(story);

        } catch (IOException e) {
            throw new RuntimeException("Failed to upload story", e);
        }
    }

    public List<Story> getUserStories(String username) {
        User user = userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return storyRepository.findByUserOrderByCreatedAtDesc(user);
    }

    @Transactional
    public void deleteStory(Long storyId) {
        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new RuntimeException("Story not found"));

        try {
            // Правильне видалення файлу
            String fileName = Paths.get(story.getMediaUrl()).getFileName().toString();
            Path filePath = Paths.get(uploadDir, "stories", fileName);
            Files.deleteIfExists(filePath);
            System.out.println("Видалено файл: " + filePath.toAbsolutePath());
        } catch (IOException e) {
            e.printStackTrace();
        }

        storyRepository.delete(story);
    }

    public Story findById(Long storyId) {
        return storyRepository.findById(storyId)
                .orElseThrow(() -> new RuntimeException("Story not found: " + storyId));
    }

    public List<Story> getStoriesForUsers(List<User> users) {
        if (users == null || users.isEmpty()) return List.of();

        Date cutoff = Date.from(
                LocalDateTime.now().minusHours(24)
                        .atZone(ZoneId.systemDefault())
                        .toInstant()
        );

        return storyRepository.findActiveStoriesForUsers(users, cutoff);
    }
}