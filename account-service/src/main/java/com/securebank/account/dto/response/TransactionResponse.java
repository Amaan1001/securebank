package com.securebank.account.dto.response;

import com.securebank.account.entity.Transaction;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class TransactionResponse {
    private UUID id;
    private String referenceNumber;
    private UUID accountId;
    private Transaction.TransactionType type;
    private BigDecimal amount;
    private BigDecimal balanceAfter;
    private String description;
    private String relatedAccountNumber;
    private Transaction.TransactionStatus status;
    private LocalDateTime createdAt;
}
