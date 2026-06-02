package com.securebank.account.service.impl;

import com.securebank.account.dto.request.LoginRequest;
import com.securebank.account.dto.request.RegisterRequest;
import com.securebank.account.dto.response.AuthResponse;
import com.securebank.account.entity.User;
import com.securebank.account.exception.DuplicateResourceException;
import com.securebank.account.repository.UserRepository;
import com.securebank.account.security.JwtService;
import com.securebank.account.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository        userRepository;
    private final PasswordEncoder       passwordEncoder;
    private final JwtService            jwtService;
    private final AuthenticationManager authenticationManager;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Registering user: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail().toLowerCase())) {
            throw new DuplicateResourceException(
                "User with email '" + request.getEmail() + "' already exists");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .build();

        User saved = userRepository.save(user);
        log.info("User registered: {}", saved.getId());

        String token = jwtService.generateToken(saved.getEmail(), saved.getId());
        return buildResponse(token, saved);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt: {}", request.getEmail());

        // This throws BadCredentialsException if wrong — caught by GlobalExceptionHandler
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getEmail().toLowerCase(),
                request.getPassword()
            )
        );

        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtService.generateToken(user.getEmail(), user.getId());
        log.info("Login successful: {}", user.getId());
        return buildResponse(token, user);
    }

    private AuthResponse buildResponse(String token, User user) {
        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .expiresIn(jwtService.getExpirationMs())
                .build();
    }
}
