package instagram.blog.Controller;

import instagram.blog.Config.StoryMapper;
import instagram.blog.DTO.StoryDto;
import instagram.blog.Entity.Story;
import instagram.blog.Entity.User;
import instagram.blog.Repository.StoryRepository;
import instagram.blog.Security.JWT.JwtService;
import instagram.blog.Service.StoryService;
import instagram.blog.Service.UserService;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@RestController
@RequestMapping("/api/stories")
@RequiredArgsConstructor
public class StoryController {

    private final StoryService storyService;
    @Autowired
    private final StoryRepository storyRepository;
    @Autowired
    private final UserService userService;

    @Autowired
    private final StoryMapper storyMapper;

    private final JwtService jwtService;

    @PostMapping("/")
    public ResponseEntity<Story> uploadStory(
            @RequestParam("file") @NotNull MultipartFile file,
            @RequestParam(value = "duration", required = false) Integer duration
    ) {
        Story story = storyService.createStory(file, duration);
        return ResponseEntity.ok(story);
    }

    @DeleteMapping("/{storyId}")
    public ResponseEntity<Void> deleteStory(@PathVariable Long storyId) {
        storyService.deleteStory(storyId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{username}")
    public ResponseEntity<List<Story>> getUserStories(@PathVariable String username) {
        List<Story> stories = storyService.getUserStories(username);
        return ResponseEntity.ok(stories);
    }

    @GetMapping("/following")
    public ResponseEntity<List<StoryDto>> getFollowingStories(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        User user = userService.findByUsername(jwtService.extractUsername(token))
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<User> following = userService.getFollowingUsers(user);
        following.add(user);
        List<Story> stories = storyService.getStoriesForUsers(following);
        List<StoryDto> activeStories = stories.stream()
                .filter(s -> Duration.between(
                        s.getCreatedAt().toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime(),
                        LocalDateTime.now()
                ).toHours() < 24)
                .map(storyMapper::toDto)
                .toList();
        return ResponseEntity.ok(activeStories);
    }

}
