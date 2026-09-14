<?php
declare(strict_types=1);


/**
 * Escape HTML output safely.
 */
function e(?string $v): string
{
    return htmlspecialchars((string)$v, ENT_QUOTES, 'UTF-8');
}


/**
 * Generate a URL inside the application.
 */
function url(string $path = ''): string
{
    $scriptName = str_replace('\\', '/', $_SERVER['SCRIPT_NAME'] ?? '');

    $basePath = rtrim(dirname($scriptName), '/');

    if ($path === '') {
        return $basePath ?: '/';
    }

    if ($path[0] !== '/') {
        $path = '/' . $path;
    }

    // Prevent the base path from being added twice.
    if ($basePath !== '' && str_starts_with($path, $basePath . '/')) {
        return $path;
    }

    return $basePath . $path;
}


/**
 * Redirect to an application URL.
 */
function redirect(string $path): void
{
    header('Location: ' . url($path));
    exit;
}


/**
 * Return a JSON response.
 */
function json_response($data, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}


/**
 * Flash messages.
 */
function flash(string $key, ?string $msg = null)
{
    if ($msg === null) {
        $val = $_SESSION['_flash'][$key] ?? null;
        unset($_SESSION['_flash'][$key]);
        return $val;
    }

    $_SESSION['_flash'][$key] = $msg;
}


/**
 * Retrieve old form input.
 */
function old(string $key, string $default = ''): string
{
    return (string)($_SESSION['_old'][$key] ?? $default);
}


/**
 * Remember old form input.
 */
function remember_old(array $data): void
{
    $_SESSION['_old'] = $data;
}


/**
 * Clear old form input.
 */
function clear_old(): void
{
    unset($_SESSION['_old']);
}


/**
 * Write an application log entry.
 */
function log_event(string $msg): void
{
    @file_put_contents(
        LOG_PATH . '/app.log',
        '[' . date('c') . '] ' . $msg . PHP_EOL,
        FILE_APPEND
    );
}


/**
 * Render a view inside the application layout.
 */
function view(string $template, array $data = []): void
{
    extract($data, EXTR_SKIP);

    require BASE_PATH . '/app/views/layouts/header.php';
    require BASE_PATH . '/app/views/' . $template . '.php';
    require BASE_PATH . '/app/views/layouts/footer.php';
}


/**
 * Generate a unique ticket number.
 */
function generate_ticket_no(): string
{
    return 'TKT-' . strtoupper(bin2hex(random_bytes(3)));
}

/**
 * Render the shared authorization error page without changing the response code.
 */
function forbidden(string $message = 'You do not have permission to access this area.'): never
{
    http_response_code(403);
    view('errors/403', [
        'title' => 'Access denied',
        'message' => $message,
    ]);
    exit;
}