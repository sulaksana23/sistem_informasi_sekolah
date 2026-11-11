# AGENTS.md

Panduan untuk AI coding agent (Claude Code, Cursor, Codex, Copilot, dsb) dan
developer yang bekerja di project **sistem-informasi-sekolah**.

> Dibuat otomatis oleh `setup-project/scripts/new-project.sh`. Lengkapi bagian
> "Tentang project" dan sesuaikan Project Profile seiring project berkembang.

## Tentang project

Sistem Informasi Sekolah untuk pengelolaan administrasi dan kegiatan akademik. Aplikasi menyediakan akun lokal, master siswa/guru/kelas/mata pelajaran/tahun ajaran, penempatan siswa, penugasan guru, absensi, nilai, dan laporan. Asumsi peran awal dijelaskan di [PRD](docs/requirements/PRD-Sistem-Informasi-Sekolah.md).

Stack: Laravel + Inertia.js v2 + React + TypeScript, dijalankan di Docker.

## Perintah umum

```bash
./docker.sh up                                             # jalankan semua container
docker exec sistem-informasi-sekolah-app php artisan migrate
docker exec sistem-informasi-sekolah-app php artisan test          # test backend (PHPUnit)
docker exec sistem-informasi-sekolah-app vendor/bin/pint           # code style PHP
docker exec sistem-informasi-sekolah-app php artisan make:repository NamaModul --service
docker exec sistem-informasi-sekolah-app php artisan school:create-school "Nama Sekolah" --member-email admin@example.test
docker exec sistem-informasi-sekolah-app php artisan school:assign-member admin@example.test admin --school-id=
docker exec sistem-informasi-sekolah-node npx tsc --noEmit         # type-check frontend
```

## Coding standards (wajib)

Project ini mengikuti standar di `docs/standard/`:
- Backend (`app/`, `routes/`, `tests/`): [BACKEND-STANDARD.md](docs/standard/BACKEND-STANDARD.md)
- Frontend (`resources/js/`): [FRONTEND-STANDARD.md](docs/standard/FRONTEND-STANDARD.md)
- Tampilan/UI (komponen, halaman, CSS): [DESIGN-STANDARD.md](docs/standard/DESIGN-STANDARD.md)

Aturan kerja:
1. Sebelum menulis atau mengubah kode, baca bagian standar yang relevan dengan
   file yang disentuh. Aturan **[WAJIB]** tidak boleh dilanggar. Aturan
   **[DEFAULT]** diikuti kecuali Project Profile di bawah menyatakan lain.
2. Ikuti pola yang ada di kode hanya bila pola itu sesuai standar. Kode lama di
   "Known deviations" JANGAN ditiru. Tulis kode baru sesuai standar.
3. Fitur baru mengikuti checklist BACKEND §18 dan FRONTEND §18, termasuk test
   dan type-check. Perubahan UI dicek dengan checklist review UI (DESIGN §13).
4. Perubahan kontrak (nama route, permission, field form, enum) diterapkan di
   backend DAN frontend dalam perubahan yang sama.
5. Kalau sebuah aturan tidak bisa diikuti, jelaskan alasannya di ringkasan
   pekerjaan. Jangan melanggar diam-diam.
6. File di `docs/standard/` adalah salinan dari `setup-project/standards/`.
   Jangan diedit di sini. Perbedaan khusus project ditulis di Project Profile.

## Project Profile

| Item | Nilai |
|---|---|
| Versi | PHP 8.4, Node 22, Laravel (lihat `composer.json`), Inertia v2, React + TS strict, TanStack Query v5 / Table v8 |
| Domain (folder `api/` & menu) | `auth`; `tenancy` (sekolah aktif + pemafil sekolah); `school` (master data, penempatan, absensi, nilai, laporan) |
| Repository pattern | `itmm/easy-repository` (`make:repository X --service`) |
| Sumber permission | Peran keanggotaan per sekolah (`SchoolRole` di `school_memberships`) + Gate `school.manage`, `school.academic`, `school.report` milik sekolah aktif (TenantContext); hak akses juga dibagikan ke menu Inertia |
| Multi-tenant | Tenant = `schools`; konteks sekolah aktif dari sesi dibentuk middleware `tenant.context` **hanya dari keanggotaan sah**; fail-closed (tanpa konteks = tanpa data + Gate gagal). Semua model data sekolah memakai trait `BelongsToTenant`. |
| Auth web / API | Web memakai session guard, email + password, remember me, dan logout. Pendaftaran mandiri **tidak memberi akses ke sekolah mana pun** (halaman `/no-school`) dan tidak menerima pilihan/peran role; keanggotaan & peran diset operator lewat `school:create-school` / `school:assign-member` dari shell tepercaya. API auth belum dibuat. |
| Database | mariadb-container |
| Query key | URL route, factory `{module}Keys` di `resources/js/api/` (FRONTEND §7) |
| Desain | DESIGN-STANDARD; brand default template `#005f33` (ganti lewat DESIGN §3.1); font sistem; ikon `lucide-react` |
| i18n | react-intl tersedia; halaman login/register memakai Bahasa Indonesia. Samakan strategi lokalisasi sebelum menambah modul. |
| Modul acuan | `resources/js/pages/example/` + `routes/example.php` (contoh modul sesuai standar — tiru polanya, hapus kalau tidak dibutuhkan; matikan dengan `EXAMPLE_ENABLED=false`) |

### Pengecualian dari standar ([DEFAULT] yang diganti)
- Matriks awal: peran berlaku per sekolah; `admin`/`staff` mengelola data dan laporan sekolahnya; `teacher` mengelola absensi/nilai untuk penugasannya per sekolah. Pendaftaran tidak menerima pilihan role. Tinjau asumsi ini bersama sekolah sebelum memakai data nyata.
- Teks halaman login/register memakai Bahasa Indonesia langsung; samakan dengan strategi react-intl saat lokalisasi project ditetapkan.

### Known deviations (kode lama — jangan ditiru)
- `routes/example.php` adalah halaman demo/reference dan hanya dilindungi `auth`. Jangan menyalin pola itu untuk modul bisnis atau data sekolah.

## Paseo request workflow

Run this workflow only when the user sends a prompt for this project; do not schedule recurring analysis.

1. **Analyze:** Use a separate Codex agent on `/analysis/sistem-informasi-sekolah` to inspect the reported error and relevant source files read-only. Identify the root cause with file and line evidence. Do not read `.env`, `.env.docker`, or data under `storage/`.
2. **Plan:** The coordinating agent summarizes the diagnosis and gives a short, ordered implementation plan.
3. **Execute:** For a clear request, immediately launch a separate OpenCode agent in `build` mode on `/workspace/sistem-informasi-sekolah` to implement the requested scope. Ask a question only when the scope is ambiguous or the action is destructive or high impact. Do not run tests unless the user asks for testing or verification.
4. **Review:** After implementation, launch a separate Codex agent on `/analysis/sistem-informasi-sekolah` to review the changed files read-only for bugs, regressions, security issues, and compliance with this file. Do not let the reviewer edit source. If the reviewer finds actionable issues, send them to the OpenCode executor as correction instructions, then run another independent Codex review. Repeat for up to 3 correction rounds; if issues remain, stop and report them to the user. Keep the reviewer read-only.
5. **Report:** Return the diagnosis, plan, changed files, review findings, and test status. This directory is not a Git repository; use the executor's changed-file list and never claim a Git diff. Do not initialize Git.

Use Paseo's built-in tools or CLI to launch the separate agents. Keep file exploration limited to the task.
