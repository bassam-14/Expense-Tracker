package com.expensetracker.backend.security;


import com.expensetracker.backend.user.User;
import com.expensetracker.backend.user.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping ("/api/auth")
public class AuthController {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder,
                          JwtService jwtService, AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginDto request){
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        String jwtToken = jwtService.generateToken(request.email());
        return ResponseEntity.ok(new AuthResponse(jwtToken));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterDto request){
        if (userRepository.existsByEmail(request.email())){
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already taken!"));
        }
        if (userRepository.existsByUsername(request.username())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));
        }
        User newUser = User.create(
                request.username(),
                request.email(),
                passwordEncoder.encode(request.password())
        );
        userRepository.save(newUser);
        String jwt = jwtService.generateToken(newUser.email());
        return ResponseEntity.ok(new AuthResponse(jwt));
    }
}
