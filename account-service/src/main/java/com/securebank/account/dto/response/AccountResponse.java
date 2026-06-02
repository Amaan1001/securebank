package com.securebank.account.dto.response;

import com.securebank.account.entity.Account;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class AccountResponse {
    private UUID id;
    private String accountNumber;
    private UUID userId;
    private String ownerName;
    private Account.AccountType accountType;
    private Account.AccountStatus status;
    private BigDecimal balance;
    private String currency;
    private LocalDateTime createdAt;
}
