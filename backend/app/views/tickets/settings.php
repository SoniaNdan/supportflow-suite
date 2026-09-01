<h1 class="text-2xl font-bold mb-6">Settings</h1>

<div class="grid md:grid-cols-2 gap-6">

    <!-- Profile -->
    <form method="post"
          action="<?= url('/settings/profile') ?>"
          class="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-3">

        <?= csrf_field() ?>

        <h2 class="font-semibold text-lg">Profile</h2>

        <div>
            <label class="block text-sm text-slate-600 mb-1">Name</label>
            <input
                type="text"
                name="name"
                value="<?= e($user['name']) ?>"
                required
                class="w-full rounded border border-slate-300 px-3 py-2"
            >
        </div>

        <div>
            <label class="block text-sm text-slate-600 mb-1">Email</label>
            <input
                type="email"
                name="email"
                value="<?= e($user['email']) ?>"
                required
                class="w-full rounded border border-slate-300 px-3 py-2"
            >
        </div>

        <button
            type="submit"
            class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
            Save changes
        </button>

    </form>


    <!-- Change Password -->
    <form method="post"
          action="<?= url('/settings/password') ?>"
          class="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-3">

        <?= csrf_field() ?>

        <h2 class="font-semibold text-lg">Change password</h2>

        <div>
            <label class="block text-sm text-slate-600 mb-1">
                Current password
            </label>

            <input
                type="password"
                name="current_password"
                placeholder="Enter your current password"
                required
                class="w-full rounded border border-slate-300 px-3 py-2"
            >
        </div>

        <div>
            <label class="block text-sm text-slate-600 mb-1">
                New password
            </label>

            <input
                type="password"
                name="new_password"
                placeholder="New password (min 8 characters)"
                required
                minlength="8"
                class="w-full rounded border border-slate-300 px-3 py-2"
            >
        </div>

        <button
            type="submit"
            class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
            Update password
        </button>

    </form>

</div>