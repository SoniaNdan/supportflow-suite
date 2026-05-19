<?php
declare(strict_types=1);

final class AuthMiddleware
{
    public static function handle(): void {
        if (!auth_check()) {
            flash('error', 'Please sign in to continue.');
            redirect('/login');
        }
    }
}
