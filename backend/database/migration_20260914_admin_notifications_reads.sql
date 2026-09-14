-- Run once against an existing ResolveDesk database.
ALTER TABLE users
  ADD COLUMN admin_level ENUM('system_admin','support_admin') NULL AFTER role;

UPDATE users
SET admin_level = 'system_admin'
WHERE role = 'admin' AND email = 'admin@example.com';

UPDATE users
SET admin_level = 'support_admin'
WHERE role = 'admin' AND admin_level IS NULL;

CREATE TABLE ticket_reads (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  last_read_at DATETIME NOT NULL,
  UNIQUE KEY uq_ticket_read_user (ticket_id, user_id),
  INDEX (user_id, last_read_at),
  CONSTRAINT fk_ticket_reads_ticket FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  CONSTRAINT fk_ticket_reads_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE password_resets
  CHANGE COLUMN token token_hash CHAR(64) NOT NULL;
ALTER TABLE password_resets
  ADD UNIQUE KEY uq_password_reset_token (token_hash);
