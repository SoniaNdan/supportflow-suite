<?php
declare(strict_types=1);

final class TicketController
{
    public function index(): void {
        AuthMiddleware::handle();
        $filters = [
            'status'   => $_GET['status']   ?? null,
            'priority' => $_GET['priority'] ?? null,
            'q'        => $_GET['q']        ?? null,
        ];
        $tickets = Ticket::forUser((int)auth_id(), $filters);
        view('tickets/index', ['title' => 'My tickets', 'tickets' => $tickets, 'filters' => $filters]);
    }

    public function create(): void {
        AuthMiddleware::handle();
        view('tickets/create', ['title' => 'New ticket']);
    }

    public function store(): void {
        AuthMiddleware::handle();
        csrf_verify();
        $v = (new Validator($_POST))
            ->required('title')->max('title', 200)
            ->required('category')->max('category', 100)
            ->required('priority')->in('priority', Ticket::PRIORITIES)
            ->required('description')->max('description', 5000);
        if (!$v->passes()) {
            remember_old($_POST);
            flash('error', implode(' ', $v->errors));
            redirect('/tickets/new');
        }
        try { $attachment = handle_upload('attachment'); }
        catch (Throwable $e) { flash('error', $e->getMessage()); redirect('/tickets/new'); }

        $id = Ticket::create([
            'user_id' => auth_id(),
            'title' => $_POST['title'],
            'category' => $_POST['category'],
            'priority' => $_POST['priority'],
            'description' => $_POST['description'],
            'attachment_path' => $attachment ?? null,
        ]);
        ActivityLog::log(auth_id(), 'ticket.create', "Created ticket #$id");
        flash('success', 'Ticket submitted.');
        redirect('/tickets/' . $id);
    }

    public function show(int $id): void {
        AuthMiddleware::handle();
        $t = Ticket::find($id);
        if (!$t) { http_response_code(404); exit('Ticket not found.'); }
        if (!auth_is_admin() && (int)$t['user_id'] !== auth_id()) {
            http_response_code(403); exit('Forbidden.');
        }
        $replies = Reply::forTicket($id, auth_is_admin());
        view('tickets/show', ['title' => $t['ticket_no'], 'ticket' => $t, 'replies' => $replies]);
    }

    public function reply(int $id): void {
        AuthMiddleware::handle();
        csrf_verify();
        $t = Ticket::find($id);
        if (!$t) { http_response_code(404); exit('Not found.'); }
        if (!auth_is_admin() && (int)$t['user_id'] !== auth_id()) { http_response_code(403); exit('Forbidden.'); }
        $msg = trim((string)($_POST['message'] ?? ''));
        if ($msg === '') { flash('error', 'Reply cannot be empty.'); redirect('/tickets/' . $id); }
        $attachment = null;
        try { $attachment = handle_upload('attachment'); }
        catch (Throwable $e) { flash('error', $e->getMessage()); redirect('/tickets/' . $id); }

        Reply::create([
            'ticket_id' => $id, 'user_id' => auth_id(), 'message' => $msg,
            'attachment_path' => $attachment,
            'is_internal_note' => auth_is_admin() && !empty($_POST['internal']),
        ]);

        // Notify the other party
        $notifyUser = auth_is_admin() ? (int)$t['user_id'] : null;
        if (!auth_is_admin()) {
            // notify all admins
            foreach (Database::conn()->query("SELECT id FROM users WHERE role='admin'") as $a) {
                Notification::create((int)$a['id'], 'New reply on ' . $t['ticket_no'], substr($msg, 0, 200));
            }
        } elseif ($notifyUser) {
            Notification::create($notifyUser, 'New reply on ' . $t['ticket_no'], substr($msg, 0, 200));
        }
        flash('success', 'Reply posted.');
        redirect('/tickets/' . $id);
    }
}
