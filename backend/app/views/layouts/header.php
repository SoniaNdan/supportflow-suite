<?php /** @var string $title */ ?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= e($title ?? APP_NAME) ?> — <?= APP_NAME ?></title>
<script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-50 text-slate-800">
<?php
$currentPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$isActive = static function (string $path, bool $includeChildren = false) use ($currentPath): bool {
  $target = url($path);
  return $currentPath === $target
    || ($includeChildren && str_starts_with($currentPath, rtrim($target, '/') . '/'));
};
?>
<nav class="bg-white border-b border-slate-200">
  <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
    <a href=<?= url('/') ?> class="font-bold text-indigo-600"><?= APP_NAME ?></a>
    <div class="flex gap-4 text-sm">
      <?php if (auth_check()): ?>
        <a href="<?= url('/dashboard') ?>" class="hover:text-indigo-600 <?= $isActive('/dashboard') ? 'text-indigo-700 font-semibold' : '' ?>">Dashboard</a>
        <a href="<?= url('/tickets') ?>" class="hover:text-indigo-600 <?= $isActive('/tickets', true) ? 'text-indigo-700 font-semibold' : '' ?>">Tickets</a>
        <?php $unreadNotifications = Notification::unreadCount((int) auth_id()); ?>
        <a href="<?= url('/notifications') ?>" title="Notifications" aria-label="Notifications" class="relative inline-flex items-center gap-1 rounded-lg px-1 py-1 hover:text-indigo-600 <?= $isActive('/notifications') ? 'text-indigo-700 font-semibold' : '' ?>">
          <span class="relative inline-flex h-5 w-5 items-center justify-center">
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
            </svg>
            <?php if ($unreadNotifications > 0): ?>
              <span class="absolute -right-2 -top-2 inline-flex min-h-[1rem] min-w-[1rem] items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-bold leading-none text-white" aria-label="<?= (int)$unreadNotifications ?> unread notifications"><?= (int)$unreadNotifications ?></span>
            <?php endif; ?>
          </span>
          <span>Notifications</span>
        </a>
        <?php if (auth_is_admin()): ?>
          <a href="<?= url('/admin/dashboard') ?>" class="hover:text-indigo-600 <?= $isActive('/admin', true) ? 'text-indigo-700 font-semibold' : '' ?>">Admin</a>
        <?php endif; ?>
        <a href="<?= url('/settings') ?>" class="hover:text-indigo-600 <?= $isActive('/settings') ? 'text-indigo-700 font-semibold' : '' ?>">Settings</a>
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
