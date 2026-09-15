<?php
declare(strict_types=1);


final class User
{
    public static function findByEmail(string $email): ?array
    {
        $s = Database::conn()->prepare(
            'SELECT * FROM users WHERE email = ?'
        );

        $s->execute([$email]);

        $r = $s->fetch();

        return $r ?: null;
    }


    public static function find(int $id): ?array
    {
        $s = Database::conn()->prepare(
            'SELECT * FROM users WHERE id = ?'
        );

        $s->execute([$id]);

        $r = $s->fetch();

        return $r ?: null;
    }


    public static function create(
        string $name,
        string $email,
        string $passwordHash,
        string $role = 'user',
        ?string $adminLevel = null
    ): int {
        $s = Database::conn()->prepare(
            'INSERT INTO users
            (name, email, password_hash, role, admin_level, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, "active", NOW(), NOW())'
        );

        $effectiveLevel = $role === 'admin'
            ? ($adminLevel ?: 'support_admin')
            : null;

        $s->execute([
            $name,
            $email,
            $passwordHash,
            $role,
            $effectiveLevel
        ]);

        return (int) Database::conn()->lastInsertId();
    }

    public static function isSystemAdmin(int $id): bool
    {
        $user = self::find($id);
        return $user !== null && (string)($user['role'] ?? '') === 'admin' && (string)($user['admin_level'] ?? '') === 'system_admin';
    }

    public static function isSupportAdmin(int $id): bool
    {
        $user = self::find($id);
        return $user !== null && (string)($user['role'] ?? '') === 'admin' && (string)($user['admin_level'] ?? '') === 'support_admin';
    }


    public static function all(): array
    {
        return Database::conn()->query(
            'SELECT id, name, email, role, admin_level, status, created_at
             FROM users
             ORDER BY created_at DESC'
        )->fetchAll();
    }


    /**
     * Get all active administrators.
     * Used when assigning tickets to admins.
     */
    public static function admins(): array
    {
        return Database::conn()->query(
            "SELECT id, name, email, admin_level
             FROM users
             WHERE role = 'admin'
             AND status = 'active'
             AND admin_level = 'support_admin'
             ORDER BY name ASC"
        )->fetchAll();
    }


    public static function setStatus(int $id, string $status): void
    {
        $s = Database::conn()->prepare(
            'UPDATE users
             SET status = ?, updated_at = NOW()
             WHERE id = ?'
        );

        $s->execute([
            $status,
            $id
        ]);
    }

    public static function setAdminLevel(int $id, string $level): void
    {
        $s = Database::conn()->prepare(
            'UPDATE users SET admin_level = ?, updated_at = NOW()
             WHERE id = ? AND role = "admin"'
        );
        $s->execute([$level, $id]);
    }


    public static function updatePassword(
        int $id,
        string $hash
    ): void {
        $s = Database::conn()->prepare(
            'UPDATE users
             SET password_hash = ?, updated_at = NOW()
             WHERE id = ?'
        );

        $s->execute([
            $hash,
            $id
        ]);
    }


    public static function updateProfile(
        int $id,
        string $name,
        string $email
    ): void {
        $s = Database::conn()->prepare(
            'UPDATE users
             SET name = ?, email = ?, updated_at = NOW()
             WHERE id = ?'
        );

        $s->execute([
            $name,
            $email,
            $id
        ]);
    }


    public static function count(): int
    {
        return (int) Database::conn()
            ->query('SELECT COUNT(*) FROM users')
            ->fetchColumn();
    }
}