<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= e($title ?? 'Access denied') ?> - <?= APP_NAME ?></title>
<script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center px-4">
  <main class="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/60">
    <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-600" aria-hidden="true">
      <svg class="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 3 4.5 6v5.5c0 4.7 3.2 7.9 7.5 9.5 4.3-1.6 7.5-4.8 7.5-9.5V6L12 3Z" />
        <path stroke-linecap="round" d="M12 8v4m0 3h.01" />
      </svg>
    </div>
    <p class="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">403</p>
    <h1 class="mt-2 text-3xl font-bold text-slate-900">Access Restricted</h1>
    <p class="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600"><?= e($message ?? 'You do not have permission to access this area.') ?></p>
    <div class="mt-8 flex flex-wrap justify-center gap-3">
      <a href="<?= url('/dashboard') ?>" class="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700">Back to Dashboard</a>
      <a href="<?= url('/tickets') ?>" class="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">View My Tickets</a>
    </div>
  </main>
</body>
</html>
