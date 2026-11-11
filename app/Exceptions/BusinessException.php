<?php

namespace App\Exceptions;

use RuntimeException;

/**
 * Pelanggaran aturan bisnis yang pesannya AMAN dibaca user (docs/standard/BACKEND-STANDARD.md §10).
 * Dilempar dari Service, dirender sentral di bootstrap/app.php (withExceptions):
 * request JSON/AJAX → `{ message }` + $status, form biasa/Inertia → redirect back + flash `error`.
 * Controller tidak perlu try/catch.
 */
class BusinessException extends RuntimeException
{
    public function __construct(string $message, public readonly int $status = 422)
    {
        parent::__construct($message);
    }
}
