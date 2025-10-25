package instagram.blog.Service;

import instagram.blog.Entity.Chat;
import instagram.blog.Entity.User;
import instagram.blog.Repository.ChatRepository;
import instagram.blog.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChatService {

    @Autowired
    private ChatRepository chatRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    public Chat getOrCreateChat(String otherUsername) {
        User currentUser = userService.getCurrentUser();
        User otherUser = userRepository.findByUsername(otherUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return chatRepository.findByUser1AndUser2(currentUser, otherUser)
                .or(() -> chatRepository.findByUser1AndUser2(otherUser, currentUser))
                .orElseGet(() -> {
                    Chat chat = new Chat();
                    chat.setUser1(currentUser);
                    chat.setUser2(otherUser);
                    return chatRepository.save(chat);
                });
    }

    public List<Chat> getUserChats() {
        User currentUser = userService.getCurrentUser();
        return chatRepository.findByUser1OrUser2(currentUser, currentUser);
    }
}

