<?php

return [
    // Matikan lewat .env (EXAMPLE_ENABLED=false) buat production/staging —
    // route contoh/demo (routes/example.php) jadi tidak terdaftar sama
    // sekali, jadi otomatis 404 kalau tetap diakses.
    'enabled' => env('EXAMPLE_ENABLED', true),
];
