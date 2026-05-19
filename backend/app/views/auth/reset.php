<div class="max-w-md mx-auto mt-12 bg-white rounded-xl shadow p-8">
  <h1 class="text-2xl font-bold mb-4">Set a new password</h1>
  <form method="post" action="/reset-password" class="space-y-4"><?= csrf_field() ?>
    <input type="hidden" name="token" value="<?= e($token) ?>">
    <input type="password" name="password" required placeholder="New password (min 8)" class="w-full rounded border border-slate-300 px-3 py-2">
    <button class="w-full bg-indigo-600 text-white rounded py-2">Update password</button>
  </form>
</div>
