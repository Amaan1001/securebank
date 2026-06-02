package com.securebank.account.dto.request;

import com.securebank.account.entity.Account;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateAccountRequest {
    @NotNull(message = "User ID is required")
    private UUID userId;

    @NotNull(message = "Account type is required")
    private Account.AccountType accountType;
}
