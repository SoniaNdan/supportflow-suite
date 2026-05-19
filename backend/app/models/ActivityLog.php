<?php
declare(strict_types=1);

final class ActivityLog
{
    public static function log(?int $userId, string $action, string $description): void {
        $s = Database::conn()->prepare(
            'INSERT INTO activity_logs (user_id, action, description, ip_address, created_at)
             VALUES (?, ?, ?, ?, NOW())'
        );
        $s->execute([$userId, $action, $description, $_SERVER['REMOTE_ADDR'] ?? null]);
    }
    public static function recent(int $limit = 20): array {
        $s = Database::conn()->prepare(
            'SELECT a.*, u.name AS user_name FROM activity_logs a
             LEFT JOIN users u ON u.id = a.user_id
             ORDER BY a.created_at DESC LIMIT ?'
        );
        $s->bindValue(1, $limit, PDO::PARAM_INT);
        $s->execute();
        return $s->fetchAll();
    }
}
