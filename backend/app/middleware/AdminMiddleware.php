<?php
declare(strict_types=1);

final class AdminMiddleware
{
    public static function handle(): void {
        AuthMiddleware::handle();
        if (!auth_is_admin()) {
            http_response_code(403);
            exit('Forbidden — admin only.');
        }
    }
}
