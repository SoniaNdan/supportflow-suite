<div class="flex items-center justify-between mb-4">
  <h1 class="text-2xl font-bold">My tickets</h1>
  <a href="<?= url('/tickets/new') ?>" class="bg-indigo-600 text-white px-4 py-2 rounded text-sm">+ New ticket</a>
</div>
<form method="get" class="flex flex-wrap gap-2 mb-4">
  <input name="q" value="<?= e($filters['q'] ?? '') ?>" placeholder="Search..." class="flex-1 min-w-[180px] rounded border border-slate-300 px-3 py-2">
  <select name="status" class="rounded border border-slate-300 px-3 py-2"><option value="">Any status</option>
    <?php foreach (Ticket::STATUSES as $s): ?><option <?= ($filters['status']??'')===$s?'selected':'' ?>><?= $s ?></option><?php endforeach; ?></select>
  <select name="priority" class="rounded border border-slate-300 px-3 py-2"><option value="">Any priority</option>
    <?php foreach (Ticket::PRIORITIES as $p): ?><option <?= ($filters['priority']??'')===$p?'selected':'' ?>><?= $p ?></option><?php endforeach; ?></select>
  <button class="bg-slate-900 text-white px-4 rounded">Filter</button>
</form>
<table class="w-full bg-white rounded-xl shadow-sm border border-slate-100 text-sm">
  <thead class="bg-slate-50 text-left text-xs uppercase text-slate-500">
    <tr><th class="p-3">Activity</th><th class="p-3">Ticket</th><th class="p-3">Category</th><th class="p-3">Priority</th><th class="p-3">Status</th><th class="p-3">Created</th></tr>
  </thead>
  <tbody class="divide-y">
 <?php foreach ($tickets as $t): ?>
    <tr
        class="cursor-pointer transition-colors <?php echo !empty($t['is_unread']) ? 'bg-rose-50 hover:bg-rose-100' : (in_array($t['status'], ['open', 'pending', 'in_progress'], true) ? 'bg-blue-50 hover:bg-blue-100' : 'bg-emerald-50 hover:bg-emerald-100'); ?>"
        onclick="window.location.href='<?= url('/tickets/' . (int)$t['id']) ?>'"
    >
        <td class="p-3">
          <?php if (!empty($t['is_unread'])): ?>
            <span class="inline-flex items-center gap-1 text-xs font-semibold text-rose-700"><span class="h-2.5 w-2.5 rounded-full bg-rose-500"></span>Unread</span>
          <?php elseif (in_array($t['status'], ['open', 'pending', 'in_progress'], true)): ?>
            <span class="inline-flex items-center gap-1 text-xs font-semibold text-blue-700"><span class="h-2.5 w-2.5 rounded-full bg-blue-500"></span>Active</span>
          <?php else: ?>
            <span class="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700"><span class="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>Read</span>
          <?php endif; ?>
        </td>
        <td class="p-3">
            <div class="font-mono text-xs text-slate-400">
                <?= e($t['ticket_no']) ?>
            </div>
            <div class="font-medium hover:text-indigo-600">
                <?= e($t['title']) ?>
            </div>
        </td>

        <td class="p-3">
            <?= e($t['user_name']) ?>
        </td>

        <td class="p-3">
            <?= e($t['category']) ?>
        </td>

        <td class="p-3">
            <?= e($t['priority']) ?>
        </td>

        <td class="p-3">
            <?= e($t['status']) ?>
        </td>

        <td class="p-3 text-slate-500">
            <?= e(date('M j', strtotime($t['created_at']))) ?>
        </td>
    </tr>
<?php endforeach; ?>
  <?php if (!$tickets): ?><tr><td colspan="6" class="p-6 text-center text-slate-500">No tickets match.</td></tr><?php endif; ?>
  </tbody>
</table>
