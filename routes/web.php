<?php

use App\Http\Controllers\LabelController;
use App\Http\Controllers\MemoController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/test', function () {
    return Inertia::render(
        'Test'
    );
});

Route::get('/up-memo', [LabelController::class, 'index'])->middleware(['auth', 'verified'])->name('up-memo');
Route::get('/dashboard', [MemoController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::resource('memos', MemoController::class);
    Route::resource('labels', LabelController::class);
});

require __DIR__ . '/auth.php';
