package instagram.blog.Service;

import instagram.blog.DTO.*;
import instagram.blog.Entity.Follow;
import instagram.blog.Entity.User;
import instagram.blog.Repository.FollowRepository;
import instagram.blog.Repository.UserRepository;
import instagram.blog.Security.JWT.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class    UserService {

    private final UserRepository userRepository;
    private final FollowRepository followRepository;
    private final JwtService jwtService;

    @Autowired
    private HttpServletRequest request;

    public UserService(UserRepository userRepository, FollowRepository followRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.followRepository = followRepository;
        this.jwtService = jwtService;
    }

    public List<User> findByNicknameContaining(String username) {
        return userRepository.findByUsernameContainingIgnoreCase(username);
    }

    @Transactional
    public UserProfileDTO getUserProfile(String username, String currentUsername) {
        User user = userRepository.findByUsernameOrEmail(username, username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserProfileDTO dto = new UserProfileDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setAvatarUrl(user.getAvatarUrl());
        dto.setPostsCount(user.getPosts().size());
        dto.setFollowersCount(user.getFollowers().size());
        dto.setFollowingCount(user.getFollowing().size());

        if (currentUsername != null) {
            User currentUser = userRepository.findByUsername(currentUsername)
                    .orElse(null);
            if (currentUser != null) {
                boolean isFollowing = followRepository.existsByFollowerAndFollowed(currentUser, user);
                boolean isFollowedBy = followRepository.existsByFollowerAndFollowed(user, currentUser);

                dto.setFollowing(isFollowing);
                dto.setIsFollowedByCurrentUser(isFollowedBy);
                dto.setMutualFollow(isFollowing && isFollowedBy);

            }
        }

        List<PostDTO> posts = user.getPosts().stream().map(post -> {
            PostDTO p = new PostDTO();
            p.setId(post.getId());
            p.setContent(post.getContent());
            p.setImageUrl(post.getImageUrl());
            p.setCreatedAt(post.getCreatedAt());

            List<CommentDTO> commentDTOs = post.getComments().stream().map(c -> {
                CommentDTO cdto = new CommentDTO();
                cdto.setId(c.getId());
                cdto.setText(c.getText());
                cdto.setUsername(c.getUser().getUsername());
                return cdto;
            }).toList();
            p.setComments(commentDTOs);

            List<LikeDTO> likeDTOs = post.getLikes().stream().map(l -> {
                LikeDTO ldto = new LikeDTO();
                ldto.setId(l.getId());
                ldto.setUsername(l.getUser().getUsername());
                return ldto;
            }).toList();
            p.setLikes(likeDTOs);

            return p;
        }).toList();

        dto.setPosts(posts);
        return dto;
    }

    public void followUser(String followerUsername, String followedUsername) {
        if (followerUsername.equals(followedUsername))
            throw new RuntimeException("You cannot follow yourself");

        User follower = userRepository.findByUsername(followerUsername)
                .orElseThrow(() -> new RuntimeException("Follower not found"));
        User followed = userRepository.findByUsername(followedUsername)
                .orElseThrow(() -> new RuntimeException("User to follow not found"));

        boolean alreadyFollowing = followRepository.existsByFollowerAndFollowed(follower, followed);
        if (alreadyFollowing)
            throw new RuntimeException("Already following this user");

        Follow follow = new Follow();
        follow.setFollower(follower);
        follow.setFollowed(followed);
        followRepository.save(follow);
    }

    public void unfollowUser(String followerUsername, String followedUsername) {
        User follower = userRepository.findByUsername(followerUsername)
                .orElseThrow(() -> new RuntimeException("Follower not found"));
        User followed = userRepository.findByUsername(followedUsername)
                .orElseThrow(() -> new RuntimeException("User to unfollow not found"));

        Follow follow = followRepository.findByFollowerAndFollowed(follower, followed)
                .orElseThrow(() -> new RuntimeException("Follow relation not found"));

        followRepository.delete(follow);
    }

    public List<SimpleUserDTO> getFollowers(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return user.getFollowers().stream()
                .map(f -> {
                    SimpleUserDTO dto = new SimpleUserDTO();
                    dto.setId(f.getFollower().getId());
                    dto.setUsername(f.getFollower().getUsername());
                    dto.setAvatarUrl(f.getFollower().getAvatarUrl());
                    return dto;
                }).collect(Collectors.toList());
    }

    public List<SimpleUserDTO> getFollowing(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return user.getFollowing().stream()
                .map(f -> {
                    SimpleUserDTO dto = new SimpleUserDTO();
                    dto.setId(f.getFollowed().getId());
                    dto.setUsername(f.getFollowed().getUsername());
                    dto.setAvatarUrl(f.getFollowed().getAvatarUrl());
                    return dto;
                }).collect(Collectors.toList());
    }

    public User getCurrentUser() {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7);

        String username = jwtService.extractUsername(token);
        if (username == null) {
            throw new RuntimeException("Invalid token: username not found");
        }

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
