<?php
declare(strict_types=1);

final class UserController
{
    public function dashboard(): void {
        AuthMiddleware::handle();
        view('tickets/dashboard', [
            'title' => 'Dashboard',
            'stats' => Ticket::stats(auth_id()),
            'recent' => array_slice(Ticket::forUser((int)auth_id()), 0, 5),
            'unread' => Notification::unreadCount((int)auth_id()),
        ]);
    }

    public function notifications(): void {
        AuthMiddleware::handle();
        view('tickets/notifications', [
            'title' => 'Notifications',
            'items' => Notification::forUser((int)auth_id()),
        ]);
    }

    public function markNotificationRead(int $id): void {
        AuthMiddleware::handle();
        csrf_verify();
        Notification::markRead($id, (int)auth_id());
        redirect('/notifications');
    }

    public function markAllRead(): void {
        AuthMiddleware::handle();
        csrf_verify();
        Notification::markAllRead((int)auth_id());
        redirect('/notifications');
    }
}
