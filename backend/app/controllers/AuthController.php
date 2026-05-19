<?php
declare(strict_types=1);

final class AuthController
{
    public function showLogin(): void {
        view('auth/login', ['title' => 'Sign in']);
    }

    public function login(): void {
        csrf_verify();
        $v = (new Validator($_POST))->required('email')->email('email')->required('password');
        if (!$v->passes()) {
            remember_old(['email' => $_POST['email'] ?? '']);
            flash('error', implode(' ', $v->errors));
            redirect('/login');
        }
        $u = User::findByEmail(trim((string)$_POST['email']));
        if (!$u || !password_verify((string)$_POST['password'], $u['password_hash'])) {
            flash('error', 'Invalid credentials.');
            redirect('/login');
        }
        if (($u['status'] ?? 'active') !== 'active') {
            flash('error', 'Account suspended.');
            redirect('/login');
        }
        auth_login($u);
        ActivityLog::log((int)$u['id'], 'login', 'User signed in');
        redirect(auth_is_admin() ? '/admin/dashboard' : '/dashboard');
    }

    public function showRegister(): void {
        view('auth/register', ['title' => 'Create account']);
    }

    public function register(): void {
        csrf_verify();
        $v = (new Validator($_POST))
            ->required('name')->max('name', 100)
            ->required('email')->email('email')
            ->required('password')->min('password', 8);
        if (!$v->passes()) {
            remember_old($_POST);
            flash('error', implode(' ', $v->errors));
            redirect('/register');
        }
        if (User::findByEmail((string)$_POST['email'])) {
            flash('error', 'Email already registered.');
            redirect('/register');
        }
        $id = User::create(
            trim((string)$_POST['name']),
            trim((string)$_POST['email']),
            password_hash((string)$_POST['password'], PASSWORD_BCRYPT),
        );
        ActivityLog::log($id, 'register', 'New account created');
        flash('success', 'Account created. Please sign in.');
        redirect('/login');
    }

    public function logout(): void {
        if (auth_id()) ActivityLog::log(auth_id(), 'logout', 'User signed out');
        auth_logout();
        redirect('/login');
    }

    public function showForgot(): void { view('auth/forgot', ['title' => 'Forgot password']); }

    public function forgot(): void {
        csrf_verify();
        $email = trim((string)($_POST['email'] ?? ''));
        $u = User::findByEmail($email);
        if ($u) {
            $token = bin2hex(random_bytes(32));
            $s = Database::conn()->prepare(
                'INSERT INTO password_resets (user_id, token, expires_at, created_at)
                 VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR), NOW())'
            );
            $s->execute([$u['id'], hash('sha256', $token)]);
            log_event("Password reset link for {$email}: " . BASE_URL . "/reset-password?token=$token");
        }
        flash('success', 'If that email exists, a reset link has been generated (check storage/logs/app.log in dev).');
        redirect('/login');
    }

    public function showReset(): void {
        $token = (string)($_GET['token'] ?? '');
        view('auth/reset', ['title' => 'Reset password', 'token' => $token]);
    }

    public function reset(): void {
        csrf_verify();
        $token = (string)($_POST['token'] ?? '');
        $pw = (string)($_POST['password'] ?? '');
        if (strlen($pw) < 8) { flash('error', 'Password must be 8+ characters.'); redirect('/reset-password?token=' . urlencode($token)); }
        $s = Database::conn()->prepare(
            'SELECT * FROM password_resets WHERE token = ? AND used_at IS NULL AND expires_at > NOW() ORDER BY id DESC LIMIT 1'
        );
        $s->execute([hash('sha256', $token)]);
        $row = $s->fetch();
        if (!$row) { flash('error', 'Reset link invalid or expired.'); redirect('/login'); }
        User::updatePassword((int)$row['user_id'], password_hash($pw, PASSWORD_BCRYPT));
        Database::conn()->prepare('UPDATE password_resets SET used_at = NOW() WHERE id = ?')->execute([$row['id']]);
        flash('success', 'Password updated. Please sign in.');
        redirect('/login');
    }
}
