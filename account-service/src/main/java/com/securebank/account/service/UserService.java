package com.securebank.account.service;

import com.securebank.account.dto.request.CreateUserRequest;
import com.securebank.account.dto.response.UserResponse;

import java.util.UUID;

public interface UserService {
    UserResponse createUser(CreateUserRequest request);
    UserResponse getUserById(UUID id);
    UserResponse getUserByEmail(String email);
}
