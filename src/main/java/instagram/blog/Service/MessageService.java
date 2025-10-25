package instagram.blog.Service;

import instagram.blog.Entity.Chat;
import instagram.blog.Entity.Message;
import instagram.blog.Entity.User;
import instagram.blog.Repository.ChatRepository;
import instagram.blog.Repository.MessageRepository;
import instagram.blog.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ChatRepository chatRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    public Message sendMessage(Long chatId, String content) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat not found"));
        User sender = userService.getCurrentUser();

        Message message = new Message();
        message.setChat(chat);
        message.setSender(sender);
        message.setContent(content);
        message.setRead(false);

        return messageRepository.save(message);
    }

    public void markMessagesAsRead(Long chatId) {
        User currentUser = userService.getCurrentUser();
        List<Message> messages = messageRepository.findByChatId(chatId);

        for (Message m : messages) {
            if (!m.getSender().getId().equals(currentUser.getId()) && !m.isRead()) {
                m.setRead(true);
            }
        }

        messageRepository.saveAll(messages);
    }

    public List<Message> getMessages(Long chatId) {

        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat not found"));

        User currentUser = userService.getCurrentUser();

        List<Message> messages = messageRepository.findByChatId(chatId);
        for (Message m : messages) {
            if (!m.getSender().getId().equals(currentUser.getId()) && !m.isRead()) {
                m.setRead(true);
            }
        }
        messageRepository.saveAll(messages);

        return messages;
    }
}
