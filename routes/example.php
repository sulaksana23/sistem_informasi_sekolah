<?php

use App\Http\Controllers\Example\ExampleProductController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Halaman contoh bawaan template-react:
// - /example/dashboard, /example/components, /example/settings — etalase layout & UI kit.
// - /example/products — MODUL ACUAN yang mengikuti docs/standard (BACKEND, FRONTEND, DESIGN):
//   Controller tipis + FormRequest di backend; api/ + query key factory, entry page tipis,
//   tabel server-side, kartu statistik, form Inertia, dan halaman detail di frontend.
//   Tiru struktur folder & polanya saat membuat modul sungguhan.
// Terdaftar di resources/js/config/menu.config.tsx (EXAMPLE_MENU_SIDEBAR). Contoh UI dan data
// dilindungi middleware `auth`, sama seperti halaman aplikasi lainnya.
//
// Matikan lewat .env (EXAMPLE_ENABLED=false) buat production/staging — route di bawah jadi
// tidak terdaftar sama sekali, otomatis 404 kalau tetap diakses.
if (! config('example.enabled')) {
    return;
}

Route::middleware('auth')->prefix('example')->name('example.')->group(function () {
    Route::get('/dashboard', fn () => Inertia::render('example/pages/ExampleDashboard'))->name('dashboard');
    Route::get('/components', fn () => Inertia::render('example/pages/ExampleComponents'))->name('components');
    Route::get('/settings', fn () => Inertia::render('example/pages/ExampleSettings'))->name('settings');

    Route::prefix('products')->name('products.')->controller(ExampleProductController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('list', 'list')->name('list');
        Route::get('statistics', 'statistics')->name('statistics');
        Route::get('create', 'create')->name('create');
        Route::post('/', 'store')->name('store');
        Route::get('{id}', 'detail')->whereNumber('id')->name('detail');
    });
});
