package com.securebank.account.controller;

import com.securebank.account.dto.request.CreateAccountRequest;
import com.securebank.account.dto.request.TransactionRequest;
import com.securebank.account.dto.request.TransferRequest;
import com.securebank.account.dto.response.AccountResponse;
import com.securebank.account.dto.response.TransactionResponse;
import com.securebank.account.service.AccountService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/accounts")
@RequiredArgsConstructor
@Tag(name = "Accounts")
public class AccountController {

    private final AccountService accountService;

    @PostMapping
    @Operation(summary = "Open a new bank account")
    public ResponseEntity<AccountResponse> createAccount(@Valid @RequestBody CreateAccountRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(accountService.createAccount(request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get account by ID")
    public ResponseEntity<AccountResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(accountService.getAccountById(id));
    }

    @GetMapping("/number/{accountNumber}")
    @Operation(summary = "Get account by account number")
    public ResponseEntity<AccountResponse> getByNumber(@PathVariable String accountNumber) {
        return ResponseEntity.ok(accountService.getAccountByNumber(accountNumber));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get all accounts for a user")
    public ResponseEntity<List<AccountResponse>> getByUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(accountService.getAccountsByUserId(userId));
    }

    @PostMapping("/{id}/deposit")
    @Operation(summary = "Deposit funds")
    public ResponseEntity<TransactionResponse> deposit(@PathVariable UUID id,
            @Valid @RequestBody TransactionRequest request) {
        return ResponseEntity.ok(accountService.deposit(id, request));
    }

    @PostMapping("/{id}/withdraw")
    @Operation(summary = "Withdraw funds")
    public ResponseEntity<TransactionResponse> withdraw(@PathVariable UUID id,
            @Valid @RequestBody TransactionRequest request) {
        return ResponseEntity.ok(accountService.withdraw(id, request));
    }

    @PostMapping("/{id}/transfer")
    @Operation(summary = "Transfer funds to another account")
    public ResponseEntity<List<TransactionResponse>> transfer(@PathVariable UUID id,
            @Valid @RequestBody TransferRequest request) {
        return ResponseEntity.ok(accountService.transfer(id, request));
    }

    @GetMapping("/{id}/transactions")
    @Operation(summary = "Paginated transaction history")
    public ResponseEntity<Page<TransactionResponse>> getTransactions(@PathVariable UUID id,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(accountService.getTransactionHistory(id, pageable));
    }
}
