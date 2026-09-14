<?php
declare(strict_types=1);

final class AdminMiddleware
{
    public static function handle(): void {
        AuthMiddleware::handle();
        if (!auth_is_admin()) {
            forbidden('This area is restricted to administrators.');
        }
    }
}

final class SupportAdminMiddleware
{
    public static function handle(): void
    {
        AdminMiddleware::handle();
        if (!auth_is_support_admin()) {
            forbidden('This area is restricted to Support Administrators.');
        }
    }
}

final class SystemAdminMiddleware
{
    public static function handle(): void
    {
        AdminMiddleware::handle();
        if (!auth_is_system_admin()) {
            forbidden("You don't have permission to manage users. This area is restricted to System Administrators.");
        }
    }
}
