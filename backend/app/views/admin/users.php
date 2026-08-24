<h1 class="text-2xl font-bold mb-4">Users</h1>
<table class="w-full bg-white rounded-xl shadow-sm border border-slate-100 text-sm">
  <thead class="bg-slate-50 text-left text-xs uppercase text-slate-500">
    <tr><th class="p-3">Name</th><th class="p-3">Email</th><th class="p-3">Role</th><th class="p-3">Status</th><th class="p-3">Joined</th><th class="p-3">Actions</th></tr>
  </thead>
  <tbody class="divide-y">
  <?php foreach ($users as $u): ?>
    <tr>
      <td class="p-3 font-medium"><?= e($u['name']) ?></td>
      <td class="p-3 text-slate-600"><?= e($u['email']) ?></td>
      <td class="p-3"><?= e($u['role']) ?></td>
      <td class="p-3"><?= e($u['status']) ?></td>
      <td class="p-3 text-slate-500"><?= e(date('M j, Y', strtotime($u['created_at']))) ?></td>
      <td class="p-3">
        <form method="post" action="<?= url('/admin/users/' . (int)$u['id'] . '/status') ?>" class="flex gap-2"><?= csrf_field() ?>
          <input type="hidden" name="status" value="<?= $u['status']==='active'?'suspended':'active' ?>">
          <button class="text-xs <?= $u['status']==='active'?'text-rose-600':'text-emerald-600' ?>"><?= $u['status']==='active'?'Suspend':'Reactivate' ?></button>
        </form>
      </td>
    </tr>
  <?php endforeach; ?>
  </tbody>
</table>
