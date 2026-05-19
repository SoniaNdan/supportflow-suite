<div class="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
  <div class="flex items-start justify-between">
    <div>
      <div class="font-mono text-xs text-slate-400"><?= e($ticket['ticket_no']) ?></div>
      <h1 class="text-2xl font-bold"><?= e($ticket['title']) ?></h1>
      <div class="text-sm text-slate-500 mt-1">By <?= e($ticket['user_name']) ?> · <?= e($ticket['category']) ?> · <?= e(date('M j, Y', strtotime($ticket['created_at']))) ?></div>
    </div>
    <div class="flex gap-2">
      <span class="text-xs uppercase rounded px-2 py-1 bg-slate-100"><?= e($ticket['priority']) ?></span>
      <span class="text-xs uppercase rounded px-2 py-1 bg-indigo-100 text-indigo-700"><?= e($ticket['status']) ?></span>
    </div>
  </div>
  <p class="mt-4 whitespace-pre-wrap text-slate-700"><?= e($ticket['description']) ?></p>
  <?php if (!empty($ticket['attachment_path'])): ?>
    <a href="<?= e($ticket['attachment_path']) ?>" class="inline-block mt-3 text-indigo-600 text-sm">Download attachment</a>
  <?php endif; ?>
</div>

<?php if (auth_is_admin()): ?>
<div class="bg-white rounded-xl shadow-sm border border-slate-100 p-4 mb-6 flex flex-wrap gap-3 items-end">
  <form method="post" action="/admin/tickets/<?= (int)$ticket['id'] ?>/status" class="flex gap-2 items-end"><?= csrf_field() ?>
    <div><label class="block text-xs">Status</label>
      <select name="status" class="rounded border border-slate-300 px-2 py-1 text-sm">
        <?php foreach (Ticket::STATUSES as $s): ?><option <?= $ticket['status']===$s?'selected':'' ?>><?= $s ?></option><?php endforeach; ?>
      </select></div>
    <button class="bg-slate-900 text-white text-sm px-3 py-1.5 rounded">Update status</button>
  </form>
  <form method="post" action="/admin/tickets/<?= (int)$ticket['id'] ?>/priority" class="flex gap-2 items-end"><?= csrf_field() ?>
    <div><label class="block text-xs">Priority</label>
      <select name="priority" class="rounded border border-slate-300 px-2 py-1 text-sm">
        <?php foreach (Ticket::PRIORITIES as $p): ?><option <?= $ticket['priority']===$p?'selected':'' ?>><?= $p ?></option><?php endforeach; ?>
      </select></div>
    <button class="bg-slate-900 text-white text-sm px-3 py-1.5 rounded">Update priority</button>
  </form>
</div>
<?php endif; ?>

<h2 class="text-lg font-semibold mb-3">Conversation</h2>
<div class="space-y-3 mb-6">
  <?php foreach ($replies as $r): ?>
    <div class="bg-white rounded-xl border <?= $r['is_internal_note']?'border-amber-200 bg-amber-50':'border-slate-100' ?> p-4">
      <div class="flex justify-between text-xs text-slate-500 mb-1">
        <span class="font-medium text-slate-700"><?= e($r['user_name']) ?> <span class="ml-1 uppercase text-[10px] rounded bg-slate-100 px-1.5 py-0.5"><?= e($r['user_role']) ?></span><?php if ($r['is_internal_note']): ?> <span class="ml-1 text-amber-700">Internal note</span><?php endif; ?></span>
        <span><?= e(date('M j, H:i', strtotime($r['created_at']))) ?></span>
      </div>
      <p class="whitespace-pre-wrap text-slate-700"><?= e($r['message']) ?></p>
      <?php if (!empty($r['attachment_path'])): ?><a href="<?= e($r['attachment_path']) ?>" class="text-indigo-600 text-sm">Attachment</a><?php endif; ?>
    </div>
  <?php endforeach; ?>
  <?php if (!$replies): ?><div class="text-slate-500 text-sm">No replies yet.</div><?php endif; ?>
</div>

<form method="post" action="/tickets/<?= (int)$ticket['id'] ?>/reply" enctype="multipart/form-data" class="bg-white rounded-xl shadow-sm border border-slate-100 p-4 space-y-3"><?= csrf_field() ?>
  <textarea name="message" rows="3" required placeholder="Write a reply..." class="w-full rounded border border-slate-300 px-3 py-2"></textarea>
  <div class="flex items-center justify-between">
    <input type="file" name="attachment" class="text-sm">
    <div class="flex items-center gap-3">
      <?php if (auth_is_admin()): ?>
        <label class="text-xs text-slate-600 flex items-center gap-1"><input type="checkbox" name="internal" value="1"> Internal note</label>
      <?php endif; ?>
      <button class="bg-indigo-600 text-white px-4 py-2 rounded text-sm">Send reply</button>
    </div>
  </div>
</form>
