package com.securebank.account.service.impl;

import com.securebank.account.entity.Account;
import com.securebank.account.entity.AuditLog;
import com.securebank.account.entity.Transaction;
import com.securebank.account.repository.AuditLogRepository;
import com.securebank.account.service.AuditService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditServiceImpl implements AuditService {

    private final AuditLogRepository auditLogRepository;

    /**
     * Called after every transaction. Runs on the auditExecutor thread pool,
     * NOT on the HTTP request thread — this is what improves API response times.
     */
    @Async("auditExecutor")
    @Transactional
    @Override
    public void logTransaction(Transaction transaction, BigDecimal balanceBefore) {
        String threadName = Thread.currentThread().getName();
        log.debug("Async audit logging on thread: {} for tx: {}", threadName, transaction.getReferenceNumber());

        try {
            AuditLog log = AuditLog.builder()
                    .eventType(transaction.getType().name())
                    .accountId(transaction.getAccount().getId())
                    .accountNumber(transaction.getAccount().getAccountNumber())
                    .userId(transaction.getAccount().getUser().getId())
                    .amount(transaction.getAmount())
                    .balanceBefore(balanceBefore)
                    .balanceAfter(transaction.getBalanceAfter())
                    .description(transaction.getDescription())
                    .threadName(threadName)
                    .build();

            auditLogRepository.save(log);
        } catch (Exception e) {
            log.error("Audit log failed for tx {}: {}", transaction.getReferenceNumber(), e.getMessage());
        }
    }

    @Async("auditExecutor")
    @Transactional
    @Override
    public void logAccountCreated(Account account) {
        String threadName = Thread.currentThread().getName();
        log.debug("Async audit: account created {} on thread {}", account.getAccountNumber(), threadName);

        try {
            AuditLog auditLog = AuditLog.builder()
                    .eventType("ACCOUNT_CREATED")
                    .accountId(account.getId())
                    .accountNumber(account.getAccountNumber())
                    .userId(account.getUser().getId())
                    .balanceBefore(BigDecimal.ZERO)
                    .balanceAfter(BigDecimal.ZERO)
                    .description("Account opened: " + account.getAccountType())
                    .threadName(threadName)
                    .build();

            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.error("Audit log failed for account creation {}: {}", account.getAccountNumber(), e.getMessage());
        }
    }
}
