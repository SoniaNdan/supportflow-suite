<h1 class="text-2xl font-bold mb-6">Settings</h1>
<div class="grid md:grid-cols-2 gap-6">
  <form method="post" action="/settings/profile" class="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-3"><?= csrf_field() ?>
    <h2 class="font-semibold">Profile</h2>
    <input name="name" value="<?= e($user['name']) ?>" required class="w-full rounded border border-slate-300 px-3 py-2">
    <input type="email" name="email" value="<?= e($user['email']) ?>" required class="w-full rounded border border-slate-300 px-3 py-2">
    <button class="bg-indigo-600 text-white px-4 py-2 rounded">Save</button>
  </form>
  <form method="post" action="/settings/password" class="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-3"><?= csrf_field() ?>
    <h2 class="font-semibold">Change password</h2>
    <input type="password" name="current_password" placeholder="Current password" required class="w-full rounded border border-slate-300 px-3 py-2">
    <input type="password" name="new_password" placeholder="New password (min 8)" required class="w-full rounded border border-slate-300 px-3 py-2">
    <button class="bg-indigo-600 text-white px-4 py-2 rounded">Update password</button>
  </form>
</div>
