<h1 class="text-2xl font-bold mb-6">Admin dashboard</h1>
<div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
  <?php foreach (['total'=>'Total','open'=>'Open','in_progress'=>'In progress','resolved'=>'Resolved','today'=>'Today'] as $k=>$l): ?>
    <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
      <div class="text-xs text-slate-500"><?= $l ?></div>
      <div class="text-2xl font-bold mt-1"><?= (int)$stats[$k] ?></div></div>
  <?php endforeach; ?>
  <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
    <div class="text-xs text-slate-500">Users</div>
    <div class="text-2xl font-bold mt-1"><?= (int)$users ?></div></div>
</div>
<div class="flex gap-3 mb-6"><a href="<?= BASE_URL ?>/admin/tickets" class="bg-indigo-600 text-white px-4 py-2 rounded text-sm">Manage tickets</a><a href="<?= BASE_URL ?>/admin/users" class="bg-slate-900 text-white px-4 py-2 rounded text-sm">Manage users</a></div>
<h2 class="text-lg font-semibold mb-3">Recent activity</h2>
<div class="bg-white rounded-xl shadow-sm border border-slate-100 divide-y text-sm">
  <?php foreach ($activity as $a): ?>
    <div class="p-3 flex justify-between"><div><span class="font-medium"><?= e($a['user_name'] ?? 'System') ?></span> · <?= e($a['action']) ?> — <span class="text-slate-600"><?= e($a['description']) ?></span></div>
      <span class="text-xs text-slate-500"><?= e(date('M j H:i', strtotime($a['created_at']))) ?></span></div>
  <?php endforeach; ?>
  <?php if (!$activity): ?><div class="p-4 text-slate-500">No activity yet.</div><?php endif; ?>
</div>
