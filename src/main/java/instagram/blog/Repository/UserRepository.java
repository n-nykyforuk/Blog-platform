package instagram.blog.Repository;

import instagram.blog.Entity.*;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsernameOrEmail(String username, String email);
    Boolean existsByUsername(@NotBlank String username);
    Boolean existsByEmail(String email);
    List<User> findByUsernameContainingIgnoreCase(String username);
    Optional<User> findByUsername(String username);
}
