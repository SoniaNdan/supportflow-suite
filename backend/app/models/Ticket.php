<?php
declare(strict_types=1);

final class Ticket
{
    public const STATUSES   = ['open', 'pending', 'in_progress', 'resolved', 'closed'];
    public const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

    public static function create(array $d): int
    {
        $s = Database::conn()->prepare(
            'INSERT INTO tickets (
                ticket_no,
                user_id,
                title,
                category,
                priority,
                description,
                attachment_path,
                status,
                created_at,
                updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, "open", NOW(), NOW())'
        );

        $s->execute([
            generate_ticket_no(),
            $d['user_id'],
            $d['title'],
            $d['category'],
            $d['priority'],
            $d['description'],
            $d['attachment_path'] ?? null,
        ]);

        return (int) Database::conn()->lastInsertId();
    }

    public static function find(int $id): ?array
    {
        $s = Database::conn()->prepare(
            'SELECT
                t.*,
                u.name AS user_name,
                u.email AS user_email,
                a.name AS assigned_name,
                a.email AS assigned_email
             FROM tickets t
             JOIN users u ON u.id = t.user_id
             LEFT JOIN users a ON a.id = t.assigned_to
             WHERE t.id = ?'
        );

        $s->execute([$id]);

        $r = $s->fetch();

        return $r ?: null;
    }

    public static function findByNo(string $no): ?array
    {
        $s = Database::conn()->prepare(
            'SELECT
                t.*,
                u.name AS user_name,
                     u.email AS user_email,
                     a.name AS assigned_name,
                     a.email AS assigned_email
             FROM tickets t
             JOIN users u ON u.id = t.user_id
                 LEFT JOIN users a ON a.id = t.assigned_to
             WHERE t.ticket_no = ?'
        );

        $s->execute([$no]);

        $r = $s->fetch();

        return $r ?: null;
    }

    /**
     * Get tickets belonging to a specific user.
     */
    public static function forUser(int $userId, array $filters = [], bool $isAdmin = false): array
    {
        $sql = '
            SELECT
                t.*,
                u.name AS user_name,
                u.email AS user_email,
                a.name AS assigned_name,
                a.email AS assigned_email,
                tr.last_read_at,
                CASE WHEN COALESCE(tr.last_read_at, "1000-01-01") < GREATEST(t.updated_at, COALESCE(ta.last_activity_at, t.created_at))
                     THEN 1 ELSE 0 END AS is_unread
            FROM tickets t
            JOIN users u ON u.id = t.user_id
            LEFT JOIN users a ON a.id = t.assigned_to
            LEFT JOIN ticket_reads tr ON tr.ticket_id = t.id AND tr.user_id = ?
            LEFT JOIN (
                SELECT ticket_id, MAX(created_at) AS last_activity_at
                FROM replies
                WHERE is_internal_note = 0 OR ? = 1
                GROUP BY ticket_id
            ) ta ON ta.ticket_id = t.id
            WHERE t.user_id = ?
        ';

        $args = [$userId, $isAdmin ? 1 : 0, $userId];

        self::applyFilters($sql, $args, $filters);

        $sql .= ' ORDER BY t.created_at DESC';

        $s = Database::conn()->prepare($sql);
        $s->execute($args);

        return $s->fetchAll();
    }

    /**
     * Get all tickets for administrators.
     */
    public static function all(array $filters = [], ?int $userId = null, bool $systemAdmin = true): array
    {
        $sql = '
            SELECT
                t.*,
                u.name AS user_name,
                u.email AS user_email,
                a.name AS assigned_name,
                a.email AS assigned_email,
                tr.last_read_at,
                CASE WHEN COALESCE(tr.last_read_at, "1000-01-01") < GREATEST(t.updated_at, COALESCE(ta.last_activity_at, t.created_at))
                     THEN 1 ELSE 0 END AS is_unread
            FROM tickets t
            JOIN users u ON u.id = t.user_id
            LEFT JOIN users a ON a.id = t.assigned_to
            LEFT JOIN ticket_reads tr ON tr.ticket_id = t.id AND tr.user_id = ?
            LEFT JOIN (
                SELECT ticket_id, MAX(created_at) AS last_activity_at
                FROM replies
                GROUP BY ticket_id
            ) ta ON ta.ticket_id = t.id
            WHERE 1=1
        ';

        $args = [$userId ?? 0];

        if (!$systemAdmin) {
            $sql .= ' AND t.assigned_to = ?';
            $args[] = $userId;
        }

        self::applyFilters($sql, $args, $filters);

        $sql .= ' ORDER BY t.created_at DESC';

        $s = Database::conn()->prepare($sql);
        $s->execute($args);

        return $s->fetchAll();
    }

    public static function markRead(int $ticketId, int $userId): void
    {
        $s = Database::conn()->prepare(
            'INSERT INTO ticket_reads (ticket_id, user_id, last_read_at)
             VALUES (?, ?, NOW())
             ON DUPLICATE KEY UPDATE last_read_at = NOW()'
        );
        $s->execute([$ticketId, $userId]);
    }

    /**
     * Apply search and filter conditions.
     */
    private static function applyFilters(
        string &$sql,
        array &$args,
        array $filters
    ): void {

        /*
         * STATUS FILTER
         *
         * Only apply when a real status was selected.
         */
        if (
            isset($filters['status']) &&
            $filters['status'] !== '' &&
            in_array($filters['status'], self::STATUSES, true)
        ) {
            $sql .= ' AND t.status = ?';
            $args[] = $filters['status'];
        }

        /*
         * PRIORITY FILTER
         *
         * Only apply when a real priority was selected.
         */
        if (
            isset($filters['priority']) &&
            $filters['priority'] !== '' &&
            in_array($filters['priority'], self::PRIORITIES, true)
        ) {
            $sql .= ' AND t.priority = ?';
            $args[] = $filters['priority'];
        }

        if (isset($filters['assigned_to']) && $filters['assigned_to'] !== '') {
            $sql .= ' AND t.assigned_to = ?';
            $args[] = (int) $filters['assigned_to'];
        }

        /*
         * SEARCH BOX
         *
         * Search across:
         * - Ticket number
         * - Title
         * - Description
         * - Category
         * - Priority
         * - Status
         * - User name
         * - User email
         */
        if (isset($filters['q'])) {

            $q = trim((string) $filters['q']);

            if ($q !== '') {

                $sql .= '
                    AND (
                        t.ticket_no LIKE ?
                        OR t.title LIKE ?
                        OR t.description LIKE ?
                        OR t.category LIKE ?
                        OR t.priority LIKE ?
                        OR t.status LIKE ?
                        OR u.name LIKE ?
                        OR u.email LIKE ?
                    )
                ';

                $search = '%' . $q . '%';

                $args[] = $search;
                $args[] = $search;
                $args[] = $search;
                $args[] = $search;
                $args[] = $search;
                $args[] = $search;
                $args[] = $search;
                $args[] = $search;
            }
        }
    }

    /**
     * Update allowed ticket fields.
     */
    public static function update(int $id, array $fields): void
    {
        $allowed = [
            'title',
            'category',
            'priority',
            'description',
            'status',
            'assigned_to'
        ];

        $set = [];
        $args = [];

        foreach ($fields as $k => $v) {

            if (in_array($k, $allowed, true)) {
                $set[] = "$k = ?";
                $args[] = $v;
            }
        }

        if (!$set) {
            return;
        }

        $args[] = $id;

        $sql = '
            UPDATE tickets
            SET ' . implode(', ', $set) . ',
                updated_at = NOW()
            WHERE id = ?
        ';

        Database::conn()
            ->prepare($sql)
            ->execute($args);
    }

    /**
     * Ticket statistics.
     */
    public static function stats(?int $userId = null): array
    {
        $where = $userId
            ? 'WHERE user_id = ' . (int) $userId
            : '';

        $pdo = Database::conn();

        return [
            'total' => (int) $pdo
                ->query("SELECT COUNT(*) FROM tickets $where")
                ->fetchColumn(),

            'open' => (int) $pdo
                ->query(
                    "SELECT COUNT(*)
                     FROM tickets
                     $where" .
                    ($where ? ' AND ' : ' WHERE ') .
                    "status = 'open'"
                )
                ->fetchColumn(),

            'in_progress' => (int) $pdo
                ->query(
                    "SELECT COUNT(*)
                     FROM tickets
                     $where" .
                    ($where ? ' AND ' : ' WHERE ') .
                    "status = 'in_progress'"
                )
                ->fetchColumn(),

            'resolved' => (int) $pdo
                ->query(
                    "SELECT COUNT(*)
                     FROM tickets
                     $where" .
                    ($where ? ' AND ' : ' WHERE ') .
                    "status = 'resolved'"
                )
                ->fetchColumn(),

            'today' => (int) $pdo
                ->query(
                    "SELECT COUNT(*)
                     FROM tickets
                     $where" .
                    ($where ? ' AND ' : ' WHERE ') .
                    "DATE(created_at) = CURDATE()"
                )
                ->fetchColumn(),
        ];
    }

    public static function adminStats(?int $assignedTo = null): array
    {
        $where = $assignedTo === null ? '' : ' WHERE assigned_to = ' . (int) $assignedTo;
        $pdo = Database::conn();
        $stats = ['total' => 0, 'unassigned' => 0, 'open' => 0, 'in_progress' => 0, 'pending' => 0, 'resolved' => 0, 'closed' => 0];

        foreach (array_keys($stats) as $status) {
            if ($status === 'total') {
                $stats[$status] = (int) $pdo->query("SELECT COUNT(*) FROM tickets$where")->fetchColumn();
            } elseif ($status === 'unassigned') {
                $stats[$status] = (int) $pdo->query("SELECT COUNT(*) FROM tickets" . ($where ? $where . ' AND' : ' WHERE') . ' assigned_to IS NULL')->fetchColumn();
            } else {
                $stats[$status] = (int) $pdo->query("SELECT COUNT(*) FROM tickets" . ($where ? $where . ' AND' : ' WHERE') . ' status = ' . $pdo->quote($status))->fetchColumn();
            }
        }

        return $stats;
    }
}