package instagram.blog.Service;

import instagram.blog.Entity.Chat;
import instagram.blog.Entity.Message;
import instagram.blog.Entity.NotificationItem;
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

    @Autowired
    private NotificationService notificationService; //  додаємо NotificationService

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

        Message saved = messageRepository.save(message);

        // ✅ створюємо сповіщення для іншого учасника чату
        User receiver = chat.getUser1().getId().equals(sender.getId())
                ? chat.getUser2()
                : chat.getUser1();

        if (!receiver.getId().equals(sender.getId())) {
            notificationService.addNotification(
                    receiver.getId().toString(),      // кому
                    sender.getUsername(),            // від кого
                    NotificationItem.Type.MESSAGE    // тип сповіщення
            );
        }

        return saved;
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
