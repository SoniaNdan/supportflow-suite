<div class="max-w-md mx-auto mt-12 bg-white rounded-xl shadow p-8">
  <h1 class="text-2xl font-bold mb-6">Create your account</h1>
  <form method="post" action="/register" class="space-y-4"><?= csrf_field() ?>
    <div><label class="block text-sm mb-1">Full name</label>
      <input name="name" value="<?= e(old('name')) ?>" required class="w-full rounded border border-slate-300 px-3 py-2"></div>
    <div><label class="block text-sm mb-1">Email</label>
      <input type="email" name="email" value="<?= e(old('email')) ?>" required class="w-full rounded border border-slate-300 px-3 py-2"></div>
    <div><label class="block text-sm mb-1">Password (min 8)</label>
      <input type="password" name="password" required class="w-full rounded border border-slate-300 px-3 py-2"></div>
    <button class="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded py-2">Create account</button>
  </form>
</div>
<?php clear_old(); ?>
