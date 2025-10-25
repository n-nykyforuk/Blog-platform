package instagram.blog.Repository;

import instagram.blog.Entity.Chat;
import instagram.blog.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRepository extends JpaRepository<Chat, Long> {
    Optional<Chat> findByUser1AndUser2(User user1, User user2);
    List<Chat> findByUser1OrUser2(User user1, User user2);
}
