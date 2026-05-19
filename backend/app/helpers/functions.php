<?php
declare(strict_types=1);

function e(?string $v): string { return htmlspecialchars((string)$v, ENT_QUOTES, 'UTF-8'); }

function redirect(string $path): void {
    header('Location: ' . $path);
    exit;
}

function json_response($data, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function flash(string $key, ?string $msg = null) {
    if ($msg === null) {
        $val = $_SESSION['_flash'][$key] ?? null;
        unset($_SESSION['_flash'][$key]);
        return $val;
    }
    $_SESSION['_flash'][$key] = $msg;
}

function old(string $key, string $default = ''): string {
    return (string)($_SESSION['_old'][$key] ?? $default);
}
function remember_old(array $data): void { $_SESSION['_old'] = $data; }
function clear_old(): void { unset($_SESSION['_old']); }

function log_event(string $msg): void {
    @file_put_contents(LOG_PATH . '/app.log',
        '[' . date('c') . '] ' . $msg . PHP_EOL, FILE_APPEND);
}

function view(string $template, array $data = []): void {
    extract($data, EXTR_SKIP);
    require BASE_PATH . '/app/views/layouts/header.php';
    require BASE_PATH . '/app/views/' . $template . '.php';
    require BASE_PATH . '/app/views/layouts/footer.php';
}

function generate_ticket_no(): string {
    return 'TKT-' . strtoupper(bin2hex(random_bytes(3)));
}
