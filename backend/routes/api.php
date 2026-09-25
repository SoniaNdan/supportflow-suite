<?php
declare(strict_types=1);

/**
 * Lightweight JSON endpoints. Loaded from public/index.php when path starts with /api/.
 * The server-rendered application remains unchanged; this file is the React adapter layer.
 */
return function (string $method, string $path): void {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (is_string($origin) && preg_match('#^http://(localhost|127\\.0\\.0\\.1)(?::\\d+)?$#', $origin)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Expose-Headers: X-CSRF-Token');
        header('Vary: Origin');
    }

    if ($method === 'OPTIONS') {
        http_response_code(204);
        exit;
    }

    $respond = static function (array $data, int $status = 200): void {
        if (session_status() !== PHP_SESSION_ACTIVE) {
            session_start();
        }
        header('X-CSRF-Token: ' . csrf_token());
        json_response($data, $status);
    };

    $requireAuth = static function () use ($respond): void {
        if (!auth_check()) {
            $respond(['success' => false, 'message' => 'Please sign in to continue.'], 401);
        }
    };

    $requireAdmin = static function () use ($requireAuth, $respond): void {
        $requireAuth();
        if (!auth_is_admin()) {
            $respond(['success' => false, 'message' => 'This action is restricted to administrators.'], 403);
        }
    };

    $requireSystemAdmin = static function () use ($requireAuth, $respond): void {
        $requireAuth();
        if (!auth_is_system_admin()) {
            $respond(['success' => false, 'message' => 'This action is restricted to System Administrators.'], 403);
        }
    };

    $verifyCsrf = static function () use ($respond): void {
        $sent = $_POST['_csrf'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
        if (!is_string($sent) || !hash_equals($_SESSION['_csrf'] ?? '', $sent)) {
            $respond(['success' => false, 'message' => 'CSRF token mismatch.'], 403);
        }
    };

    $findAccessibleTicket = static function (string $ticketNo) use ($respond): array {
        $ticket = Ticket::findByNo($ticketNo);
        if (!$ticket) {
            $respond(['success' => false, 'message' => 'Ticket not found.'], 404);
        }

        if (!auth_is_admin() && (int)$ticket['user_id'] !== (int)auth_id()) {
            $respond(['success' => false, 'message' => 'You do not have permission to view this ticket.'], 403);
        }
        if (auth_is_support_admin() && (int)($ticket['assigned_to'] ?? 0) !== (int)auth_id()) {
            $respond(['success' => false, 'message' => 'Support Administrators can only access tickets assigned to them.'], 403);
        }

        return $ticket;
    };

    if ($method === 'GET' && $path === '/api/auth/me') {
        $user = auth_user();
        $respond([
            'authenticated' => $user !== null,
            'user' => $user === null ? null : [
                'id' => (int)$user['id'],
                'name' => (string)$user['name'],
                'email' => (string)$user['email'],
                'role' => (string)$user['role'],
                'admin_level' => $user['admin_level'] ?? null,
            ],
        ]);
    }

    if ($method === 'POST' && $path === '/api/auth/login') {
        $verifyCsrf();
        $result = (new AuthController())->loginJson();
        $status = (int)$result['status'];
        unset($result['status']);
        $respond($result, $status);
    }

    if ($method === 'POST' && $path === '/api/auth/register') {
        $verifyCsrf();
        $result = (new AuthController())->registerJson();
        $status = (int)$result['status'];
        unset($result['status']);
        $respond($result, $status);
    }

    if ($method === 'POST' && $path === '/api/auth/logout') {
        $verifyCsrf();
        $result = (new AuthController())->logoutJson();
        $status = (int)$result['status'];
        unset($result['status']);
        $respond($result, $status);
    }

    if ($method === 'POST' && $path === '/api/auth/forgot-password') {
        $verifyCsrf();
        $email = trim((string)($_POST['email'] ?? ''));

        $validator = (new Validator(['email' => $email]))->required('email')->email('email');
        if (!$validator->passes()) {
            $respond(['success' => false, 'message' => implode(' ', $validator->errors)], 422);
        }

        $user = User::findByEmail($email);
        if ($user) {
            $token = bin2hex(random_bytes(32));
            $pdo = Database::conn();
            $delete = $pdo->prepare('DELETE FROM password_resets WHERE user_id = ? OR expires_at < NOW()');
            $delete->execute([(int)$user['id']]);
            $insert = $pdo->prepare(
                'INSERT INTO password_resets (user_id, token_hash, expires_at, created_at)
                 VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR), NOW())'
            );
            $insert->execute([(int)$user['id'], hash('sha256', $token)]);

            $frontendOrigin = is_string($origin) && preg_match('#^http://(localhost|127\.0\.0\.1)(?::\d+)?$#', $origin)
                ? rtrim($origin, '/')
                : rtrim(BASE_URL, '/');
            $resetLink = $frontendOrigin . '/reset-password?token=' . urlencode($token);
            $mailBody = "Use this link within one hour to reset your ResolveDesk password:

" . $resetLink;
            $sent = @mail($email, 'ResolveDesk password reset', $mailBody, 'From: ' . (getenv('MAIL_FROM') ?: 'no-reply@localhost'));
            if (!$sent) {
                log_event("Password reset link for {$email}: " . $resetLink);
            }
        }

        $respond([
            'success' => true,
            'message' => 'If an account with that email exists, a password reset link has been sent.',
        ]);
    }

    if ($method === 'GET' && $path === '/api/auth/reset-password/validate') {
        $token = (string)($_GET['token'] ?? '');
        $valid = false;
        if (preg_match('/^[a-f0-9]{64}$/', $token)) {
            $stmt = Database::conn()->prepare(
                'SELECT id FROM password_resets WHERE token_hash = ? AND used_at IS NULL AND expires_at > NOW() LIMIT 1'
            );
            $stmt->execute([hash('sha256', $token)]);
            $valid = (bool)$stmt->fetchColumn();
        }
        $respond(['valid' => $valid]);
    }

    if ($method === 'POST' && $path === '/api/auth/reset-password') {
        $verifyCsrf();
        $token = (string)($_POST['token'] ?? '');
        $password = (string)($_POST['password'] ?? '');
        $confirmation = (string)($_POST['password_confirmation'] ?? '');

        if (!preg_match('/^[a-f0-9]{64}$/', $token)) {
            $respond(['success' => false, 'message' => 'That reset link is invalid or expired.'], 422);
        }
        if (strlen($password) < 8) {
            $respond(['success' => false, 'message' => 'Password must be at least 8 characters.'], 422);
        }
        if ($password !== $confirmation) {
            $respond(['success' => false, 'message' => 'Passwords do not match.'], 422);
        }

        $stmt = Database::conn()->prepare(
            'SELECT * FROM password_resets WHERE token_hash = ? AND used_at IS NULL AND expires_at > NOW() ORDER BY id DESC LIMIT 1'
        );
        $stmt->execute([hash('sha256', $token)]);
        $row = $stmt->fetch();
        if (!$row) {
            $respond(['success' => false, 'message' => 'That reset link is invalid or expired.'], 422);
        }

        User::updatePassword((int)$row['user_id'], password_hash($password, PASSWORD_BCRYPT));
        Database::conn()->prepare('UPDATE password_resets SET used_at = NOW() WHERE id = ?')->execute([(int)$row['id']]);
        ActivityLog::log((int)$row['user_id'], 'password.reset', 'Password reset completed');
        $respond(['success' => true, 'message' => 'Password updated. Please sign in.']);
    }

    if ($method === 'GET' && $path === '/api/settings') {
        $requireAuth();
        $user = User::find((int)auth_id());
        $respond([
            'user' => [
                'id' => (int)$user['id'],
                'name' => (string)$user['name'],
                'email' => (string)$user['email'],
                'role' => (string)$user['role'],
                'admin_level' => $user['admin_level'] ?? null,
                'status' => (string)$user['status'],
            ],
        ]);
    }

    if ($method === 'POST' && $path === '/api/settings/profile') {
        $requireAuth();
        $verifyCsrf();
        $name = trim((string)($_POST['name'] ?? ''));
        $email = trim((string)($_POST['email'] ?? ''));
        $validator = (new Validator(['name' => $name, 'email' => $email]))
            ->required('name')->max('name', 100)
            ->required('email')->email('email');

        if (!$validator->passes()) {
            $respond(['success' => false, 'message' => implode(' ', $validator->errors)], 422);
        }

        $existing = User::findByEmail($email);
        if ($existing && (int)$existing['id'] !== (int)auth_id()) {
            $respond(['success' => false, 'message' => 'That email address is already in use.'], 409);
        }

        User::updateProfile((int)auth_id(), $name, $email);
        $_SESSION['user']['name'] = $name;
        $_SESSION['user']['email'] = $email;
        ActivityLog::log(auth_id(), 'settings.profile', 'Updated profile details');
        $respond(['success' => true, 'user' => auth_user()]);
    }

    if ($method === 'POST' && $path === '/api/settings/password') {
        $requireAuth();
        $verifyCsrf();
        $currentPassword = (string)($_POST['current_password'] ?? '');
        $newPassword = (string)($_POST['new_password'] ?? '');
        $confirmPassword = (string)($_POST['confirm_password'] ?? '');
        $user = User::find((int)auth_id());

        if (!$user || $currentPassword === '' || !password_verify($currentPassword, $user['password_hash'])) {
            $respond(['success' => false, 'message' => 'Current password is incorrect.'], 422);
        }
        if (strlen($newPassword) < 8) {
            $respond(['success' => false, 'message' => 'New password must be at least 8 characters.'], 422);
        }
        if ($newPassword !== $confirmPassword) {
            $respond(['success' => false, 'message' => 'New password and confirmation password do not match.'], 422);
        }
        if (password_verify($newPassword, $user['password_hash'])) {
            $respond(['success' => false, 'message' => 'Your new password must be different from your current password.'], 422);
        }

        User::updatePassword((int)auth_id(), password_hash($newPassword, PASSWORD_BCRYPT));
        ActivityLog::log(auth_id(), 'settings.password', 'Changed account password');
        $respond(['success' => true, 'message' => 'Password changed successfully.']);
    }

    if ($method === 'GET' && $path === '/api/notifications') {
        $requireAuth();
        $respond([
            'items' => Notification::forUser((int)auth_id()),
            'unread' => Notification::unreadCount((int)auth_id()),
        ]);
    }

    if ($method === 'GET' && $path === '/api/tickets/search') {
        $requireAuth();
        $filters = [
            'status' => $_GET['status'] ?? null,
            'priority' => $_GET['priority'] ?? null,
            'q' => $_GET['q'] ?? null,
            'assigned_to' => auth_is_system_admin() ? ($_GET['assigned_to'] ?? null) : null,
        ];

        if (auth_is_system_admin()) {
            $data = Ticket::all($filters, (int)auth_id(), true);
        } elseif (auth_is_support_admin()) {
            $data = Ticket::all($filters, (int)auth_id(), false);
        } else {
            $data = Ticket::forUser((int)auth_id(), $filters);
        }

        $respond(['tickets' => $data]);
    }

    if ($method === 'GET' && $path === '/api/dashboard/stats') {
        $requireAuth();
        if (auth_is_system_admin()) {
            $stats = Ticket::adminStats(null);
        } elseif (auth_is_support_admin()) {
            $stats = Ticket::adminStats((int)auth_id());
        } else {
            $stats = Ticket::stats((int)auth_id());
        }
        $respond(['stats' => $stats]);
    }

    if ($method === 'POST' && preg_match('#^/api/notifications/(\d+)/read$#', $path, $matches)) {
        $requireAuth();
        $verifyCsrf();
        Notification::markRead((int)$matches[1], (int)auth_id());
        $respond([
            'success' => true,
            'unread' => Notification::unreadCount((int)auth_id()),
        ]);
    }

    if ($method === 'POST' && $path === '/api/notifications/read-all') {
        $requireAuth();
        $verifyCsrf();
        Notification::markAllRead((int)auth_id());
        $respond(['success' => true, 'unread' => 0]);
    }

    if ($method === 'GET' && $path === '/api/admin/users') {
        $requireSystemAdmin();
        $respond(['users' => User::all()]);
    }

    if ($method === 'GET' && $path === '/api/admin/support-admins') {
        $requireSystemAdmin();
        $respond(['admins' => User::admins()]);
    }

    if ($method === 'POST' && preg_match('#^/api/admin/users/(\d+)/status$#', $path, $matches)) {
        $requireSystemAdmin();
        $verifyCsrf();

        $id = (int)$matches[1];
        $status = (string)($_POST['status'] ?? '');
        if (!in_array($status, ['active', 'suspended'], true)) {
            $respond(['success' => false, 'message' => 'Invalid account status.'], 422);
        }

        $target = User::find($id);
        if (!$target) {
            $respond(['success' => false, 'message' => 'User not found.'], 404);
        }
        if (($target['role'] === 'admin' && $target['admin_level'] === 'system_admin') || $id === (int)auth_id()) {
            $respond(['success' => false, 'message' => 'That account cannot be suspended or reactivated here.'], 403);
        }

        User::setStatus($id, $status);
        ActivityLog::log(auth_id(), 'user.status', "User #$id -> $status");
        $updatedUser = User::find($id);
        $respond([
            'success' => true,
            'user' => [
                'id' => (int)$updatedUser['id'],
                'name' => (string)$updatedUser['name'],
                'email' => (string)$updatedUser['email'],
                'role' => (string)$updatedUser['role'],
                'admin_level' => $updatedUser['admin_level'] ?? null,
                'status' => (string)$updatedUser['status'],
                'created_at' => (string)$updatedUser['created_at'],
            ],
        ]);
    }

    if ($method === 'POST' && preg_match('#^/api/admin/tickets/([^/]+)/priority$#', $path, $matches)) {
        $requireAdmin();
        $verifyCsrf();
        $ticket = $findAccessibleTicket(urldecode($matches[1]));
        $priority = (string)($_POST['priority'] ?? '');

        if (!in_array($priority, Ticket::PRIORITIES, true)) {
            $respond(['success' => false, 'message' => 'Invalid priority.'], 422);
        }

        if ($ticket['priority'] !== $priority) {
            Ticket::update((int)$ticket['id'], ['priority' => $priority]);
            if ((int)$ticket['user_id'] !== (int)auth_id()) {
                Notification::create((int)$ticket['user_id'], 'Priority updated', $ticket['ticket_no'] . ' is now ' . $priority);
            }
            ActivityLog::log(auth_id(), 'ticket.priority', 'Set #' . (int)$ticket['id'] . ' priority ' . $priority);
        }

        $respond(['success' => true, 'ticket' => Ticket::find((int)$ticket['id'])]);
    }

    if ($method === 'POST' && preg_match('#^/api/admin/tickets/([^/]+)/assign$#', $path, $matches)) {
        $requireSystemAdmin();
        $verifyCsrf();
        $ticket = $findAccessibleTicket(urldecode($matches[1]));

        $assignedTo = (int)($_POST['assigned_to'] ?? 0);
        $newAssignee = $assignedTo > 0 ? $assignedTo : null;
        $previousAssignee = !empty($ticket['assigned_to']) ? (int)$ticket['assigned_to'] : null;

        if ($newAssignee !== null) {
            $admin = User::find($newAssignee);
            if (!$admin || $admin['role'] !== 'admin' || $admin['admin_level'] !== 'support_admin' || $admin['status'] !== 'active') {
                $respond(['success' => false, 'message' => 'Invalid Support Administrator selected.'], 422);
            }
        }

        if ($previousAssignee !== $newAssignee) {
            Ticket::update((int)$ticket['id'], ['assigned_to' => $newAssignee]);

            if ($newAssignee !== null && $newAssignee !== (int)auth_id()) {
                Notification::create($newAssignee, 'Ticket assigned to you', $ticket['ticket_no'] . ' — ' . $ticket['title']);
            }

            if ((int)$ticket['user_id'] !== (int)auth_id()) {
                $assigneeName = $newAssignee !== null ? (User::find($newAssignee)['name'] ?? 'Support team') : 'the support team';
                Notification::create((int)$ticket['user_id'], 'Ticket assignment updated', $ticket['ticket_no'] . ' is now assigned to ' . $assigneeName . '.');
            }

            if ($previousAssignee !== null && $previousAssignee !== $newAssignee && $previousAssignee !== (int)auth_id()) {
                Notification::create($previousAssignee, 'Ticket unassigned', $ticket['ticket_no'] . ' is no longer assigned to you.');
            }

            ActivityLog::log(auth_id(), 'ticket.assign', $newAssignee !== null
                ? 'Assigned #' . (int)$ticket['id'] . ' to user #' . $newAssignee
                : 'Unassigned #' . (int)$ticket['id']);
        }

        $respond(['success' => true, 'ticket' => Ticket::find((int)$ticket['id'])]);
    }

    if ($method === 'POST' && preg_match('#^/api/admin/tickets/([^/]+)/revoke$#', $path, $matches)) {
        $requireSystemAdmin();
        $verifyCsrf();
        $ticket = $findAccessibleTicket(urldecode($matches[1]));
        $previousAssignee = (int)($ticket['assigned_to'] ?? 0);

        if ($previousAssignee > 0) {
            Ticket::update((int)$ticket['id'], ['assigned_to' => null]);
            Notification::create(
                $previousAssignee,
                'Ticket assignment revoked',
                'Your assignment for ' . $ticket['ticket_no'] . ' has been revoked by a System Administrator.'
            );
            ActivityLog::log(auth_id(), 'ticket.revoke_assignment', 'Revoked assignment for #' . (int)$ticket['id']);
        }

        $respond(['success' => true, 'ticket' => Ticket::find((int)$ticket['id'])]);
    }

    // Create a ticket. Multipart requests are supported so the React UI can reuse handle_upload().
    if ($method === 'POST' && $path === '/api/tickets') {
        $requireAuth();
        $verifyCsrf();

        $validator = (new Validator($_POST))
            ->required('title')->max('title', 200)
            ->required('category')->max('category', 100)
            ->required('priority')->in('priority', Ticket::PRIORITIES)
            ->required('description')->max('description', 5000);

        if (!$validator->passes()) {
            $respond([
                'success' => false,
                'message' => implode(' ', $validator->errors),
                'errors' => $validator->errors,
            ], 422);
        }

        try {
            $attachment = handle_upload('attachment');
        } catch (Throwable $e) {
            $respond(['success' => false, 'message' => $e->getMessage()], 422);
        }

        $id = Ticket::create([
            'user_id' => auth_id(),
            'title' => trim((string)$_POST['title']),
            'category' => trim((string)$_POST['category']),
            'priority' => (string)$_POST['priority'],
            'description' => trim((string)$_POST['description']),
            'attachment_path' => $attachment ?? null,
        ]);

        ActivityLog::log(auth_id(), 'ticket.create', "Created ticket #$id");

        foreach (Database::conn()->query("SELECT id FROM users WHERE role = 'admin' AND status = 'active'") as $admin) {
            $created = Ticket::find($id);
            Notification::create(
                (int)$admin['id'],
                'New ticket created',
                $created ? $created['ticket_no'] . ' — ' . $created['title'] : 'Ticket #' . $id
            );
        }

        $ticket = Ticket::find($id);
        $respond(['success' => true, 'ticket' => $ticket], 201);
    }

    // Ticket detail by public ticket number, e.g. /api/tickets/TKT-E8D34E.
    if ($method === 'GET' && preg_match('#^/api/tickets/([^/]+)$#', $path, $matches)) {
        $requireAuth();
        $ticket = $findAccessibleTicket(urldecode($matches[1]));
        $replies = Reply::forTicket((int)$ticket['id'], auth_is_admin());
        Ticket::markRead((int)$ticket['id'], (int)auth_id());
        $respond(['ticket' => $ticket, 'replies' => $replies]);
    }

    if ($method === 'POST' && preg_match('#^/api/tickets/([^/]+)/reply$#', $path, $matches)) {
        $requireAuth();
        $verifyCsrf();
        $ticket = $findAccessibleTicket(urldecode($matches[1]));
        $message = trim((string)($_POST['message'] ?? ''));

        if ($message === '') {
            $respond(['success' => false, 'message' => 'Reply cannot be empty.'], 422);
        }

        try {
            $attachment = handle_upload('attachment');
        } catch (Throwable $e) {
            $respond(['success' => false, 'message' => $e->getMessage()], 422);
        }

        $isInternal = auth_is_admin() && !empty($_POST['internal']);
        $replyId = Reply::create([
            'ticket_id' => (int)$ticket['id'],
            'user_id' => auth_id(),
            'message' => $message,
            'attachment_path' => $attachment,
            'is_internal_note' => $isInternal,
        ]);

        if (auth_is_admin()) {
            if (!$isInternal) {
                Notification::create((int)$ticket['user_id'], 'New reply on ' . $ticket['ticket_no'], substr($message, 0, 200));
            }
        } else {
            $stmt = $ticket['assigned_to']
                ? Database::conn()->prepare("SELECT id FROM users WHERE id = ? AND role = 'admin' AND status = 'active'")
                : Database::conn()->query("SELECT id FROM users WHERE role = 'admin' AND status = 'active'");
            if ($ticket['assigned_to']) {
                $stmt->execute([(int)$ticket['assigned_to']]);
            }
            foreach ($stmt as $admin) {
                Notification::create((int)$admin['id'], 'New reply on ' . $ticket['ticket_no'], substr($message, 0, 200));
            }
        }

        ActivityLog::log(
            auth_id(),
            $isInternal ? 'ticket.internal_note' : 'ticket.reply',
            ($isInternal ? 'Added internal note to #' : 'Replied to #') . (int)$ticket['id']
        );

        $replies = Reply::forTicket((int)$ticket['id'], auth_is_admin());
        $createdReply = null;
        foreach ($replies as $candidate) {
            if ((int)$candidate['id'] === $replyId) {
                $createdReply = $candidate;
                break;
            }
        }
        $respond(['success' => true, 'reply' => $createdReply], 201);
    }

    // Preserve the status control already present on the shared React detail page.
    if ($method === 'POST' && preg_match('#^/api/tickets/([^/]+)/status$#', $path, $matches)) {
        $requireAuth();
        $verifyCsrf();
        if (!auth_is_admin()) {
            $respond(['success' => false, 'message' => 'This action is restricted to administrators.'], 403);
        }

        $ticket = $findAccessibleTicket(urldecode($matches[1]));
        $status = (string)($_POST['status'] ?? '');
        if (!in_array($status, Ticket::STATUSES, true)) {
            $respond(['success' => false, 'message' => 'Invalid status.'], 422);
        }

        if ($ticket['status'] !== $status) {
            Ticket::update((int)$ticket['id'], ['status' => $status]);
            Notification::create((int)$ticket['user_id'], 'Status updated', $ticket['ticket_no'] . ' is now ' . $status);
            ActivityLog::log(auth_id(), 'ticket.status', 'Set #' . (int)$ticket['id'] . ' to ' . $status);
        }

        $respond(['success' => true, 'ticket' => Ticket::find((int)$ticket['id'])]);
    }

    $respond(['error' => 'Not found'], 404);
};
