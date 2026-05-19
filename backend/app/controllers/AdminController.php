<?php
declare(strict_types=1);

final class AdminController
{
    public function dashboard(): void {
        AdminMiddleware::handle();
        view('admin/dashboard', [
            'title' => 'Admin dashboard',
            'stats' => Ticket::stats(),
            'users' => User::count(),
            'activity' => ActivityLog::recent(10),
        ]);
    }

    public function tickets(): void {
        AdminMiddleware::handle();
        $filters = [
            'status'   => $_GET['status']   ?? null,
            'priority' => $_GET['priority'] ?? null,
            'q'        => $_GET['q']        ?? null,
        ];
        view('admin/tickets', [
            'title' => 'All tickets',
            'tickets' => Ticket::all($filters),
            'filters' => $filters,
        ]);
    }

    public function updateStatus(int $id): void {
        AdminMiddleware::handle();
        csrf_verify();
        $status = (string)($_POST['status'] ?? '');
        if (!in_array($status, Ticket::STATUSES, true)) {
            flash('error', 'Invalid status.'); redirect('/admin/tickets');
        }
        $t = Ticket::find($id);
        if (!$t) { http_response_code(404); exit('Not found.'); }
        Ticket::update($id, ['status' => $status]);
        Notification::create((int)$t['user_id'], 'Status updated', $t['ticket_no'] . ' is now ' . $status);
        ActivityLog::log(auth_id(), 'ticket.status', "Set #$id to $status");
        flash('success', 'Status updated.');
        redirect('/tickets/' . $id);
    }

    public function updatePriority(int $id): void {
        AdminMiddleware::handle();
        csrf_verify();
        $p = (string)($_POST['priority'] ?? '');
        if (!in_array($p, Ticket::PRIORITIES, true)) { flash('error', 'Bad priority.'); redirect('/tickets/' . $id); }
        Ticket::update($id, ['priority' => $p]);
        ActivityLog::log(auth_id(), 'ticket.priority', "Set #$id priority $p");
        redirect('/tickets/' . $id);
    }

    public function assign(int $id): void {
        AdminMiddleware::handle();
        csrf_verify();
        $aid = (int)($_POST['assigned_to'] ?? 0) ?: null;
        Ticket::update($id, ['assigned_to' => $aid]);
        ActivityLog::log(auth_id(), 'ticket.assign', "Assigned #$id to " . ($aid ?? 'nobody'));
        redirect('/tickets/' . $id);
    }

    public function users(): void {
        AdminMiddleware::handle();
        view('admin/users', ['title' => 'Users', 'users' => User::all()]);
    }

    public function setUserStatus(int $id): void {
        AdminMiddleware::handle();
        csrf_verify();
        $status = (string)($_POST['status'] ?? '');
        if (!in_array($status, ['active','suspended'], true)) { flash('error','Bad status.'); redirect('/admin/users'); }
        User::setStatus($id, $status);
        ActivityLog::log(auth_id(), 'user.status', "User #$id -> $status");
        flash('success', 'User updated.');
        redirect('/admin/users');
    }
}
