package instagram.blog.Controller;

import instagram.blog.DTO.MessageDTO;
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
    public ResponseEntity<MessageDTO> sendMessage(@PathVariable Long chatId, @RequestBody Map<String, String> body) {
        Message message = messageService.sendMessage(chatId, body.get("content"));

        MessageDTO dto = new MessageDTO();
        dto.setId(message.getId());
        dto.setContent(message.getContent());
        dto.setSenderUsername(message.getSender().getUsername());
        dto.setSenderAvatarUrl(message.getSender().getAvatarUrl());
        dto.setRead(message.isRead());

        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{chatId}")
    public ResponseEntity<List<MessageDTO>> getMessages(@PathVariable Long chatId) {
        List<Message> messages = messageService.getMessages(chatId);
        List<MessageDTO> dtos = messages.stream().map(m -> {
            MessageDTO dto = new MessageDTO();
            dto.setId(m.getId());
            dto.setContent(m.getContent());
            dto.setSenderUsername(m.getSender().getUsername());
            dto.setSenderAvatarUrl(m.getSender().getAvatarUrl());
            dto.setRead(m.isRead());
            return dto;
        }).toList();

        return ResponseEntity.ok(dtos);
    }

    @PutMapping("/{chatId}/read")
    public ResponseEntity<String> markAsRead(@PathVariable Long chatId) {
        messageService.markMessagesAsRead(chatId);
        return ResponseEntity.ok("Messages marked as read");
    }
}
