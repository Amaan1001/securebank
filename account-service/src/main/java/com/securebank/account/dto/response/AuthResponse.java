package com.securebank.account.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class AuthResponse {
    private String token;
    private String tokenType;
    private UUID userId;
    private String fullName;
    private String email;
    private long expiresIn;      // milliseconds
}
