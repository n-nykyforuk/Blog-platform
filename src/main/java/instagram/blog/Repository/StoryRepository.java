package instagram.blog.Repository;

import instagram.blog.Entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface StoryRepository extends JpaRepository<Story, Long> {
    List<Story> findByUserOrderByCreatedAtDesc(User user);
    void deleteByUser(User user);

    @Query("SELECT s FROM Story s WHERE s.createdAt < :cutoff")
    List<Story> findExpiredStories(@Param("cutoff") Date cutoff);
    List<Story> findByUserIn(List<User> users);
    List<Story> findByUserUsername(String username);

    @Query("SELECT s FROM Story s WHERE s.user IN :users AND s.createdAt >= :cutoff ORDER BY s.createdAt DESC")
    List<Story> findActiveStoriesForUsers(@Param("users") List<User> users, @Param("cutoff") Date cutoff);

}
