<?php

namespace App\Http\Controllers\Tenancy;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tenancy\SwitchSchoolRequest;
use App\Services\Tenancy\TenantService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TenantController extends Controller
{
    public function noSchool(): Response
    {
        return Inertia::render('tenancy/pages/NoSchoolAccess');
    }

    public function switchSchool(SwitchSchoolRequest $request): RedirectResponse
    {
        $school = TenantService::membershipFor($request->user()->id, (int) $request->validated()['school_id'])['school'];

        $request->session()->put('current_school_id', $school->id);

        return back()->with('success', "Sekolah aktif diubah ke {$school->name}.");
    }
}
