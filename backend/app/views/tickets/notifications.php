<div class="flex justify-between items-center mb-6">

    <div>
        <h1 class="text-2xl font-bold">Notifications</h1>

        <p class="text-sm text-slate-500 mt-1">
            Stay updated on your tickets and replies.
        </p>
    </div>

    <?php if ($items): ?>
        <form
            method="post"
            action="<?= url('/notifications/read-all') ?>"
        >
            <?= csrf_field() ?>

            <button
                type="submit"
                class="text-sm text-indigo-600 hover:text-indigo-800"
            >
                Mark all as read
            </button>
        </form>
    <?php endif; ?>

</div>


<div class="bg-white rounded-xl shadow-sm border border-slate-100 divide-y">

    <?php foreach ($items as $n): ?>

        <div
            class="p-4 <?= !$n['is_read']
                ? 'bg-indigo-50 border-l-4 border-indigo-500'
                : 'bg-white'
            ?>"
        >

            <div class="flex justify-between gap-4">

                <div class="min-w-0">

                    <div class="flex items-center gap-2">

                        <div class="font-medium">
                            <?= e($n['title']) ?>
                        </div>

                        <?php if (!$n['is_read']): ?>

                            <span class="text-[10px] uppercase font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                                New
                            </span>

                        <?php endif; ?>

                    </div>

                    <p class="text-sm text-slate-600 mt-1">
                        <?= e($n['message']) ?>
                    </p>

                </div>

                <span class="text-xs text-slate-500 whitespace-nowrap">
                    <?= e(date('M j, H:i', strtotime($n['created_at']))) ?>
                </span>

            </div>


            <?php if (!$n['is_read']): ?>

                <form
                    method="post"
                    action="<?= url('/notifications/' . (int)$n['id'] . '/read') ?>"
                    class="mt-3"
                >
                    <?= csrf_field() ?>

                    <button
                        type="submit"
                        class="text-xs text-indigo-600 hover:text-indigo-800"
                    >
                        Mark as read
                    </button>
                </form>

            <?php else: ?>

                <div class="mt-3 text-xs text-slate-400">
                    Read
                </div>

            <?php endif; ?>

        </div>

    <?php endforeach; ?>


    <?php if (!$items): ?>

        <div class="p-8 text-center">

            <div class="text-slate-400 text-sm">
                You don't have any notifications yet.
            </div>

        </div>

    <?php endif; ?>

</div>