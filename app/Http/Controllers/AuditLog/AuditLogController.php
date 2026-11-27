<?php

namespace App\Http\Controllers\AuditLog;

use App\Http\Controllers\Controller;
use App\Services\AuditLog\AuditLogService;
use App\Services\AuditLog\AuditLogServiceImplement;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'type' => ['nullable', Rule::in(array_keys(AuditLogServiceImplement::TYPES))],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        return Inertia::render('audit-log/pages/AuditLogIndex', AuditLogService::page($filters['type'] ?? null));
    }
}
