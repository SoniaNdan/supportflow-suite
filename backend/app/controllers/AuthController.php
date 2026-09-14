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
                'DELETE FROM password_resets WHERE user_id = ? OR expires_at < NOW()'
            );
            $s->execute([(int)$u['id']]);
            $s = Database::conn()->prepare(
                'INSERT INTO password_resets (user_id, token_hash, expires_at, created_at)
                 VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR), NOW())'
            );
            $s->execute([$u['id'], hash('sha256', $token)]);
            $resetLink = BASE_URL . '/reset-password?token=' . urlencode($token);
            $mailBody = "Use this link within one hour to reset your ResolveDesk password:\n\n" . $resetLink;
            $sent = @mail($email, 'ResolveDesk password reset', $mailBody, "From: " . (getenv('MAIL_FROM') ?: 'no-reply@localhost'));
            if (!$sent) {
                log_event("Password reset link for {$email}: " . $resetLink);
            }
        }
        flash('success', 'If an account with that email exists, a password reset link has been sent.');
        redirect('/login');
    }

    public function showReset(): void {
        $token = (string)($_GET['token'] ?? '');
        $valid = false;
        if (preg_match('/^[a-f0-9]{64}$/', $token)) {
            $s = Database::conn()->prepare(
                'SELECT id FROM password_resets WHERE token_hash = ? AND used_at IS NULL AND expires_at > NOW() LIMIT 1'
            );
            $s->execute([hash('sha256', $token)]);
            $valid = (bool)$s->fetchColumn();
        }
        view('auth/reset', ['title' => 'Reset password', 'token' => $token, 'valid' => $valid]);
    }

    public function reset(): void {
        csrf_verify();
        $token = (string)($_POST['token'] ?? '');
        $pw = (string)($_POST['password'] ?? '');
        $confirm = (string)($_POST['password_confirmation'] ?? '');
        if (strlen($pw) < 8 || $pw !== $confirm) {
            flash('error', $pw !== $confirm ? 'Passwords do not match.' : 'Password must be at least 8 characters.');
            redirect('/reset-password?token=' . urlencode($token));
        }
        $s = Database::conn()->prepare(
            'SELECT * FROM password_resets WHERE token_hash = ? AND used_at IS NULL AND expires_at > NOW() ORDER BY id DESC LIMIT 1'
        );
        $s->execute([hash('sha256', $token)]);
        $row = $s->fetch();
        if (!$row) { flash('error', 'That reset link is invalid or expired.'); redirect('/forgot-password'); }
        User::updatePassword((int)$row['user_id'], password_hash($pw, PASSWORD_BCRYPT));
        Database::conn()->prepare('UPDATE password_resets SET used_at = NOW() WHERE id = ?')->execute([$row['id']]);
        flash('success', 'Password updated. Please sign in.');
        redirect('/login');
    }
}
