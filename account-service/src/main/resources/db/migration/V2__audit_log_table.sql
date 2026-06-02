-- Audit log table - written asynchronously after every transaction
CREATE TABLE audit_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type      VARCHAR(50) NOT NULL,
    account_id      UUID REFERENCES accounts(id),
    account_number  VARCHAR(20),
    user_id         UUID REFERENCES users(id),
    amount          NUMERIC(19, 4),
    balance_before  NUMERIC(19, 4),
    balance_after   NUMERIC(19, 4),
    description     VARCHAR(255),
    thread_name     VARCHAR(100),         -- which async thread handled this
    created_at      TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_account_id ON audit_logs(account_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type);
