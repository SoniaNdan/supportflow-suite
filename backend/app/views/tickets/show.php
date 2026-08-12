<div class="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
  <div class="flex items-start justify-between">
    <div>
      <div class="font-mono text-xs text-slate-400">
        <?= e($ticket['ticket_no']) ?>
      </div>

      <h1 class="text-2xl font-bold">
        <?= e($ticket['title']) ?>
      </h1>

      <div class="text-sm text-slate-500 mt-1">
        By <?= e($ticket['user_name']) ?>
        · <?= e($ticket['category']) ?>
        · <?= e(date('M j, Y', strtotime($ticket['created_at']))) ?>
      </div>
    </div>

    <div class="flex gap-2">
      <span class="text-xs uppercase rounded px-2 py-1 bg-slate-100">
        <?= e($ticket['priority']) ?>
      </span>

      <span class="text-xs uppercase rounded px-2 py-1 bg-indigo-100 text-indigo-700">
        <?= e($ticket['status']) ?>
      </span>
    </div>
  </div>

  <p class="mt-4 whitespace-pre-wrap text-slate-700">
    <?= e($ticket['description']) ?>
  </p>

  <?php if (!empty($ticket['attachment_path'])): ?>
    <a
      href="<?= e($ticket['attachment_path']) ?>"
      class="inline-block mt-3 text-indigo-600 text-sm"
      target="_blank"
    >
      Download attachment
    </a>
  <?php endif; ?>
</div>


<?php if (auth_is_admin()): ?>

<!-- ADMIN CONTROLS -->
<div class="bg-white rounded-xl shadow-sm border border-slate-100 p-5 mb-6">

  <h2 class="text-lg font-semibold mb-4">
    Admin controls
  </h2>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

    <!-- STATUS -->
    <form
      method="post"
      action="<?= url('/admin/tickets/' . (int)$ticket['id'] . '/status') ?>"
      class="border border-slate-200 rounded-lg p-4"
    >
      <?= csrf_field() ?>

      <label class="block text-sm font-medium mb-2">
        Ticket status
      </label>

      <select
        name="status"
        class="w-full rounded border border-slate-300 px-3 py-2 text-sm mb-3"
      >
        <?php foreach (Ticket::STATUSES as $s): ?>
          <option
            value="<?= e($s) ?>"
            <?= $ticket['status'] === $s ? 'selected' : '' ?>
          >
            <?= e(ucwords(str_replace('_', ' ', $s))) ?>
          </option>
        <?php endforeach; ?>
      </select>

      <button
        type="submit"
        class="w-full bg-slate-900 hover:bg-slate-800 text-white text-sm px-3 py-2 rounded"
      >
        Update status
      </button>
    </form>


    <!-- PRIORITY -->
    <form
      method="post"
      action="<?= url('/admin/tickets/' . (int)$ticket['id'] . '/priority') ?>"
      class="border border-slate-200 rounded-lg p-4"
    >
      <?= csrf_field() ?>

      <label class="block text-sm font-medium mb-2">
        Ticket priority
      </label>

      <select
        name="priority"
        class="w-full rounded border border-slate-300 px-3 py-2 text-sm mb-3"
      >
        <?php foreach (Ticket::PRIORITIES as $p): ?>
          <option
            value="<?= e($p) ?>"
            <?= $ticket['priority'] === $p ? 'selected' : '' ?>
          >
            <?= e(ucfirst($p)) ?>
          </option>
        <?php endforeach; ?>
      </select>

      <button
        type="submit"
        class="w-full bg-slate-900 hover:bg-slate-800 text-white text-sm px-3 py-2 rounded"
      >
        Update priority
      </button>
    </form>


    <!-- ASSIGNMENT -->
    <form
      method="post"
      action="<?= url('/admin/tickets/' . (int)$ticket['id'] . '/assign') ?>"
      class="border border-slate-200 rounded-lg p-4"
    >
      <?= csrf_field() ?>

      <label class="block text-sm font-medium mb-2">
        Assign ticket
      </label>

      <select
        name="assigned_to"
        class="w-full rounded border border-slate-300 px-3 py-2 text-sm mb-3"
      >
        <option value="0">Unassigned</option>

        <?php
        $admins = User::admins();
        ?>

        <?php foreach ($admins as $admin): ?>
          <option
            value="<?= (int)$admin['id'] ?>"
            <?= (int)($ticket['assigned_to'] ?? 0) === (int)$admin['id'] ? 'selected' : '' ?>
          >
            <?= e($admin['name']) ?> — <?= e($admin['email']) ?>
          </option>
        <?php endforeach; ?>
      </select>

      <button
        type="submit"
        class="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-3 py-2 rounded"
      >
        Save assignment
      </button>
    </form>

  </div>
</div>

<?php endif; ?>


<!-- CONVERSATION -->

<h2 class="text-lg font-semibold mb-3">
  Conversation
</h2>

<div class="space-y-3 mb-6">

  <?php foreach ($replies as $r): ?>

    <div
      class="bg-white rounded-xl border p-4
      <?= $r['is_internal_note']
        ? 'border-amber-200 bg-amber-50'
        : 'border-slate-100' ?>"
    >

      <div class="flex justify-between text-xs text-slate-500 mb-1">

        <span class="font-medium text-slate-700">

          <?= e($r['user_name']) ?>

          <span class="ml-1 uppercase text-[10px] rounded bg-slate-100 px-1.5 py-0.5">
            <?= e($r['user_role']) ?>
          </span>

          <?php if ($r['is_internal_note']): ?>
            <span class="ml-1 text-amber-700">
              Internal note
            </span>
          <?php endif; ?>

        </span>

        <span>
          <?= e(date('M j, H:i', strtotime($r['created_at']))) ?>
        </span>

      </div>

      <p class="whitespace-pre-wrap text-slate-700">
        <?= e($r['message']) ?>
      </p>

      <?php if (!empty($r['attachment_path'])): ?>

        <a
          href="<?= e($r['attachment_path']) ?>"
          target="_blank"
          class="text-indigo-600 text-sm inline-block mt-2"
        >
          Attachment
        </a>

      <?php endif; ?>

    </div>

  <?php endforeach; ?>

  <?php if (!$replies): ?>
    <div class="text-slate-500 text-sm">
      No replies yet.
    </div>
  <?php endif; ?>

</div>


<!-- REPLY FORM -->

<form
  method="post"
  action="<?= url('/admin/tickets/' . (int)$ticket['id'] . '/reply') ?>"
  enctype="multipart/form-data"
  class="bg-white rounded-xl shadow-sm border border-slate-100 p-4 space-y-3"
>

  <?= csrf_field() ?>

  <textarea
    name="message"
    rows="3"
    required
    placeholder="Write a reply..."
    class="w-full rounded border border-slate-300 px-3 py-2"
  ></textarea>

  <div class="flex items-center justify-between">

    <input
      type="file"
      name="attachment"
      class="text-sm"
    >

    <div class="flex items-center gap-3">

      <?php if (auth_is_admin()): ?>

        <label class="text-xs text-slate-600 flex items-center gap-1">
          <input
            type="checkbox"
            name="internal"
            value="1"
          >
          Internal note
        </label>

      <?php endif; ?>

      <button
        type="submit"
        class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm"
      >
        Send reply
      </button>

    </div>

  </div>

</form>