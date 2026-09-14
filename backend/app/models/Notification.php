<?php
declare(strict_types=1);

final class Notification
{
    public static function create(int $userId, string $title, string $message): void {
        $s = Database::conn()->prepare(
            'INSERT INTO notifications (user_id, title, message, is_read, created_at)
             VALUES (?, ?, ?, 0, NOW())'
        );
        $s->execute([$userId, $title, $message]);
    }
    public static function forUser(int $userId, int $limit = 50): array {
        $s = Database::conn()->prepare(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?'
        );
        $s->bindValue(1, $userId, PDO::PARAM_INT);
        $s->bindValue(2, $limit, PDO::PARAM_INT);
        $s->execute();
        return $s->fetchAll();
    }
    public static function markRead(int $id, int $userId): void {
        $s = Database::conn()->prepare('UPDATE notifications SET is_read=1 WHERE id=? AND user_id=?');
        $s->execute([$id, $userId]);
    }
    public static function markAllRead(int $userId): void {
        $s = Database::conn()->prepare('UPDATE notifications SET is_read=1 WHERE user_id=?');
        $s->execute([$userId]);
    }
    public static function unreadCount(int $userId): int {
        $s = Database::conn()->prepare('SELECT COUNT(*) FROM notifications WHERE user_id=? AND is_read=0');
        $s->execute([$userId]);
        return (int)$s->fetchColumn();
    }

    public static function unreadForUser(int $userId): array
    {
        return array_filter(self::forUser($userId), static fn(array $item): bool => !(bool)$item['is_read']);
    }

    public static function hasUnread(int $userId): bool
    {
        return self::unreadCount($userId) > 0;
    }
}
