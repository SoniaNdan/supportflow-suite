<div class="max-w-md mx-auto mt-12 bg-white rounded-xl shadow p-8">
  <h1 class="text-2xl font-bold mb-1">Sign in</h1>
  <p class="text-sm text-slate-500 mb-6">Welcome back to <?= APP_NAME ?>.</p>
  <form method="post" action="<?= url('/login') ?>" class="space-y-4"><?= csrf_field() ?>
    <div><label class="block text-sm mb-1">Email</label>
      <input type="email" name="email" value="<?= e(old('email')) ?>" required class="w-full rounded border border-slate-300 px-3 py-2"></div>
    <div><label class="block text-sm mb-1">Password</label>
      <input type="password" name="password" required class="w-full rounded border border-slate-300 px-3 py-2"></div>
    <button class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded py-2">Sign in</button>
  </form>
  <p class="text-sm mt-4 text-slate-500">No account? <a href="<?= url('/register') ?>" class="text-indigo-600">Register</a> · <a href="<?= url('/forgot-password') ?>" class="text-indigo-600">Forgot password?</a></p>
</div>
<?php clear_old(); ?>
