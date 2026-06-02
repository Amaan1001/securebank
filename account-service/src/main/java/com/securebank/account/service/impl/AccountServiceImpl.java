package com.securebank.account.service.impl;

import com.securebank.account.dto.request.CreateAccountRequest;
import com.securebank.account.dto.request.TransactionRequest;
import com.securebank.account.dto.request.TransferRequest;
import com.securebank.account.dto.response.AccountResponse;
import com.securebank.account.dto.response.TransactionResponse;
import com.securebank.account.entity.Account;
import com.securebank.account.entity.Transaction;
import com.securebank.account.entity.User;
import com.securebank.account.exception.AccountNotActiveException;
import com.securebank.account.exception.InsufficientFundsException;
import com.securebank.account.exception.ResourceNotFoundException;
import com.securebank.account.repository.AccountRepository;
import com.securebank.account.repository.TransactionRepository;
import com.securebank.account.repository.UserRepository;
import com.securebank.account.service.AccountService;
import com.securebank.account.service.AuditService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;   // injected — calls go to async thread pool

    @Override
    @Transactional
    public AccountResponse createAccount(CreateAccountRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.getUserId()));

        String number = generateAccountNumber();
        Account saved = accountRepository.save(Account.builder()
                .accountNumber(number).user(user)
                .accountType(request.getAccountType()).build());

        // Fire-and-forget audit on background thread
        auditService.logAccountCreated(saved);

        log.info("Account created: {}", saved.getAccountNumber());
        return toAccountResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public AccountResponse getAccountById(UUID id) {
        return toAccountResponse(findById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public AccountResponse getAccountByNumber(String accountNumber) {
        return toAccountResponse(accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + accountNumber)));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AccountResponse> getAccountsByUserId(UUID userId) {
        if (!userRepository.existsById(userId))
            throw new ResourceNotFoundException("User not found: " + userId);
        return accountRepository.findByUserId(userId).stream().map(this::toAccountResponse).toList();
    }

    @Override
    @Transactional
    public TransactionResponse deposit(UUID accountId, TransactionRequest request) {
        Account account = findById(accountId);
        validateActive(account);

        BigDecimal balanceBefore = account.getBalance();                       // capture before
        account.setBalance(account.getBalance().add(request.getAmount()));
        accountRepository.save(account);

        Transaction tx = save(account, Transaction.TransactionType.DEPOSIT,
                request.getAmount(), account.getBalance(), request.getDescription(), null);

        auditService.logTransaction(tx, balanceBefore);                        // async — returns immediately
        log.info("Deposit complete on account {}. New balance: {}", accountId, account.getBalance());
        return toTransactionResponse(tx);
    }

    @Override
    @Transactional
    public TransactionResponse withdraw(UUID accountId, TransactionRequest request) {
        Account account = findById(accountId);
        validateActive(account);

        if (!account.hasSufficientFunds(request.getAmount()))
            throw new InsufficientFundsException(
                "Insufficient funds. Available: " + account.getBalance() + ", Requested: " + request.getAmount());

        BigDecimal balanceBefore = account.getBalance();
        account.setBalance(account.getBalance().subtract(request.getAmount()));
        accountRepository.save(account);

        Transaction tx = save(account, Transaction.TransactionType.WITHDRAWAL,
                request.getAmount(), account.getBalance(), request.getDescription(), null);

        auditService.logTransaction(tx, balanceBefore);
        return toTransactionResponse(tx);
    }

    @Override
    @Transactional
    public List<TransactionResponse> transfer(UUID fromAccountId, TransferRequest request) {
        Account from = findById(fromAccountId);
        Account to = accountRepository.findByAccountNumber(request.getToAccountNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Destination account not found: " + request.getToAccountNumber()));

        validateActive(from);
        validateActive(to);

        if (!from.hasSufficientFunds(request.getAmount()))
            throw new InsufficientFundsException(
                "Insufficient funds. Available: " + from.getBalance() + ", Requested: " + request.getAmount());

        BigDecimal fromBefore = from.getBalance();
        BigDecimal toBefore   = to.getBalance();

        from.setBalance(from.getBalance().subtract(request.getAmount()));
        to.setBalance(to.getBalance().add(request.getAmount()));
        accountRepository.save(from);
        accountRepository.save(to);

        Transaction outTx = save(from, Transaction.TransactionType.TRANSFER_OUT,
                request.getAmount(), from.getBalance(), request.getDescription(), to);
        Transaction inTx  = save(to,   Transaction.TransactionType.TRANSFER_IN,
                request.getAmount(), to.getBalance(),   request.getDescription(), from);

        // Both audit writes go to background thread — API returns before they finish
        auditService.logTransaction(outTx, fromBefore);
        auditService.logTransaction(inTx,  toBefore);

        return List.of(toTransactionResponse(outTx), toTransactionResponse(inTx));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TransactionResponse> getTransactionHistory(UUID accountId, Pageable pageable) {
        if (!accountRepository.existsById(accountId))
            throw new ResourceNotFoundException("Account not found: " + accountId);
        return transactionRepository.findByAccountIdOrderByCreatedAtDesc(accountId, pageable)
                .map(this::toTransactionResponse);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private Account findById(UUID id) {
        return accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + id));
    }

    private void validateActive(Account account) {
        if (!account.isActive())
            throw new AccountNotActiveException("Account " + account.getAccountNumber() + " is " + account.getStatus());
    }

    private Transaction save(Account account, Transaction.TransactionType type,
            BigDecimal amount, BigDecimal balanceAfter, String description, Account related) {
        return transactionRepository.save(Transaction.builder()
                .referenceNumber(generateRef())
                .account(account).type(type)
                .amount(amount).balanceAfter(balanceAfter)
                .description(description).relatedAccount(related)
                .build());
    }

    private String generateAccountNumber() {
        String n;
        do { n = "SB" + String.format("%010d", (long)(Math.random() * 9_999_999_999L)); }
        while (accountRepository.existsByAccountNumber(n));
        return n;
    }

    private String generateRef() {
        return "TXN" + Instant.now().toEpochMilli() + String.format("%04d", (int)(Math.random() * 9999));
    }

    private AccountResponse toAccountResponse(Account a) {
        return AccountResponse.builder()
                .id(a.getId()).accountNumber(a.getAccountNumber())
                .userId(a.getUser().getId()).ownerName(a.getUser().getFullName())
                .accountType(a.getAccountType()).status(a.getStatus())
                .balance(a.getBalance()).currency(a.getCurrency())
                .createdAt(a.getCreatedAt()).build();
    }

    private TransactionResponse toTransactionResponse(Transaction t) {
        return TransactionResponse.builder()
                .id(t.getId()).referenceNumber(t.getReferenceNumber())
                .accountId(t.getAccount().getId()).type(t.getType())
                .amount(t.getAmount()).balanceAfter(t.getBalanceAfter())
                .description(t.getDescription())
                .relatedAccountNumber(t.getRelatedAccount() != null ? t.getRelatedAccount().getAccountNumber() : null)
                .status(t.getStatus()).createdAt(t.getCreatedAt()).build();
    }
}
