package instagram.blog.Controller;

import instagram.blog.DTO.ChatDTO;
import instagram.blog.Entity.Chat;
import instagram.blog.Entity.User;
import instagram.blog.Repository.ChatRepository;
import instagram.blog.Service.ChatService;
import instagram.blog.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chats")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private UserService userService;

    @Autowired
    private ChatRepository chatRepository;

    @PostMapping("/start/{receiverUsername}")
    public ResponseEntity<ChatDTO> startChat(@PathVariable String receiverUsername) {
        Chat chat = chatService.getOrCreateChat(receiverUsername);

        ChatDTO dto = new ChatDTO();
        dto.setId(chat.getId());
        dto.setUser1Username(chat.getUser1().getUsername());
        dto.setUser2Username(chat.getUser2().getUsername());
        dto.setUser1AvatarUrl(chat.getUser1().getAvatarUrl()); // заповнюємо
        dto.setUser2AvatarUrl(chat.getUser2().getAvatarUrl());
        dto.setCreatedAt(chat.getCreatedAt());

        return ResponseEntity.ok(dto);
    }

    @GetMapping("/my")
    public ResponseEntity<List<ChatDTO>> getMyChats() {
        List<Chat> chats = chatService.getUserChats();

        List<ChatDTO> dtos = chats.stream().map(chat -> {
            ChatDTO dto = new ChatDTO();
            dto.setId(chat.getId());
            dto.setUser1Username(chat.getUser1().getUsername());
            dto.setUser2Username(chat.getUser2().getUsername());
            dto.setUser1AvatarUrl(chat.getUser1().getAvatarUrl()); // заповнюємо
            dto.setUser2AvatarUrl(chat.getUser2().getAvatarUrl());
            dto.setCreatedAt(chat.getCreatedAt());
            return dto;
        }).toList();

        return ResponseEntity.ok(dtos);
    }

    @DeleteMapping("/{chatId}")
    public ResponseEntity<String> deleteChat(@PathVariable Long chatId) {
        chatService.deleteChat(chatId);
        return ResponseEntity.ok("Chat deleted successfully");
    }


    @GetMapping("/{chatId}/partner")
    public ResponseEntity<String> getChatPartner(@PathVariable Long chatId) {
        User currentUser = userService.getCurrentUser();
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat not found"));

        String partnerUsername;
        if (chat.getUser1().getId().equals(currentUser.getId())) {
            partnerUsername = chat.getUser2().getUsername();
        } else {
            partnerUsername = chat.getUser1().getUsername();
        }

        return ResponseEntity.ok(partnerUsername);
    }

}
