package instagram.blog.Controller;

import instagram.blog.Entity.Message;
import instagram.blog.Service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @PostMapping("/{chatId}")
    public ResponseEntity<Message> sendMessage(@PathVariable Long chatId, @RequestBody Map<String, String> body) {
        Message message = messageService.sendMessage(chatId, body.get("content"));
        return ResponseEntity.ok(message);
    }

    @GetMapping("/{chatId}")
    public ResponseEntity<List<Message>> getMessages(@PathVariable Long chatId) {
        List<Message> messages = messageService.getMessages(chatId);
        return ResponseEntity.ok(messages);
    }

    @PutMapping("/{chatId}/read")
    public ResponseEntity<String> markAsRead(@PathVariable Long chatId) {
        messageService.markMessagesAsRead(chatId);
        return ResponseEntity.ok("Messages marked as read");
    }
}
