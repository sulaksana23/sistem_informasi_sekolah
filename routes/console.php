<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Menetapkan peran & keanggotaan sekolah dilakukan lewat perintah
// school:create-school dan school:assign-member (app/Console/Commands).
