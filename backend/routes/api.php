<?php
declare(strict_types=1);

/**
 * Lightweight JSON endpoints. Loaded from public/index.php when path starts with /api/.
 */
return function (string $method, string $path): void {
    if ($method === 'GET' && $path === '/api/notifications') {
        AuthMiddleware::handle();
        json_response([
            'items'  => Notification::forUser((int)auth_id()),
            'unread' => Notification::unreadCount((int)auth_id()),
        ]);
    }
    if ($method === 'GET' && $path === '/api/tickets/search') {
        AuthMiddleware::handle();
        $filters = ['status' => $_GET['status'] ?? null, 'priority' => $_GET['priority'] ?? null, 'q' => $_GET['q'] ?? null];
        $data = auth_is_admin() ? Ticket::all($filters) : Ticket::forUser((int)auth_id(), $filters);
        json_response(['tickets' => $data]);
    }
    if ($method === 'GET' && $path === '/api/dashboard/stats') {
        AuthMiddleware::handle();
        json_response(['stats' => Ticket::stats(auth_is_admin() ? null : (int)auth_id())]);
    }
    json_response(['error' => 'Not found'], 404);
};
