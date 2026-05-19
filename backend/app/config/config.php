<?php
// Global app configuration
declare(strict_types=1);

session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'httponly' => true,
    'samesite' => 'Lax',
    'secure' => isset($_SERVER['HTTPS']),
]);
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

define('APP_NAME', 'ResolveDesk');
define('BASE_PATH', dirname(__DIR__, 2));
define('PUBLIC_PATH', BASE_PATH . '/public');
define('UPLOAD_PATH', PUBLIC_PATH . '/uploads');
define('LOG_PATH', BASE_PATH . '/storage/logs');
define('BASE_URL', (isset($_SERVER['HTTPS']) ? 'https' : 'http') . '://' . ($_SERVER['HTTP_HOST'] ?? 'localhost'));

define('MAX_UPLOAD_BYTES', 5 * 1024 * 1024); // 5 MB
define('ALLOWED_UPLOAD_MIME', [
    'image/png', 'image/jpeg', 'image/gif', 'image/webp',
    'application/pdf', 'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

ini_set('display_errors', '0');
ini_set('log_errors', '1');
ini_set('error_log', LOG_PATH . '/php-error.log');
error_reporting(E_ALL);

date_default_timezone_set('UTC');
