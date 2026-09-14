<?php
declare(strict_types=1);

final class Reply
{
    public static function forTicket(int $ticketId, bool $includeInternal): array {
        $sql = 'SELECT r.*, u.name AS user_name, u.role AS user_role
                FROM replies r JOIN users u ON u.id = r.user_id
                WHERE ticket_id = ?';
        if (!$includeInternal) $sql .= ' AND is_internal_note = 0';
        $sql .= ' ORDER BY created_at ASC';
        $s = Database::conn()->prepare($sql);
        $s->execute([$ticketId]);
        return $s->fetchAll();
    }

    public static function create(array $d): int {
        $s = Database::conn()->prepare(
            'INSERT INTO replies (ticket_id, user_id, message, attachment_path, is_internal_note, created_at)
             VALUES (?, ?, ?, ?, ?, NOW())'
        );
        $s->execute([
            $d['ticket_id'], $d['user_id'], $d['message'],
            $d['attachment_path'] ?? null, !empty($d['is_internal_note']) ? 1 : 0,
        ]);
        if (empty($d['is_internal_note'])) {
            Database::conn()->prepare('UPDATE tickets SET updated_at = NOW() WHERE id = ?')
                ->execute([$d['ticket_id']]);
        }
        return (int)Database::conn()->lastInsertId();
    }
}
