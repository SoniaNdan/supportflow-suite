<?php
declare(strict_types=1);

final class AdminController
{
    public function dashboard(): void
    {
        AdminMiddleware::handle();

        $isSystemAdmin = auth_is_system_admin();
        $assignedTo = $isSystemAdmin ? null : (int) auth_id();

        view('admin/dashboard', [
            'title' => $isSystemAdmin ? 'System administration' : 'Support dashboard',
            'isSystemAdmin' => $isSystemAdmin,
            'stats' => Ticket::adminStats($assignedTo),
            'tickets' => Ticket::all([], $assignedTo ?? (int) auth_id(), $isSystemAdmin),
            'users' => $isSystemAdmin ? User::count() : null,
            'activity' => ActivityLog::recent(10),
        ]);
    }

    public function tickets(): void
    {
        AdminMiddleware::handle();

        $filters = [
            'status'   => $_GET['status']   ?? null,
            'priority' => $_GET['priority'] ?? null,
            'q'        => $_GET['q']        ?? null,
            'assigned_to' => auth_is_system_admin() ? ($_GET['assigned_to'] ?? null) : null,
        ];

        view('admin/tickets', [
            'title' => auth_is_system_admin() ? 'All tickets' : 'Assigned tickets',
            'tickets' => Ticket::all($filters, (int) auth_id(), auth_is_system_admin()),
            'filters' => $filters,
            'isSystemAdmin' => auth_is_system_admin(),
            'admins' => auth_is_system_admin() ? User::admins() : [],
        ]);
    }

    public function updateStatus(int $id): void
    {
        AdminMiddleware::handle();
        csrf_verify();

        $status = (string)($_POST['status'] ?? '');

        if (!in_array($status, Ticket::STATUSES, true)) {
            flash('error', 'Invalid status.');
            redirect('/admin/tickets');
        }

        $t = Ticket::find($id);

        if (!$t) {
            http_response_code(404);
            exit('Not found.');
        }

        $this->requireTicketAdminAccess($t);

        if ($t['status'] === $status) {
            flash('success', 'Status unchanged.');
            redirect('/tickets/' . $id);
        }

        Ticket::update($id, [
            'status' => $status
        ]);

        Notification::create(
            (int)$t['user_id'],
            'Status updated',
            $t['ticket_no'] . ' is now ' . $status
        );

        ActivityLog::log(
            auth_id(),
            'ticket.status',
            "Set #$id to $status"
        );

        flash('success', 'Status updated.');

        redirect('/tickets/' . $id);
    }

    public function updatePriority(int $id): void
    {
        AdminMiddleware::handle();
        csrf_verify();

        $t = Ticket::find($id);
        if (!$t) {
            http_response_code(404);
            exit('Not found.');
        }

        $this->requireTicketAdminAccess($t);

        $p = (string)($_POST['priority'] ?? '');

        if (!in_array($p, Ticket::PRIORITIES, true)) {
            flash('error', 'Bad priority.');
            redirect('/tickets/' . $id);
        }

        if ($t['priority'] === $p) {
            flash('success', 'Priority unchanged.');
            redirect('/tickets/' . $id);
        }

        Ticket::update($id, [
            'priority' => $p
        ]);

        if ((int)$t['user_id'] !== (int)auth_id()) {
            Notification::create((int)$t['user_id'], 'Priority updated', $t['ticket_no'] . ' is now ' . $p);
        }

        ActivityLog::log(
            auth_id(),
            'ticket.priority',
            "Set #$id priority $p"
        );

        flash('success', 'Priority updated.');

        redirect('/tickets/' . $id);
    }

