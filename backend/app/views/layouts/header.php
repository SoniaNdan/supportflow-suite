<?php /** @var string $title */ ?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= e($title ?? APP_NAME) ?> — <?= APP_NAME ?></title>
<script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-50 text-slate-800">
<nav class="bg-white border-b border-slate-200">
  <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
    <a href="/" class="font-bold text-indigo-600"><?= APP_NAME ?></a>
    <div class="flex gap-4 text-sm">
      <?php if (auth_check()): ?>
        <a href="<?= url('/dashboard') ?>" class="hover:text-indigo-600">Dashboard</a>
        <a href="<?= url('/tickets') ?>" class="hover:text-indigo-600">Tickets</a>
        <a href="<?= url('/notifications') ?>" class="hover:text-indigo-600">Notifications</a>
        <?php if (auth_is_admin()): ?>
          <a href="<?= url('/admin/dashboard') ?>" class="hover:text-indigo-600">Admin</a>
        <?php endif; ?>
        <a href="<?= url('/settings') ?>" class="hover:text-indigo-600">Settings</a>
        <form method="post" action="<?= url('/logout') ?>" class="inline"><?= csrf_field() ?>
          <button class="text-rose-600">Logout</button>
        </form>
      <?php else: ?>
        <a href="<?= url('/login') ?>">Sign in</a><a href="<?= url('/register') ?>" class="text-indigo-600 font-medium">Register</a>
      <?php endif; ?>
    </div>
  </div>
</nav>
<main class="max-w-6xl mx-auto px-4 py-6">
<?php if ($m = flash('success')): ?><div class="mb-4 rounded bg-emerald-50 border border-emerald-200 px-4 py-2 text-emerald-700"><?= e($m) ?></div><?php endif; ?>
<?php if ($m = flash('error')): ?><div class="mb-4 rounded bg-rose-50 border border-rose-200 px-4 py-2 text-rose-700"><?= e($m) ?></div><?php endif; ?>
