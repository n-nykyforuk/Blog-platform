package instagram.blog.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {

    private String username;
    private String token;
    private String type = "Bearer";

    public LoginResponse(String token, String username) {
        this.token = token;
        this.username = username;
    }
}
