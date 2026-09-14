<div class="mb-6">
  <p class="text-sm font-semibold uppercase tracking-wide text-indigo-600"><?= $isSystemAdmin ? 'System administration' : 'Support dashboard' ?></p>
  <h1 class="mt-1 text-2xl font-bold">Welcome back, <?= e(auth_user()['name']) ?></h1>
</div>
<div class="grid grid-cols-2 gap-4 mb-8 md:grid-cols-4 lg:grid-cols-7">
  <?php foreach (($isSystemAdmin ? ['total'=>'Total','unassigned'=>'Unassigned','open'=>'Open','in_progress'=>'In progress','pending'=>'Pending','resolved'=>'Resolved','closed'=>'Closed'] : ['total'=>'Assigned','open'=>'Open','in_progress'=>'In progress','pending'=>'Pending','resolved'=>'Resolved']) as $k=>$l): ?>
    <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
      <div class="text-xs text-slate-500"><?= $l ?></div>
      <div class="text-2xl font-bold mt-1"><?= (int)$stats[$k] ?></div></div>
  <?php endforeach; ?>
</div>
<div class="flex gap-3 mb-6"><a href="<?= url('/admin/tickets') ?>" class="bg-indigo-600 text-white px-4 py-2 rounded text-sm"><?= $isSystemAdmin ? 'Manage tickets' : 'View assigned tickets' ?></a><?php if ($isSystemAdmin): ?><a href="<?= url('/admin/users') ?>" class="bg-slate-900 text-white px-4 py-2 rounded text-sm">Manage users (<?= (int)$users ?>)</a><?php endif; ?></div>
<h2 class="text-lg font-semibold mb-3"><?= $isSystemAdmin ? 'Ticket oversight' : 'Tickets assigned to you' ?></h2>
<div class="bg-white rounded-xl shadow-sm border border-slate-100 divide-y mb-8 text-sm">
  <?php foreach (array_slice($tickets, 0, 8) as $ticket): ?>
    <a href="<?= url('/tickets/' . (int)$ticket['id']) ?>" class="flex flex-wrap items-center justify-between gap-3 p-3 hover:bg-slate-50">
      <span><span class="font-mono text-xs text-slate-400"><?= e($ticket['ticket_no']) ?></span><span class="ml-3 font-medium"><?= e($ticket['title']) ?></span></span>
      <span class="flex items-center gap-2 text-xs"><span class="rounded bg-slate-100 px-2 py-1"><?= e(ucwords(str_replace('_', ' ', $ticket['status']))) ?></span><span class="text-slate-500"><?= $ticket['assigned_name'] ? 'Assigned to ' . e($ticket['assigned_name']) : 'Unassigned' ?></span></span>
    </a>
  <?php endforeach; ?>
  <?php if (!$tickets): ?><div class="p-4 text-slate-500">No tickets in this view.</div><?php endif; ?>
</div>
<h2 class="text-lg font-semibold mb-3">Recent activity</h2>
<div class="bg-white rounded-xl shadow-sm border border-slate-100 divide-y text-sm">
  <?php foreach ($activity as $a): ?>
    <div class="p-3 flex justify-between"><div><span class="font-medium"><?= e($a['user_name'] ?? 'System') ?></span> · <?= e($a['action']) ?> — <span class="text-slate-600"><?= e($a['description']) ?></span></div>
      <span class="text-xs text-slate-500"><?= e(date('M j H:i', strtotime($a['created_at']))) ?></span></div>
  <?php endforeach; ?>
  <?php if (!$activity): ?><div class="p-4 text-slate-500">No activity yet.</div><?php endif; ?>
</div>
