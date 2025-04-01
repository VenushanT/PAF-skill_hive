package com.example.demo.service;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public Map<String, String> register(User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists!");
        }
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists!");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        // Default role if not provided
        if (user.getRole() == null) {
            user.setRole(User.Role.USER);
        }
        userRepository.save(user);
        return Map.of("message", "User registered successfully");
    }

    public Map<String, String> login(User user) {
        String loginIdentifier = user.getEmail() != null && !user.getEmail().isEmpty() 
            ? user.getEmail() 
            : user.getUsername();
        
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(loginIdentifier, user.getPassword())
        );
        
        // Fetch the user to get the role for the token
        User dbUser = userRepository.findByEmail(loginIdentifier)
            .orElseGet(() -> userRepository.findByUsername(loginIdentifier)
                .orElseThrow(() -> new RuntimeException("User not found")));
        
        String token = jwtUtil.generateToken(dbUser.getUsername(), Map.of("role", dbUser.getRole().name()));
        return Map.of("token", token);
    }
}