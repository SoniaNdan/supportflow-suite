<?php

declare(strict_types=1);

final class TicketController
{
    public function index(): void
    {
        AuthMiddleware::handle();

        $filters = [
            'status'   => $_GET['status'] ?? null,
            'priority' => $_GET['priority'] ?? null,
            'q'        => $_GET['q'] ?? null,
        ];

        $tickets = auth_is_system_admin()
            ? Ticket::all($filters, (int) auth_id(), true)
            : (auth_is_support_admin()
                ? Ticket::all($filters, (int) auth_id(), false)
                : Ticket::forUser((int) auth_id(), $filters));

        view('tickets/index', [
            'title' => 'My tickets',
            'tickets' => $tickets,
            'filters' => $filters
        ]);
    }


    public function create(): void
    {
        AuthMiddleware::handle();

        view('tickets/create', [
            'title' => 'New ticket'
        ]);
    }


    public function store(): void
    {
        AuthMiddleware::handle();
        csrf_verify();

        $v = (new Validator($_POST))
            ->required('title')->max('title', 200)
            ->required('category')->max('category', 100)
            ->required('priority')->in('priority', Ticket::PRIORITIES)
            ->required('description')->max('description', 5000);

        if (!$v->passes()) {
            remember_old($_POST);

            flash(
                'error',
                implode(' ', $v->errors)
            );

            redirect('/tickets/new');
        }

        try {
            $attachment = handle_upload('attachment');
        } catch (Throwable $e) {
            flash('error', $e->getMessage());
            redirect('/tickets/new');
        }

        $id = Ticket::create([
            'user_id' => auth_id(),
            'title' => trim((string) $_POST['title']),
            'category' => trim((string) $_POST['category']),
            'priority' => (string) $_POST['priority'],
            'description' => trim((string) $_POST['description']),
            'attachment_path' => $attachment ?? null,
        ]);

        ActivityLog::log(
            auth_id(),
            'ticket.create',
            "Created ticket #$id"
        );

        // Notify admins that a new ticket was created
        foreach (
            Database::conn()->query(
                "SELECT id FROM users WHERE role = 'admin' AND status = 'active'"
            ) as $admin
        ) {
            Notification::create(
                (int) $admin['id'],
                'New ticket created',
                'A new ticket has been submitted: ' .
                    generate_ticket_notification_text($id)
            );
        }

        flash('success', 'Ticket submitted.');

        redirect('/tickets/' . $id);
    }


    public function show(int $id): void
    {
        AuthMiddleware::handle();

        $t = Ticket::find($id);

        if (!$t) {
            http_response_code(404);
            exit('Ticket not found.');
        }

        // Normal users own their tickets; support admins only see assigned tickets.
        if (!auth_is_admin() && (int) $t['user_id'] !== auth_id()) {
            forbidden('You do not have permission to view this ticket.');
        }
        if (auth_is_support_admin() && (int) ($t['assigned_to'] ?? 0) !== (int) auth_id()) {
            forbidden('Support Administrators can only access tickets assigned to them.');
        }

        $replies = Reply::forTicket(
            $id,
            auth_is_admin()
        );

        Ticket::markRead($id, (int) auth_id());

        view('tickets/show', [
            'title' => $t['ticket_no'],
            'ticket' => $t,
            'replies' => $replies
        ]);
    }


    public function reply(int $id): void
    {
        AuthMiddleware::handle();
        csrf_verify();

        $t = Ticket::find($id);

        if (!$t) {
            http_response_code(404);
            exit('Not found.');
        }

        if (!auth_is_admin() && (int)$t['user_id'] !== auth_id()) {
            forbidden('You do not have permission to reply to this ticket.');
        }
        if (auth_is_support_admin() && (int) ($t['assigned_to'] ?? 0) !== (int) auth_id()) {
            forbidden('Support Administrators can only reply to tickets assigned to them.');
        }

        $msg = trim((string)($_POST['message'] ?? ''));

        if ($msg === '') {
            flash('error', 'Reply cannot be empty.');
            redirect('/tickets/' . $id);
        }

        $attachment = null;

        try {
            $attachment = handle_upload('attachment');
        } catch (Throwable $e) {
            flash('error', $e->getMessage());
            redirect('/tickets/' . $id);
        }

        $isInternal = auth_is_admin() && !empty($_POST['internal']);

        // Create the reply
        Reply::create([
            'ticket_id' => $id,
            'user_id' => auth_id(),
            'message' => $msg,
            'attachment_path' => $attachment,
            'is_internal_note' => $isInternal,
        ]);

        /*
     * Notifications
     *
     * Internal admin notes:
     * - Do NOT notify the user.
     *
     * Admin normal reply:
     * - Notify the ticket owner.
     *
     * User reply:
     * - Notify all admins.
     */
        if (auth_is_admin()) {

            if (!$isInternal) {
                $notifyUser = (int)$t['user_id'];

                Notification::create(
                    $notifyUser,
                    'New reply on ' . $t['ticket_no'],
                    substr($msg, 0, 200)
                );
            }
        } else {

            // Prefer the responsible admin; unassigned tickets go to active admins.
            $stmt = $t['assigned_to']
                ? Database::conn()->prepare("SELECT id FROM users WHERE id = ? AND role = 'admin' AND status = 'active'")
                : Database::conn()->query("SELECT id FROM users WHERE role = 'admin' AND status = 'active'");
            if ($t['assigned_to']) $stmt->execute([(int)$t['assigned_to']]);

            foreach ($stmt as $admin) {
                Notification::create(
                    (int)$admin['id'],
                    'New reply on ' . $t['ticket_no'],
                    substr($msg, 0, 200)
                );
            }
        }

        ActivityLog::log(
            auth_id(),
            $isInternal ? 'ticket.internal_note' : 'ticket.reply',
            ($isInternal ? 'Added internal note to #' : 'Replied to #') . $id
        );

        flash(
            'success',
            $isInternal ? 'Internal note added.' : 'Reply posted.'
        );

        redirect('/tickets/' . $id);
    }
}


/*
 * Small helper used when notifying admins
 * about a newly created ticket.
 */
function generate_ticket_notification_text(int $ticketId): string
{
    $ticket = Ticket::find($ticketId);

    if (!$ticket) {
        return 'Ticket #' . $ticketId;
    }

    return $ticket['ticket_no'] . ' — ' . $ticket['title'];
}
