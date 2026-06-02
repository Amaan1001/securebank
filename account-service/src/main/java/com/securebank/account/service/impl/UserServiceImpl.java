package com.securebank.account.service.impl;

import com.securebank.account.dto.request.CreateUserRequest;
import com.securebank.account.dto.response.UserResponse;
import com.securebank.account.entity.User;
import com.securebank.account.exception.DuplicateResourceException;
import com.securebank.account.exception.ResourceNotFoundException;
import com.securebank.account.repository.UserRepository;
import com.securebank.account.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        log.info("Creating user: {}", request.getEmail());
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("User with email '" + request.getEmail() + "' already exists");
        }
        User saved = userRepository.save(User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail().toLowerCase())
                .phone(request.getPhone())
                .build());
        log.info("User created: {}", saved.getId());
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(UUID id) {
        return toResponse(userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id)));
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserByEmail(String email) {
        return toResponse(userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email)));
    }

    private UserResponse toResponse(User u) {
        return UserResponse.builder()
                .id(u.getId()).fullName(u.getFullName())
                .email(u.getEmail()).phone(u.getPhone())
                .createdAt(u.getCreatedAt()).build();
    }
}
