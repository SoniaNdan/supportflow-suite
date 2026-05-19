<div class="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-slate-100 p-6">
  <h1 class="text-2xl font-bold mb-6">Submit a complaint</h1>
  <form method="post" action="/tickets" enctype="multipart/form-data" class="space-y-4"><?= csrf_field() ?>
    <div><label class="block text-sm mb-1">Subject</label>
      <input name="title" value="<?= e(old('title')) ?>" required maxlength="200" class="w-full rounded border border-slate-300 px-3 py-2"></div>
    <div class="grid grid-cols-2 gap-4">
      <div><label class="block text-sm mb-1">Category</label>
        <select name="category" required class="w-full rounded border border-slate-300 px-3 py-2">
          <?php foreach (['Billing','Account','Technical','Feature Request','Other'] as $c): ?>
            <option <?= old('category')===$c?'selected':'' ?>><?= $c ?></option>
          <?php endforeach; ?></select></div>
      <div><label class="block text-sm mb-1">Priority</label>
        <select name="priority" required class="w-full rounded border border-slate-300 px-3 py-2">
          <?php foreach (Ticket::PRIORITIES as $p): ?>
            <option <?= old('priority',$p==='medium'?'medium':'')===$p?'selected':'' ?>><?= $p ?></option>
          <?php endforeach; ?></select></div>
    </div>
    <div><label class="block text-sm mb-1">Description</label>
      <textarea name="description" rows="6" required maxlength="5000" class="w-full rounded border border-slate-300 px-3 py-2"><?= e(old('description')) ?></textarea></div>
    <div><label class="block text-sm mb-1">Attachment (optional, max 5 MB)</label>
      <input type="file" name="attachment" class="text-sm"></div>
    <div class="flex justify-end gap-2">
      <a href="/tickets" class="px-4 py-2 rounded border border-slate-300">Cancel</a>
      <button class="bg-indigo-600 text-white px-4 py-2 rounded">Submit</button>
    </div>
  </form>
</div>
<?php clear_old(); ?>
