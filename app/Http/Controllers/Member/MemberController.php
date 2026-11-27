<?php

namespace App\Http\Controllers\Member;

use App\Enums\SchoolRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Member\StoreMemberRequest;
use App\Http\Requests\Member\UpdateMemberRequest;
use App\Services\Member\MemberService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MemberController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('member/pages/MemberIndex', MemberService::page());
    }

    public function store(StoreMemberRequest $request): RedirectResponse
    {
        MemberService::add($request->validated('email'), SchoolRole::from($request->validated('role')));

        return to_route('school.members.index')->with('success', 'Anggota berhasil ditambahkan.');
    }

    public function update(UpdateMemberRequest $request, int $id): RedirectResponse
    {
        MemberService::changeRole($request->user()->id, $id, SchoolRole::from($request->validated('role')));

        return to_route('school.members.index')->with('success', 'Peran anggota berhasil diperbarui.');
    }

    public function destroy(Request $request, int $id): RedirectResponse
    {
        MemberService::remove($request->user()->id, $id);

        return to_route('school.members.index')->with('success', 'Keanggotaan berhasil dicabut.');
    }
}
