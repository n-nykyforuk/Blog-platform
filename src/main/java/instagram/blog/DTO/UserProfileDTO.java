package instagram.blog.DTO;

import lombok.Data;
import java.util.List;

@Data
public class UserProfileDTO {

    private Long id;
    private String username;
    private String avatarUrl;
    private int postsCount;
    private int followersCount;
    private int followingCount;
    private boolean following;
    private boolean isFollowedByCurrentUser;
    private boolean mutualFollow;
    private List<PostDTO> posts;
    public boolean isFollowedByCurrentUser() {
        return isFollowedByCurrentUser;
    }

    public void setIsFollowedByCurrentUser(boolean followedByCurrentUser) {
        this.isFollowedByCurrentUser = followedByCurrentUser;
    }
}
