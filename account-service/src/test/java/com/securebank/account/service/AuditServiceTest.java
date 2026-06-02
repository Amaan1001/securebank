package com.securebank.account.service;

import com.securebank.account.entity.Account;
import com.securebank.account.entity.AuditLog;
import com.securebank.account.entity.Transaction;
import com.securebank.account.entity.User;
import com.securebank.account.repository.AuditLogRepository;
import com.securebank.account.service.impl.AuditServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuditServiceTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private AuditServiceImpl auditService;

    private Account account;
    private Transaction transaction;

    @BeforeEach
    void setUp() {
        User user = User.builder()
                .id(UUID.randomUUID()).fullName("Test User").email("test@test.com")
                .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build();

        account = Account.builder()
                .id(UUID.randomUUID()).accountNumber("SB0000000001")
                .user(user).accountType(Account.AccountType.CHECKING)
                .status(Account.AccountStatus.ACTIVE)
                .balance(new BigDecimal("500.00"))
                .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build();

        transaction = Transaction.builder()
                .id(UUID.randomUUID()).referenceNumber("TXN001")
                .account(account).type(Transaction.TransactionType.DEPOSIT)
                .amount(new BigDecimal("200.00"))
                .balanceAfter(new BigDecimal("700.00"))
                .status(Transaction.TransactionStatus.COMPLETED)
                .createdAt(LocalDateTime.now()).build();
    }

    @Test
    @DisplayName("logTransaction - saves audit log with correct fields")
    void logTransaction_savesCorrectAuditLog() {
        BigDecimal balanceBefore = new BigDecimal("500.00");

        auditService.logTransaction(transaction, balanceBefore);

        ArgumentCaptor<AuditLog> captor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository).save(captor.capture());

        AuditLog saved = captor.getValue();
        assertThat(saved.getEventType()).isEqualTo("DEPOSIT");
        assertThat(saved.getAccountId()).isEqualTo(account.getId());
        assertThat(saved.getAmount()).isEqualByComparingTo("200.00");
        assertThat(saved.getBalanceBefore()).isEqualByComparingTo("500.00");
        assertThat(saved.getBalanceAfter()).isEqualByComparingTo("700.00");
    }

    @Test
    @DisplayName("logAccountCreated - saves ACCOUNT_CREATED audit log")
    void logAccountCreated_savesCorrectAuditLog() {
        auditService.logAccountCreated(account);

        ArgumentCaptor<AuditLog> captor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository).save(captor.capture());

        AuditLog saved = captor.getValue();
        assertThat(saved.getEventType()).isEqualTo("ACCOUNT_CREATED");
        assertThat(saved.getAccountNumber()).isEqualTo("SB0000000001");
        assertThat(saved.getBalanceBefore()).isEqualByComparingTo("0.00");
    }

    @Test
    @DisplayName("logTransaction - repository failure does not throw")
    void logTransaction_repositoryFailure_doesNotThrow() {
        when(auditLogRepository.save(any())).thenThrow(new RuntimeException("DB error"));

        // Should NOT propagate — audit must never crash the main flow
        org.junit.jupiter.api.Assertions.assertDoesNotThrow(() ->
                auditService.logTransaction(transaction, new BigDecimal("500.00")));
    }
}
