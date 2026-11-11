<?php

return [
    // Nama tenant awal yang dipakai migrasi saat mengaitkan data lama satu
    // instalasi ke satu sekolah. Ganti sebelum migrate bila perlu.
    'initial_school_name' => env('TENANT_INITIAL_NAME', 'Sekolah Utama'),
];