    public function assign(int $id): void
    {
        SystemAdminMiddleware::handle();
        csrf_verify();

        $t = Ticket::find($id);

        if (!$t) {
            http_response_code(404);
            exit('Not found.');
        }

        $assignedTo = (int)($_POST['assigned_to'] ?? 0);

        $newAssignee = $assignedTo > 0 ? $assignedTo : null;

        $previousAssignee = !empty($t['assigned_to'])
            ? (int)$t['assigned_to']
            : null;

        if ($previousAssignee === $newAssignee) {
            flash('success', 'Assignment unchanged.');
            redirect('/tickets/' . $id);
        }

        if ($newAssignee !== null) {

            $admin = User::find($newAssignee);

            if (
                !$admin ||
                $admin['role'] !== 'admin' ||
                $admin['admin_level'] !== 'support_admin' ||
                $admin['status'] !== 'active'
            ) {
                flash('error', 'Invalid admin selected.');
                redirect('/tickets/' . $id);
            }
        }

        Ticket::update($id, [
            'assigned_to' => $newAssignee
        ]);

        if ($newAssignee !== null && $newAssignee !== (int)auth_id()) {

            Notification::create(
                $newAssignee,
                'Ticket assigned to you',
                $t['ticket_no'] . ' — ' . $t['title']
            );
        }

        $ticketOwner = (int)$t['user_id'];
        if ($ticketOwner !== (int)auth_id()) {
            $assigneeName = $newAssignee !== null ? (User::find($newAssignee)['name'] ?? 'Support team') : 'the support team';
            Notification::create(
                $ticketOwner,
                'Ticket assignment updated',
                $t['ticket_no'] . ' is now assigned to ' . $assigneeName . '.'
            );
        }

        if ($previousAssignee !== null && $previousAssignee !== $newAssignee && $previousAssignee !== (int)auth_id()) {
            Notification::create($previousAssignee, 'Ticket unassigned', $t['ticket_no'] . ' is no longer assigned to you.');
        }

        if ($newAssignee !== null) {

            ActivityLog::log(
                auth_id(),
                'ticket.assign',
                "Assigned #$id to user #$newAssignee"
            );

        } else {

            ActivityLog::log(
                auth_id(),
                'ticket.assign',
                "Unassigned #$id"
            );
        }

        flash(
            'success',
            $newAssignee !== null
                ? 'Ticket assigned successfully.'
                : 'Ticket unassigned.'
        );

        redirect('/tickets/' . $id);
    }

    public function revokeAssignment(int $id): void
    {
        SystemAdminMiddleware::handle();
        csrf_verify();

        $ticket = Ticket::find($id);
        if (!$ticket) {
            http_response_code(404);
            exit('Not found.');
        }

        $previousAssignee = (int) ($ticket['assigned_to'] ?? 0);
        if ($previousAssignee > 0) {
            Ticket::update($id, ['assigned_to' => null]);
            Notification::create(
                $previousAssignee,
                'Ticket assignment revoked',
                'Your assignment for ' . $ticket['ticket_no'] . ' has been revoked by a System Administrator.'
            );
            ActivityLog::log(auth_id(), 'ticket.revoke_assignment', "Revoked assignment for #$id");
        }

        flash('success', $previousAssignee > 0 ? 'Assignment revoked.' : 'Ticket is already unassigned.');
        redirect('/tickets/' . $id);
    }

    public function users(): void
    {
        SystemAdminMiddleware::handle();

        view('admin/users', [
            'title' => 'Users',
            'users' => User::all()
        ]);
    }

    public function createAdmin(): void
    {
        SystemAdminMiddleware::handle();
        csrf_verify();

        $v = (new Validator($_POST))
            ->required('name', 'Name')
            ->max('name', 100)
            ->required('email', 'Email')
            ->email('email')
            ->required('password', 'Password')
            ->min('password', 8);

        if (!$v->passes()) {
            remember_old([
                'name' => $_POST['name'] ?? '',
                'email' => $_POST['email'] ?? '',
            ]);

            flash('error', implode(' ', $v->errors));
            redirect('/admin/users');
        }

        $name = trim((string)$_POST['name']);
        $email = trim((string)$_POST['email']);
        $password = (string)$_POST['password'];
        $adminLevel = (string)($_POST['admin_level'] ?? 'support_admin');

        if (!in_array($adminLevel, ['system_admin', 'support_admin'], true)) {
            flash('error', 'Invalid administrator level.');
            redirect('/admin/users');
        }

        if (User::findByEmail($email)) {
            flash('error', 'An account with that email already exists.');
            redirect('/admin/users');
        }

        $id = User::create(
            $name,
            $email,
            password_hash($password, PASSWORD_BCRYPT),
            'admin',
            $adminLevel
        );

        ActivityLog::log(
            auth_id(),
            'admin.create',
            "Created admin account #$id ($email)"
        );

        flash('success', 'Admin account created successfully.');

        redirect('/admin/users');
    }

    public function setUserStatus(int $id): void
    {
        SystemAdminMiddleware::handle();
        csrf_verify();

        $status = (string)($_POST['status'] ?? '');

        if (!in_array($status, ['active', 'suspended'], true)) {
            flash('error', 'Bad status.');
            redirect('/admin/users');
        }

        $target = User::find($id);
        if (!$target || ($target['role'] === 'admin' && $target['admin_level'] === 'system_admin') || $id === (int)auth_id()) {
            flash('error', 'That account cannot be suspended or reactivated here.');
            redirect('/admin/users');
        }
        User::setStatus($id, $status);

        ActivityLog::log(
            auth_id(),
            'user.status',
            "User #$id -> $status"
        );

        flash('success', 'User updated.');

        redirect('/admin/users');
    }

    private function requireTicketAdminAccess(array $ticket): void
    {
        if (auth_is_support_admin() && (int) ($ticket['assigned_to'] ?? 0) !== (int) auth_id()) {
            forbidden('Support Administrators can only manage tickets assigned to them.');
        }
    }
}