# ResolveDesk — PHP/MySQL Backend

Complaint & Ticket Management System built with plain PHP 8+, PDO/MySQL,
session auth, CSRF protection, and a minimal MVC structure.

## Stack
- PHP 8+
- MySQL 8+
- Tailwind (via CDN in views)
- No framework, no Composer dependencies

## Folder layout
```
backend/
├── app/
│   ├── config/          # config.php, database.php
│   ├── helpers/         # auth, csrf, validation, uploads, functions
│   ├── middleware/      # AuthMiddleware, AdminMiddleware
│   ├── models/          # User, Ticket, Reply, Notification, ActivityLog
│   ├── controllers/     # Auth, Ticket, Admin, User, Settings
│   └── views/           # Tailwind-styled PHP templates
├── public/
│   ├── index.php        # front controller
│   ├── .htaccess        # pretty URLs + harden /uploads
│   └── uploads/         # user attachments (chmod 0775)
├── routes/
│   ├── web.php          # page routes
│   └── api.php          # JSON endpoints
├── database/
│   ├── schema.sql
│   └── seed.sql
│   └── migration_20260914_admin_notifications_reads.sql
├── storage/logs/
└── README.md
```

## Installation

1. **Clone / copy** the `backend/` folder into your web root
   (XAMPP `htdocs/resolvedesk`, cPanel `public_html/resolvedesk`, etc).
2. **Create the database**:
   ```sql
   CREATE DATABASE resolvedesk CHARACTER SET utf8mb4;
   ```
3. **Import schema + seed**:
   ```bash
   mysql -u root -p resolvedesk < database/schema.sql
   mysql -u root -p resolvedesk < database/seed.sql
   ```
4. **Configure credentials** in `app/config/database.php` (or set env vars
   `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS`).
5. **Make folders writable**:
   ```bash
   chmod -R 0775 public/uploads storage/logs
   ```
7. **Upgrade an existing database** by running
   `database/migration_20260914_admin_notifications_reads.sql` once. Fresh
   installs should use the updated `schema.sql` instead.
6. **Point your virtual host** to `backend/public/`.
   For XAMPP, browse to `http://localhost/resolvedesk/public/`.
   The included root `.htaccess` also forwards requests to `/public` so the
   project URL works directly.

## Default accounts
| Role          | Email             | Password  |
|---------------|-------------------|-----------|
| System Admin  | admin@example.com | Admin123! |
| User          | jane@example.com  | Admin123! |

## Routes
See `routes/web.php` for the full list. Highlights:

- `GET /login`, `POST /login`, `POST /logout`
- `GET /register`, `POST /register`
- `GET /forgot-password`, `POST /forgot-password`
- `GET /reset-password?token=…`, `POST /reset-password`
- `GET /dashboard`
- `GET /tickets`, `GET /tickets/new`, `POST /tickets`
- `GET /tickets/{id}`, `POST /tickets/{id}/reply`
- `GET /notifications`, `POST /notifications/{id}/read`, `POST /notifications/read-all`
- `GET /settings`, `POST /settings/profile`, `POST /settings/password`
- `GET /admin/dashboard`, `GET /admin/tickets`, `GET /admin/users`
- `POST /admin/tickets/{id}/status|priority|assign`
- `POST /admin/users/{id}/status`

JSON (AJAX): `GET /api/notifications`, `GET /api/tickets/search`, `GET /api/dashboard/stats`.

## Security
- PDO prepared statements only (no string concatenation).
- CSRF tokens required for every `POST` (`csrf_field()` helper).
- Session regeneration on login, `HttpOnly` + `SameSite=Lax` cookies.
- `password_hash()` / `password_verify()` (bcrypt).
- File uploads validated by MIME type + size; uploads directory has PHP
  execution disabled via `.htaccess`.
- Role-based authorization via `AuthMiddleware`, `AdminMiddleware`, and
   `SystemAdminMiddleware`; only the system admin manages accounts.
- Notifications are user-scoped and show an unread navbar count. Ticket read
   state is tracked per user in `ticket_reads`, with internal notes hidden from
   normal-user unread calculations.
- Errors logged to `storage/logs/php-error.log` and `app.log`; users see
  friendly 404/500 pages.

## Extending
- New page: add a controller method, register the route in `routes/web.php`,
  add a view in `app/views/`.
- New JSON endpoint: add a branch in `routes/api.php`.
- New table: write SQL in `database/schema.sql` and a model in `app/models/`.

## Notes for project defense
- Architecture: front controller → router → middleware → controller → model → view.
- Every protected route runs middleware. Every form posts a CSRF token.
- Tickets get a unique `TKT-XXXXXX` number, status timeline via `activity_logs`,
  and full reply thread with internal notes for admins.
- Notifications fire on admin replies and status changes.
