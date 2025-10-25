package instagram.blog.DTO;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank
    private String username;
    @NotBlank
    private String email;
    @NotBlank
    @Pattern(
            regexp = "^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\\-]).{8,}$",
            message = "Password must be at least 8 characters long, contain one uppercase letter, one digit, and one special character"
    )
    private String password;
}
