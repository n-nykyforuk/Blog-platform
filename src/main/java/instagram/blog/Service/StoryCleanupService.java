package instagram.blog.Service;

import instagram.blog.Entity.Story;
import instagram.blog.Repository.StoryRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;
import java.util.stream.Stream;

@Service
public class StoryCleanupService {

    private final StoryRepository storyRepository;
    private final StoryService storyService;

    @Value("${file.upload-dir}")
    private String uploadDir;


    public StoryCleanupService(StoryRepository storyRepository, StoryService storyService) {
        this.storyRepository = storyRepository;
        this.storyService = storyService;
    }

    @Scheduled(fixedRate = 3600000)
    public void deleteExpiredStories() {
        Instant cutoff = Instant.now().minus(24, ChronoUnit.HOURS);

        List<Story> expiredStories = storyRepository.findExpiredStories(Date.from(cutoff));
        for (Story story : expiredStories) {
            storyService.deleteStory(story.getId());
            System.out.println("🕒 Видалено сторіс " + story.getId() + " користувача " + story.getUser().getUsername());
        }

        Path storiesPath = Paths.get(uploadDir, "stories");

        if (Files.exists(storiesPath)) {
            try (Stream<Path> files = Files.list(storiesPath)) {
                files.forEach(file -> {
                    try {
                        Instant fileTime = Files.getLastModifiedTime(file).toInstant();

                        if (fileTime.isBefore(cutoff)) {
                            Files.deleteIfExists(file);
                            System.out.println("Deleted story: " + file.toAbsolutePath());
                        }
                    } catch (IOException e) {
                        System.err.println("Error deleting " + file + ": " + e.getMessage());
                    }
                });
            } catch (IOException e) {
                System.err.println("Can not read the file stories: " + e.getMessage());
            }
        }
    }
}
