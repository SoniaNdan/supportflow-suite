<?php

// error_reporting(E_ALL);
// ini_set('display_errors', 1);

declare(strict_types=1);

// Bootstrap
require __DIR__ . '/../app/config/config.php';
require __DIR__ . '/../app/config/database.php';

// Helpers
foreach (['functions','csrf','auth','validation','uploads'] as $h) {
    require __DIR__ . "/../app/helpers/$h.php";
}

// Middleware + models + controllers (simple autoload)
spl_autoload_register(function ($class) {
    foreach (['middleware','models','controllers'] as $dir) {
        $f = __DIR__ . "/../app/$dir/$class.php";
        if (is_file($f)) { require $f; return; }
    }
});

$method = $_SERVER['REQUEST_METHOD'];

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/';

// Base folder where the backend is installed
$basePath = '/dashboard/PROJECTS/supportflow-suite/backend/public';

// Remove the base path from the request
if (str_starts_with($uri, $basePath)) {
    $uri = substr($uri, strlen($basePath));
}

$path = '/' . trim($uri, '/');

if ($path === '//') {
    $path = '/';
}

if ($path === '') {
    $path = '/';
}

// API
if (str_starts_with($path, '/api/')) {
    $api = require __DIR__ . '/../routes/api.php';
    $api($method, $path);
    exit;
}

// Web routes
$routes = require __DIR__ . '/../routes/web.php';
foreach ($routes as [$m, $pattern, $handler]) {
    if ($m !== $method) continue;
    $regex = '#^' . preg_replace('#\{id\}#', '(\d+)', $pattern) . '$#';
    if (preg_match($regex, $path, $matches)) {
        [$class, $fn] = $handler;
        $controller = new $class();
        array_shift($matches);
        $args = array_map('intval', $matches);
        try {
            $controller->$fn(...$args);
        } catch (Throwable $e) {
            log_event('ERROR: ' . $e->getMessage() . ' @ ' . $e->getFile() . ':' . $e->getLine());
            http_response_code(500);
            require __DIR__ . '/../app/views/errors/500.php';
        }
        exit;
    }
}

http_response_code(404);
require __DIR__ . '/../app/views/errors/404.php';
