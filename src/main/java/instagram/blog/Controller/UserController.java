package instagram.blog.Controller;

import instagram.blog.DTO.SimpleUserDTO;
import instagram.blog.DTO.UserProfileDTO;
import instagram.blog.Entity.User;
import instagram.blog.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/search")
    public ResponseEntity<List<User>> searchUsers(@RequestParam String username) {
        List<User> users = userService.findByNicknameContaining(username);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{username}/profile")
    public ResponseEntity<UserProfileDTO> getUserProfile(
            @PathVariable String username,
            @AuthenticationPrincipal UserDetails currentUser
    ) {
        String currentUsername = (currentUser != null) ? currentUser.getUsername() : null;
        UserProfileDTO profile = userService.getUserProfile(username, currentUsername);
        return ResponseEntity.ok(profile);
    }

    @PostMapping("/{username}/follow")
    public ResponseEntity<String> followUser(
            @PathVariable String username,
            @AuthenticationPrincipal UserDetails currentUser
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        userService.followUser(currentUser.getUsername(), username);
        return ResponseEntity.ok("Followed " + username);
    }

    @DeleteMapping("/{username}/unfollow")
    public ResponseEntity<String> unfollowUser(
            @PathVariable String username,
            @AuthenticationPrincipal UserDetails currentUser
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        userService.unfollowUser(currentUser.getUsername(), username);
        return ResponseEntity.ok("Unfollowed " + username);
    }

    @GetMapping("/{username}/followers")
    public ResponseEntity<List<SimpleUserDTO>> getFollowers(@PathVariable String username) {
        List<SimpleUserDTO> followers = userService.getFollowers(username);
        return ResponseEntity.ok(followers);
    }

    @GetMapping("/{username}/following")
    public ResponseEntity<List<SimpleUserDTO>> getFollowing(@PathVariable String username) {
        List<SimpleUserDTO> following = userService.getFollowing(username);
        return ResponseEntity.ok(following);
    }
}
