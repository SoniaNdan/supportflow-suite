<h1 class="text-2xl font-bold mb-6">Welcome back, <?= e(auth_user()['name']) ?></h1>
<div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
  <?php foreach (['total'=>'Total','open'=>'Open','in_progress'=>'In progress','resolved'=>'Resolved','today'=>'Today'] as $k=>$l): ?>
    <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
      <div class="text-xs text-slate-500"><?= $l ?></div>
      <div class="text-2xl font-bold mt-1"><?= (int)$stats[$k] ?></div>
    </div>
  <?php endforeach; ?>
</div>
<div class="flex items-center justify-between mb-3">
  <h2 class="text-lg font-semibold">Recent tickets</h2>
  <a href="<?= url('/tickets/new') ?>" class="bg-indigo-600 text-white px-4 py-2 rounded text-sm">+ New ticket</a>
</div>
<div class="bg-white rounded-xl shadow-sm border border-slate-100 divide-y">
  <?php foreach ($recent as $t): ?>
    <a href="<?= url('/tickets/' . (int)$t['id']) ?>" class="flex items-center justify-between p-4 hover:bg-slate-50">
      <div><div class="font-mono text-xs text-slate-400"><?= e($t['ticket_no']) ?></div>
        <div class="font-medium"><?= e($t['title']) ?></div></div>
      <span class="text-xs uppercase rounded px-2 py-1 bg-slate-100"><?= e($t['status']) ?></span>
    </a>
  <?php endforeach; ?>
  <?php if (!$recent): ?><div class="p-6 text-center text-slate-500">No tickets yet.</div><?php endif; ?>
</div>
