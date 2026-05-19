<?php
declare(strict_types=1);

final class Ticket
{
    public const STATUSES   = ['open','pending','in_progress','resolved','closed'];
    public const PRIORITIES = ['low','medium','high','urgent'];

    public static function create(array $d): int {
        $s = Database::conn()->prepare(
            'INSERT INTO tickets (ticket_no, user_id, title, category, priority, description, attachment_path, status, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, "open", NOW(), NOW())'
        );
        $s->execute([
            generate_ticket_no(),
            $d['user_id'], $d['title'], $d['category'],
            $d['priority'], $d['description'], $d['attachment_path'] ?? null,
        ]);
        return (int)Database::conn()->lastInsertId();
    }

    public static function find(int $id): ?array {
        $s = Database::conn()->prepare(
            'SELECT t.*, u.name AS user_name, u.email AS user_email
             FROM tickets t JOIN users u ON u.id = t.user_id WHERE t.id = ?'
        );
        $s->execute([$id]);
        $r = $s->fetch();
        return $r ?: null;
    }

    public static function findByNo(string $no): ?array {
        $s = Database::conn()->prepare(
            'SELECT t.*, u.name AS user_name, u.email AS user_email
             FROM tickets t JOIN users u ON u.id = t.user_id WHERE t.ticket_no = ?'
        );
        $s->execute([$no]);
        $r = $s->fetch();
        return $r ?: null;
    }

    public static function forUser(int $userId, array $filters = []): array {
        $sql = 'SELECT * FROM tickets WHERE user_id = ?';
        $args = [$userId];
        self::applyFilters($sql, $args, $filters);
        $sql .= ' ORDER BY created_at DESC';
        $s = Database::conn()->prepare($sql);
        $s->execute($args);
        return $s->fetchAll();
    }

    public static function all(array $filters = []): array {
        $sql = 'SELECT t.*, u.name AS user_name FROM tickets t JOIN users u ON u.id = t.user_id WHERE 1=1';
        $args = [];
        self::applyFilters($sql, $args, $filters);
        $sql .= ' ORDER BY t.created_at DESC';
        $s = Database::conn()->prepare($sql);
        $s->execute($args);
        return $s->fetchAll();
    }

    private static function applyFilters(string &$sql, array &$args, array $filters): void {
        if (!empty($filters['status'])) {
            $sql .= ' AND status = ?';
            $args[] = $filters['status'];
        }
        if (!empty($filters['priority'])) {
            $sql .= ' AND priority = ?';
            $args[] = $filters['priority'];
        }
        if (!empty($filters['q'])) {
            $sql .= ' AND (title LIKE ? OR ticket_no LIKE ? OR description LIKE ?)';
            $q = '%' . $filters['q'] . '%';
            array_push($args, $q, $q, $q);
        }
    }

    public static function update(int $id, array $fields): void {
        $allowed = ['title','category','priority','description','status','assigned_to'];
        $set = []; $args = [];
        foreach ($fields as $k => $v) {
            if (in_array($k, $allowed, true)) { $set[] = "$k = ?"; $args[] = $v; }
        }
        if (!$set) return;
        $args[] = $id;
        $sql = 'UPDATE tickets SET ' . implode(', ', $set) . ', updated_at = NOW() WHERE id = ?';
        Database::conn()->prepare($sql)->execute($args);
    }

    public static function stats(?int $userId = null): array {
        $where = $userId ? 'WHERE user_id = ' . (int)$userId : '';
        $pdo = Database::conn();
        return [
            'total'       => (int)$pdo->query("SELECT COUNT(*) FROM tickets $where")->fetchColumn(),
            'open'        => (int)$pdo->query("SELECT COUNT(*) FROM tickets $where" . ($where ? ' AND ' : ' WHERE ') . "status='open'")->fetchColumn(),
            'in_progress' => (int)$pdo->query("SELECT COUNT(*) FROM tickets $where" . ($where ? ' AND ' : ' WHERE ') . "status='in_progress'")->fetchColumn(),
            'resolved'    => (int)$pdo->query("SELECT COUNT(*) FROM tickets $where" . ($where ? ' AND ' : ' WHERE ') . "status='resolved'")->fetchColumn(),
            'today'       => (int)$pdo->query("SELECT COUNT(*) FROM tickets $where" . ($where ? ' AND ' : ' WHERE ') . "DATE(created_at)=CURDATE()")->fetchColumn(),
        ];
    }
}
