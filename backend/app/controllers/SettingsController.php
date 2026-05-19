<?php
declare(strict_types=1);

final class SettingsController
{
    public function index(): void {
        AuthMiddleware::handle();
        view('tickets/settings', ['title' => 'Settings', 'user' => User::find((int)auth_id())]);
    }

    public function updateProfile(): void {
        AuthMiddleware::handle();
        csrf_verify();
        $v = (new Validator($_POST))->required('name')->required('email')->email('email');
        if (!$v->passes()) { flash('error', implode(' ', $v->errors)); redirect('/settings'); }
        User::updateProfile((int)auth_id(), trim((string)$_POST['name']), trim((string)$_POST['email']));
        flash('success', 'Profile updated.');
        redirect('/settings');
    }

    public function changePassword(): void {
        AuthMiddleware::handle();
        csrf_verify();
        $u = User::find((int)auth_id());
        if (!$u || !password_verify((string)$_POST['current_password'], $u['password_hash'])) {
            flash('error', 'Current password incorrect.'); redirect('/settings');
        }
        if (strlen((string)$_POST['new_password']) < 8) { flash('error','Password must be 8+ chars.'); redirect('/settings'); }
        User::updatePassword((int)auth_id(), password_hash((string)$_POST['new_password'], PASSWORD_BCRYPT));
        flash('success', 'Password changed.');
        redirect('/settings');
    }
}
