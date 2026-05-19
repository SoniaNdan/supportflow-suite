<div class="flex justify-between items-center mb-4">
  <h1 class="text-2xl font-bold">Notifications</h1>
  <form method="post" action="/notifications/read-all"><?= csrf_field() ?>
    <button class="text-sm text-indigo-600">Mark all read</button></form>
</div>
<div class="bg-white rounded-xl shadow-sm border border-slate-100 divide-y">
  <?php foreach ($items as $n): ?>
    <div class="p-4 <?= $n['is_read']?'':'bg-indigo-50/40' ?>">
      <div class="flex justify-between">
        <div class="font-medium"><?= e($n['title']) ?></div>
        <span class="text-xs text-slate-500"><?= e(date('M j, H:i', strtotime($n['created_at']))) ?></span>
      </div>
      <p class="text-sm text-slate-600 mt-1"><?= e($n['message']) ?></p>
      <?php if (!$n['is_read']): ?>
        <form method="post" action="/notifications/<?= (int)$n['id'] ?>/read" class="mt-2"><?= csrf_field() ?>
          <button class="text-xs text-indigo-600">Mark read</button></form>
      <?php endif; ?>
    </div>
  <?php endforeach; ?>
  <?php if (!$items): ?><div class="p-6 text-center text-slate-500">No notifications.</div><?php endif; ?>
</div>
