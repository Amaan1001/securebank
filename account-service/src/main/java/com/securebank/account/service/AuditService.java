package com.securebank.account.service;

import com.securebank.account.entity.Account;
import com.securebank.account.entity.Transaction;

import java.math.BigDecimal;

public interface AuditService {
    void logTransaction(Transaction transaction, BigDecimal balanceBefore);
    void logAccountCreated(Account account);
}
