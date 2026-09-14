<div class="flex items-center justify-between mb-6">
  <div>
    <h1 class="text-2xl font-bold">Users</h1>
    <p class="text-sm text-slate-500 mt-1">
      Manage users and administrators.
    </p>
  </div>
</div>


<!-- CREATE ADMIN -->

<div class="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">

  <div class="mb-5">
    <h2 class="text-lg font-semibold">
      Create administrator
    </h2>

    <p class="text-sm text-slate-500 mt-1">
      Create a new active support administrator account.
    </p>
  </div>

  <form
    method="post"
    action="<?= url('/admin/users/create') ?>"
    class="grid grid-cols-1 md:grid-cols-2 gap-4">

    <?= csrf_field() ?>

    <!-- NAME -->

    <div>
      <label class="block text-sm font-medium text-slate-700 mb-1">
        Full name
      </label>

      <input
        type="text"
        name="name"
        value="<?= e(old('name')) ?>"
        required
        maxlength="100"
        placeholder="e.g. John Doe"
        class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500">
    </div>


    <!-- EMAIL -->

    <div>
      <label class="block text-sm font-medium text-slate-700 mb-1">
        Email address
      </label>

      <input
        type="email"
        name="email"
        value="<?= e(old('email')) ?>"
        required
        placeholder="admin@example.com"
        class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500">
    </div>


    <!-- PASSWORD -->

    <div>
      <label class="block text-sm font-medium text-slate-700 mb-1">
        Password
      </label>

      <input
        type="password"
        name="password"
        required
        minlength="8"
        placeholder="Minimum 8 characters"
        class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500">
    </div>


    <!-- ADMINISTRATOR LEVEL -->

    <div>
      <label class="block text-sm font-medium text-slate-700 mb-1">
        Administrator level
      </label>

      <select
        name="admin_level"
        class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500">
        <option value="support_admin">Support Administrator</option>
        <option value="system_admin">System Administrator</option>
      </select>

      <p class="text-xs text-slate-400 mt-1">
        Only System Administrators can create administrator accounts.
      </p>
    </div>


    <!-- SUBMIT -->

    <div class="md:col-span-2 flex justify-end">

      <button
        type="submit"
        class="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium">
        Create support admin
      </button>

    </div>

  </form>

</div>


<!-- USERS TABLE -->

<div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">

  <div class="p-4 border-b border-slate-100">
    <h2 class="font-semibold">
      All users
    </h2>
  </div>

  <div class="overflow-x-auto">

    <table class="w-full text-sm">

      <thead class="bg-slate-50 text-left text-xs uppercase text-slate-500">

        <tr>
          <th class="p-3">Name</th>
          <th class="p-3">Email</th>
          <th class="p-3">Role</th>
          <th class="p-3">Status</th>
          <th class="p-3">Joined</th>
          <th class="p-3">Actions</th>
        </tr>

      </thead>

      <tbody class="divide-y">

      <?php foreach ($users as $u): ?>

        <tr class="hover:bg-slate-50">

          <td class="p-3 font-medium">
            <?= e($u['name']) ?>
          </td>

          <td class="p-3 text-slate-600">
            <?= e($u['email']) ?>
          </td>

          <td class="p-3">

            <?php if ($u['role'] === 'admin'): ?>

              <span class="inline-flex items-center rounded-full bg-indigo-100 text-indigo-700 px-2 py-1 text-xs font-medium">
                <?= $u['admin_level'] === 'system_admin' ? 'System Admin' : 'Support Admin' ?>
              </span>

            <?php else: ?>

              <span class="inline-flex items-center rounded-full bg-slate-100 text-slate-600 px-2 py-1 text-xs font-medium">
                User
              </span>

            <?php endif; ?>

          </td>

          <td class="p-3">

            <?php if ($u['status'] === 'active'): ?>

              <span class="inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 px-2 py-1 text-xs font-medium">
                Active
              </span>

            <?php else: ?>

              <span class="inline-flex items-center rounded-full bg-rose-100 text-rose-700 px-2 py-1 text-xs font-medium">
                Suspended
              </span>

            <?php endif; ?>

          </td>

          <td class="p-3 text-slate-500">
            <?= e(date('M j, Y', strtotime($u['created_at']))) ?>
          </td>

          <td class="p-3">

            <form
              method="post"
              action="<?= url('/admin/users/' . (int)$u['id'] . '/status') ?>"
              class="inline-flex">

              <?= csrf_field() ?>

              <input
                type="hidden"
                name="status"
                value="<?= $u['status'] === 'active' ? 'suspended' : 'active' ?>">

              <button
                type="submit"
                class="text-xs font-medium <?= $u['status'] === 'active' ? 'text-rose-600 hover:text-rose-800' : 'text-emerald-600 hover:text-emerald-800' ?>">

                <?= $u['status'] === 'active' ? 'Suspend' : 'Reactivate' ?>

              </button>

            </form>

          </td>

        </tr>

      <?php endforeach; ?>

      </tbody>

    </table>

  </div>

</div>