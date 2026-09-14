-- Seed data. Default admin: admin@example.com / Admin123!
INSERT INTO users (name, email, password_hash, role, admin_level, status, created_at, updated_at) VALUES
('System Admin', 'admin@example.com',
 '$2b$10$HSeOXnKkz70QPSBCiovw6uoHvabU9sW1CucS1ZIgC22MyGJjLBr2G',
 'admin', 'system_admin', 'active', NOW(), NOW()),
('Jane Doe', 'jane@example.com',
 '$2b$10$HSeOXnKkz70QPSBCiovw6uoHvabU9sW1CucS1ZIgC22MyGJjLBr2G',
 'user', NULL, 'active', NOW(), NOW());

INSERT INTO settings (setting_key, setting_value, updated_at) VALUES
('site_name', 'ResolveDesk', NOW()),
('support_email', 'support@example.com', NOW());

INSERT INTO tickets (ticket_no, user_id, title, category, priority, description, status, created_at, updated_at)
VALUES ('TKT-DEMO01', 2, 'Cannot log in to my account', 'Account', 'high',
        'I keep getting an invalid credentials error after resetting my password.', 'open', NOW(), NOW());
