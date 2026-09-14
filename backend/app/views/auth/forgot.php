<div class="max-w-md mx-auto mt-12 bg-white rounded-xl shadow p-8">
  <h1 class="text-2xl font-bold mb-2">Forgot password</h1>
  <p class="text-sm text-slate-500 mb-4">Enter your email and we'll send a reset link if an account exists.</p>
  <form method="post" action="<?= url('/forgot-password') ?>" class="space-y-4"><?= csrf_field() ?>
    <input type="email" name="email" required placeholder="you@example.com" class="w-full rounded border border-slate-300 px-3 py-2">
    <button class="w-full bg-indigo-600 text-white rounded py-2">Send reset link</button>
  </form>
</div>
