<?php
declare(strict_types=1);

/**
 * Lightweight JSON endpoints. Loaded from public/index.php when path starts with /api/.
 */
return function (string $method, string $path): void {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (is_string($origin) && preg_match('#^http://(localhost|127\.0\.0\.1)(?::\d+)?$#', $origin)) {
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
        // The React client uses this existing session token for CSRF-protected POSTs.
        if (session_status() !== PHP_SESSION_ACTIVE) {
            session_start();
        }
        header('X-CSRF-Token: ' . csrf_token());
        json_response($data, $status);
    };

    // Keep CSRF enforcement, but return JSON (web forms still use csrf_verify()).
    $verifyCsrf = static function () use ($respond): void {
        $sent = $_POST['_csrf'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
        if (!is_string($sent) || !hash_equals($_SESSION['_csrf'] ?? '', $sent)) {
            // Use 403 (not 419): Apache on this stack rewrites unknown 419 to 500.
            $respond(['success' => false, 'message' => 'CSRF token mismatch.'], 403);
        }
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

    if ($method === 'GET' && $path === '/api/notifications') {
        AuthMiddleware::handle();
        $respond([
            'items'  => Notification::forUser((int)auth_id()),
            'unread' => Notification::unreadCount((int)auth_id()),
        ]);
    }
    if ($method === 'GET' && $path === '/api/tickets/search') {
        AuthMiddleware::handle();
        $filters = ['status' => $_GET['status'] ?? null, 'priority' => $_GET['priority'] ?? null, 'q' => $_GET['q'] ?? null];
        $data = auth_is_admin()
            ? Ticket::all($filters, (int)auth_id())
            : Ticket::forUser((int)auth_id(), $filters);
        $respond(['tickets' => $data]);
    }
    if ($method === 'GET' && $path === '/api/dashboard/stats') {
        AuthMiddleware::handle();
        $respond(['stats' => Ticket::stats(auth_is_admin() ? null : (int)auth_id())]);
    }
    $respond(['error' => 'Not found'], 404);
};
