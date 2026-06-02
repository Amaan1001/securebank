package com.securebank.account.service;

import com.securebank.account.dto.request.CreateAccountRequest;
import com.securebank.account.dto.request.TransactionRequest;
import com.securebank.account.dto.request.TransferRequest;
import com.securebank.account.dto.response.AccountResponse;
import com.securebank.account.dto.response.TransactionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface AccountService {
    AccountResponse createAccount(CreateAccountRequest request);
    AccountResponse getAccountById(UUID id);
    AccountResponse getAccountByNumber(String accountNumber);
    List<AccountResponse> getAccountsByUserId(UUID userId);
    TransactionResponse deposit(UUID accountId, TransactionRequest request);
    TransactionResponse withdraw(UUID accountId, TransactionRequest request);
    List<TransactionResponse> transfer(UUID fromAccountId, TransferRequest request);
    Page<TransactionResponse> getTransactionHistory(UUID accountId, Pageable pageable);
}
