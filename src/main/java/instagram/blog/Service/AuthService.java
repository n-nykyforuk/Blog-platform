package instagram.blog.Service;

import instagram.blog.DTO.LoginRequest;
import instagram.blog.DTO.LoginResponse;
import instagram.blog.DTO.RegisterRequest;
import instagram.blog.Entity.User;
import instagram.blog.Repository.UserRepository;
import instagram.blog.Security.JWT.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtService jwtService;
    @Autowired
    private AuthenticationManager authenticationManager;

    public String register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username is already taken!");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already in use!");
        }

        System.out.println("Received: " + request.getUsername() + ", " + request.getEmail() + ", " + request.getPassword());

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);

        return "User registered successfully!";
    }

    public LoginResponse login(LoginRequest request) {
        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(
                        request.getUsernameOrEmail(),
                        request.getPassword()
                );

        Authentication authentication = authenticationManager.authenticate(authToken);

        String username = authentication.getName();
        String token = jwtService.generateToken(username);

        return new LoginResponse(token, username); // 👈 повертаємо тільки token і username, без id
    }

}
