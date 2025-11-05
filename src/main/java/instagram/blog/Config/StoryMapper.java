package instagram.blog.Config;

import instagram.blog.DTO.StoryDto;
import instagram.blog.Entity.Story;
import org.springframework.stereotype.Component;

import java.time.ZoneId;

@Component
public class StoryMapper {

    public StoryDto toDto(Story story) {
        if (story == null) return null;

        StoryDto dto = new StoryDto();
        dto.setId(story.getId());
        dto.setMediaUrl(story.getMediaUrl());
        dto.setMediaType(story.getMediaType());

        if (story.getCreatedAt() != null) {
            dto.setCreatedAt(story.getCreatedAt()
                    .toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDateTime());
        }

        if (story.getUser() != null) {
            dto.setUsername(story.getUser().getUsername());
            dto.setAvatarUrl(story.getUser().getAvatarUrl());
        }

        return dto;
    }
}
