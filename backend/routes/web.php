<?php

declare(strict_types=1);

/**
 * Returns an array of routes: [METHOD, /path/pattern, [Controller, method]]
 * Supports {id} placeholders for integers.
 */
return [
    ['GET',  '/',                              [AuthController::class, 'showLogin']],

    ['GET',  '/login',                         [AuthController::class, 'showLogin']],
    ['POST', '/login',                         [AuthController::class, 'login']],
    ['GET',  '/register',                      [AuthController::class, 'showRegister']],
    ['POST', '/register',                      [AuthController::class, 'register']],
    ['POST', '/logout',                        [AuthController::class, 'logout']],
    ['GET',  '/forgot-password',               [AuthController::class, 'showForgot']],
    ['POST', '/forgot-password',               [AuthController::class, 'forgot']],
    ['GET',  '/reset-password',                [AuthController::class, 'showReset']],
    ['POST', '/reset-password',                [AuthController::class, 'reset']],

    ['GET',  '/dashboard',                     [UserController::class, 'dashboard']],
    ['GET',  '/notifications',                 [UserController::class, 'notifications']],
    ['POST', '/notifications/{id}/read',       [UserController::class, 'markNotificationRead']],
    ['POST', '/notifications/read-all',        [UserController::class, 'markAllRead']],

    ['GET',  '/tickets',                       [TicketController::class, 'index']],
    ['GET',  '/tickets/new',                   [TicketController::class, 'create']],
    ['POST', '/tickets',                       [TicketController::class, 'store']],
    ['GET',  '/tickets/{id}',                  [TicketController::class, 'show']],
    ['POST', '/tickets/{id}/reply',            [TicketController::class, 'reply']],

    ['GET',  '/settings',                      [SettingsController::class, 'index']],
    ['POST', '/settings/profile',              [SettingsController::class, 'updateProfile']],
    ['POST', '/settings/password',             [SettingsController::class, 'changePassword']],

    ['GET',  '/admin/dashboard',               [AdminController::class, 'dashboard']],
    ['GET',  '/admin/tickets',                 [AdminController::class, 'tickets']],
    ['POST', '/admin/tickets/{id}/status',     [AdminController::class, 'updateStatus']],
    ['POST', '/admin/tickets/{id}/priority',   [AdminController::class, 'updatePriority']],
    ['POST', '/admin/tickets/{id}/assign',     [AdminController::class, 'assign']],
    ['POST', '/admin/tickets/{id}/revoke',     [AdminController::class, 'revokeAssignment']],
    ['GET',  '/admin/users',                   [AdminController::class, 'users']],
    ['POST', '/admin/users/create',             [AdminController::class, 'createAdmin']],
    ['POST', '/admin/users/{id}/status',       [AdminController::class, 'setUserStatus']],
];
