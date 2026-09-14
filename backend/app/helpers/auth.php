<?php
declare(strict_types=1);

function auth_user(): ?array {
    return $_SESSION['user'] ?? null;
}
function auth_check(): bool { return auth_user() !== null; }
function auth_id(): ?int { return auth_user()['id'] ?? null; }
function auth_is_admin(): bool { return (auth_user()['role'] ?? '') === 'admin'; }
function auth_is_support_admin(): bool
{
    return auth_is_admin() && (auth_user()['admin_level'] ?? '') === 'support_admin';
}
function auth_is_system_admin(): bool
{
    return auth_is_admin() && (auth_user()['admin_level'] ?? '') === 'system_admin';
}

function auth_login(array $user): void {
    session_regenerate_id(true);
    $_SESSION['user'] = [
        'id' => (int)$user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'role' => $user['role'],
        'admin_level' => $user['admin_level'] ?? null,
    ];
}

function auth_logout(): void {
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $p['path'], $p['domain'], $p['secure'], $p['httponly']);
    }
    session_destroy();
}
