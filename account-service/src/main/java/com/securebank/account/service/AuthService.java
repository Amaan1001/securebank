package com.securebank.account.service;

import com.securebank.account.dto.request.LoginRequest;
import com.securebank.account.dto.request.RegisterRequest;
import com.securebank.account.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}
