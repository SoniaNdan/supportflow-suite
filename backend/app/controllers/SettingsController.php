<?php
declare(strict_types=1);

final class SettingsController
{
    public function index(): void
    {
        AuthMiddleware::handle();

        view('tickets/settings', [
            'title' => 'Settings',
            'user' => User::find((int) auth_id()),
        ]);
    }

    public function updateProfile(): void
    {
        AuthMiddleware::handle();
        csrf_verify();

        $name = trim((string) ($_POST['name'] ?? ''));
        $email = trim((string) ($_POST['email'] ?? ''));

        $v = (new Validator([
            'name' => $name,
            'email' => $email,
        ]))
            ->required('name')
            ->required('email')
            ->email('email');

        if (!$v->passes()) {
            flash('error', implode(' ', $v->errors));
            redirect(url('/settings'));
        }

        // Check if another user already owns this email
        $existing = User::findByEmail($email);

        if ($existing && (int) $existing['id'] !== (int) auth_id()) {
            flash('error', 'That email address is already in use.');
            redirect(url('/settings'));
        }

        User::updateProfile(
            (int) auth_id(),
            $name,
            $email
        );

        flash('success', 'Profile updated successfully.');
        redirect(url('/settings'));
    }

    public function changePassword(): void
    {
        AuthMiddleware::handle();
        csrf_verify();

        $currentPassword = (string) ($_POST['current_password'] ?? '');
        $newPassword = (string) ($_POST['new_password'] ?? '');
        $confirmPassword = (string) ($_POST['confirm_password'] ?? '');

        // Get logged-in user
        $user = User::find((int) auth_id());

        if (!$user) {
            flash('error', 'Unable to find your account.');
            redirect(url('/settings'));
        }

        // Check current password
        if (
            $currentPassword === '' ||
            !password_verify($currentPassword, $user['password_hash'])
        ) {
            flash('error', 'Current password is incorrect.');
            redirect(url('/settings'));
        }

        // Check minimum password length
        if (strlen($newPassword) < 8) {
            flash('error', 'New password must be at least 8 characters.');
            redirect(url('/settings'));
        }

        // Check confirmation
        if ($newPassword !== $confirmPassword) {
            flash('error', 'New password and confirmation password do not match.');
            redirect(url('/settings'));
        }

        // Prevent using the same password
        if (password_verify($newPassword, $user['password_hash'])) {
            flash('error', 'Your new password must be different from your current password.');
            redirect(url('/settings'));
        }

        // Update password
        User::updatePassword(
            (int) auth_id(),
            password_hash($newPassword, PASSWORD_BCRYPT)
        );

        flash('success', 'Password changed successfully.');
        redirect(url('/settings'));
    }
}