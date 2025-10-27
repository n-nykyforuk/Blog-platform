package instagram.blog.Service;

import instagram.blog.Entity.Chat;
import instagram.blog.Entity.Message;
import instagram.blog.Entity.User;
import instagram.blog.Repository.ChatRepository;
import instagram.blog.Repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ChatRepository chatRepository;

    @Autowired
    private UserService userService;

    /**
     * Відправка повідомлення в чат
     */
    public Message sendMessage(Long chatId, String content) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat not found"));
        User sender = userService.getCurrentUser();

        Message message = new Message();
        message.setChat(chat);
        message.setSender(sender);
        message.setContent(content);
        message.setRead(false); // спочатку не прочитано

        return messageRepository.save(message);
    }

    /**
     * Отримання всіх повідомлень чату.
     * Автоматично відмічає повідомлення іншого користувача як прочитані.
     */
    @Transactional
    public List<Message> getMessages(Long chatId) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat not found"));

        User currentUser = userService.getCurrentUser();

        List<Message> messages = messageRepository.findByChatId(chatId);

        // Відмічаємо як прочитані всі повідомлення іншого користувача
        for (Message m : messages) {
            if (!m.getSender().getId().equals(currentUser.getId()) && !m.isRead()) {
                m.setRead(true);
            }
        }

        // @Transactional автоматично збережуть зміни, saveAll не потрібен
        return messages;
    }

    /**
     * Ручне маркування всіх повідомлень як прочитаних (для фронту)
     */
    @Transactional
    public void markMessagesAsRead(Long chatId) {
        User currentUser = userService.getCurrentUser();
        List<Message> messages = messageRepository.findByChatId(chatId);

        for (Message m : messages) {
            if (!m.getSender().getId().equals(currentUser.getId()) && !m.isRead()) {
                m.setRead(true);
            }
        }
    }
}
