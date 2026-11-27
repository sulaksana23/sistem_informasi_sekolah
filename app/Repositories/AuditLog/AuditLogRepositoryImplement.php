<?php

namespace App\Repositories\AuditLog;

use App\Models\Attendance;
use App\Models\AuditLog;
use App\Models\Grade;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Itmm\EasyRepository\Implementations\Eloquent;

class AuditLogRepositoryImplement extends Eloquent implements AuditLogRepository
{
    public function __construct(protected AuditLog $model) {}

    public function paginate(?string $type, int $perPage): LengthAwarePaginator
    {
        $page = AuditLog::query()->with('user:id,name')
            ->when($type, fn ($query) => $query->where('auditable_type', $type))
            ->latest('id')->paginate($perPage)->withQueryString();

        // Label subjek (siswa + konteks) diambil sekali per tipe, bukan per baris.
        $logs = $page->getCollection();
        $grades = Grade::query()->with(['enrollment.student:id,name', 'subject:id,name'])
            ->whereIn('id', $logs->where('auditable_type', 'grade')->pluck('auditable_id'))->get()->keyBy('id');
        $attendances = Attendance::query()->with('enrollment.student:id,name')
            ->whereIn('id', $logs->where('auditable_type', 'attendance')->pluck('auditable_id'))->get()->keyBy('id');

        $page->setCollection($logs->map(function (AuditLog $log) use ($grades, $attendances) {
            $subject = match ($log->auditable_type) {
                'grade' => ($row = $grades->get($log->auditable_id))
                    ? "{$row->enrollment?->student?->name} · {$row->subject?->name} · {$row->assessment_name}" : null,
                'attendance' => ($row = $attendances->get($log->auditable_id))
                    ? "{$row->enrollment?->student?->name} · {$row->attendance_date?->format('Y-m-d')}" : null,
                default => null,
            };

            return [
                'id' => $log->id, 'event' => $log->event, 'type' => $log->auditable_type,
                'subject' => $subject ?? "#{$log->auditable_id}", 'user_name' => $log->user?->name,
                'old_values' => $log->old_values, 'new_values' => $log->new_values,
                'created_at' => $log->created_at?->format('Y-m-d H:i'),
            ];
        }));

        return $page;
    }
}
