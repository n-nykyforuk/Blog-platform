package instagram.blog.Controller;

import instagram.blog.Entity.Chat;
import instagram.blog.Service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chats")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @PostMapping("/start/{receiverUsername}")
    public ResponseEntity<Chat> startChat(@PathVariable String receiverUsername) {
        Chat chat = chatService.getOrCreateChat(receiverUsername);
        return ResponseEntity.ok(chat);
    }

    @GetMapping
    public ResponseEntity<List<Chat>> getUserChats() {
        List<Chat> chats = chatService.getUserChats();
        return ResponseEntity.ok(chats);
    }
}
