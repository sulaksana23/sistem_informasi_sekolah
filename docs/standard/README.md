# Coding Standards — Laravel (Inertia + React / Blade)

Folder ini berisi standar kode yang **portable**: bisa disalin ke project
lain dengan stack yang sama, lalu dijadikan aturan wajib bagi developer dan
AI coding agent (Claude Code, Cursor, Copilot, Codex, dsb).

| File | Isi | Kapan dipakai |
|---|---|---|
| [BACKEND-STANDARD.md](BACKEND-STANDARD.md) | Route → Controller → FormRequest → Service (Facade) → Repository → Model, Inertia response, error, permission, job, test | Setiap menulis kode di `app/`, `routes/`, `tests/` |
| [FRONTEND-STANDARD.md](FRONTEND-STANDARD.md) | Struktur `resources/js`, page Inertia, layer API, query key, data fetching, form, tabel, types | Setiap menulis kode di `resources/js/` |
| [DESIGN-STANDARD.md](DESIGN-STANDARD.md) | Token warna/radius/tipografi, spasi, resep komponen (card, tombol, badge, tabel, form), state, dark mode, aksesibilitas | Setiap membuat atau mengubah tampilan |
| [FRONTEND-BLADE-STANDARD.md](FRONTEND-BLADE-STANDARD.md) | **Project Blade**: struktur `resources/views/pages`, component Blade, JS halaman + helper global `App`, DataTables, form/modal, status Enum, aset | Setiap menulis view/JS di project Blade |
| [DESIGN-BLADE-STANDARD.md](DESIGN-BLADE-STANDARD.md) | **Project Blade**: token Metronic/Bootstrap, warna status, tipografi, resep card/KPI/tombol/badge/tabel/modal/drawer, `custom.css` | Setiap mengubah tampilan di project Blade |

| Stack | Standar yang dipakai |
|---|---|
| Inertia + React | `BACKEND-STANDARD` + `FRONTEND-STANDARD` + `DESIGN-STANDARD` |
| Blade (Metronic / `template-blade`) | `BACKEND-STANDARD` (§0.1) + `FRONTEND-BLADE-STANDARD` + `DESIGN-BLADE-STANDARD` |

Nama route, nama permission, nama field form, dan nilai enum adalah
**kontrak** di antara backend dan frontend di kedua stack.

**Sumber utama** standar ini ada di repo `setup-project` (folder `standards/`).
Project baru yang dibuat dengan `scripts/new-project.sh` otomatis mendapat
salinannya beserta `AGENTS.md` dan `CLAUDE.md`. Project lama bisa diperbarui
dengan `scripts/sync-standards.sh <folder-project>`.

---

## 1. Memasang ke Project Lain

1. Project baru: sudah otomatis lewat `new-project.sh`. Project lama: jalankan
   `setup-project/scripts/sync-standards.sh <folder-project>`, atau salin manual
   `README.md` + standar yang relevan ke `docs/standard/` di project target.
   Jangan ubah isinya. Perbedaan per
   project ditulis di Project Profile (langkah 2), supaya file standar tetap
   bisa disinkronkan antar project.
2. Isi **Project Profile** (§3) di file instruksi agent project target
   (`CLAUDE.md`, `AGENTS.md`, `.cursor/rules`, dsb).
3. Tempel **instruksi agent** (§2) di file yang sama.
4. Setup awal sekali saja:
   - Backend: pasang repository pattern (BACKEND §2), `BusinessException` +
     render sentral (BACKEND §10), shared props `flash`/`auth` (BACKEND §11).
     Project baru dari `new-project.sh` sudah membawa ketiganya; modul acuan
     `/example/products` (template-react / template-blade) menunjukkan alur
     lengkap Controller → FormRequest → Service → Repository + test.
   - Frontend: page resolver lazy (FRONTEND §5.3), satu `QueryClientProvider`
     dengan toast error global (FRONTEND §8.3), hook `use-permission`,
     `use-datatables`.
   - Desain: salin token CSS + primitive `components/ui` + komponen pola,
     lalu ganti brand ramp (DESIGN §14).
   - **Blade**: salin helper `App` ke `public/assets/js/app/app.js`
     (FRONTEND-BLADE Lampiran A), `custom.css` + component baku
     (`status-badge`, `kpi-card`, `datatable-toolbar`) dari DESIGN-BLADE
     Lampiran B, lalu ganti brand (DESIGN-BLADE §3.1). Project yang memakai
     `template-blade` sudah membawa semuanya, plus modul acuan `/example/products`.
5. Jalankan pemeriksaan otomatis (§4) dan perbaiki pelanggaran yang ada,
   atau catat sebagai *Known deviations* di Project Profile supaya agent tidak
   menirunya.

---

## 2. Instruksi untuk AI Agent (salin ke CLAUDE.md / AGENTS.md)

```markdown
## Coding standards (wajib)

Project ini mengikuti standar di `docs/standard/`:
- Backend (`app/`, `routes/`, `tests/`): `docs/standard/BACKEND-STANDARD.md`
- Frontend (`resources/js/`): `docs/standard/FRONTEND-STANDARD.md`
- Tampilan/UI (komponen, halaman, CSS): `docs/standard/DESIGN-STANDARD.md`

Aturan kerja:
1. Sebelum menulis atau mengubah kode, baca bagian standar yang relevan dengan
   file yang disentuh. Aturan **[WAJIB]** tidak boleh dilanggar. Aturan
   **[DEFAULT]** diikuti kecuali Project Profile di bawah menyatakan lain.
2. Ikuti pola yang ada di kode hanya bila pola itu sesuai standar. Kalau kode
   lama melanggar standar (lihat "Known deviations"), JANGAN ditiru. Tulis kode
   baru sesuai standar. Rapikan kode lama hanya bila masih dalam lingkup tugas.
3. Fitur baru mengikuti checklist di akhir masing-masing standar
   (BACKEND §18, FRONTEND §18), termasuk test dan type-check. Perubahan UI
   dicek dengan checklist review UI (DESIGN §13).
4. Perubahan yang menyentuh kontrak (nama route, permission, field form, enum)
   harus diterapkan di backend DAN frontend dalam perubahan yang sama.
5. Kalau sebuah aturan tidak bisa diikuti, jelaskan alasannya di ringkasan
   pekerjaan. Jangan melanggar diam-diam.
```

Untuk project **Blade**, ganti baris rujukan frontend/desain di atas dengan:

```markdown
- Frontend (`resources/views/`, `public/assets/js/app/`): `docs/standard/FRONTEND-BLADE-STANDARD.md`
- Tampilan/UI (view, component Blade, `custom.css`): `docs/standard/DESIGN-BLADE-STANDARD.md`
```

dan checklist fitur baru menjadi BACKEND §18 + FRONTEND-BLADE §18 + DESIGN-BLADE §14.

---

## 3. Template Project Profile

Isi bagian ini di `CLAUDE.md`/`AGENTS.md` project target. Hapus baris yang
tidak relevan.

```markdown
## Project Profile (untuk docs/standard)

| Item | Nilai di project ini |
|---|---|
| Versi | Laravel 12, PHP 8.2, Inertia v2, React 19, TS strict, TanStack Query v5 |
| Domain/grup modul | master-data, promotion, api-management, monitoring, settings |
| Repository pattern | itmm/easy-repository (`make:repository X --service`) |
| Sumber permission | SSO eksternal / spatie/laravel-permission / ... ; katalog: PERMISSIONS.md |
| Helper test login | `actingAsWithPermissions([...])` di tests/TestCase.php |
| Auth web / API | SSO session / Sanctum token |
| Koneksi DB tambahan | Oracle read-only `vega` (tidak boleh ditulis) |
| Query key | URL route (`{module}Keys` di api/) — FRONTEND §7 |
| UI kit | shadcn-style di components/ui; ikon: lucide-react |
| Brand (DESIGN §3.1) | primary #005f33 (+ ramp), destructive rose-600; font: <nama font / font sistem> |
| i18n | react-intl, bahasa default en, file: resources/js/i18n/messages/*.json |
| Lokasi util | lib/ (utils/ tidak dipakai) |
| Cara menjalankan | `docker exec app php artisan test`, `docker exec node npx tsc --noEmit` |

### Pengecualian dari standar ([DEFAULT] yang diganti)
- (contoh) Form wizard promotion memakai `useMutation` autosave, bukan `useForm` saja.

### Known deviations (kode lama — jangan ditiru)
- (contoh) Beberapa Controller masih memegang `DB::beginTransaction()`.
```

---

## 4. Pemeriksaan Otomatis

Jalankan sebelum commit, atau pasang di CI:

```bash
# Backend
php artisan test
vendor/bin/pint --test
grep -rn "DB::beginTransaction\|DB::transaction" app/Http/Controllers      # harus kosong
grep -rn "request()" app/Repositories                                      # harus kosong

# Frontend Blade: lihat FRONTEND-BLADE-STANDARD §17

# Frontend Inertia/React
npx tsc --noEmit
grep -rlE "from ['\"]@/pages/" resources/js/{components,hooks,api,types,lib,layouts}   # harus kosong
grep -rnE "from ['\"]axios['\"]" resources/js/{pages,components} | grep -v "import type" # harus kosong
find resources/js/pages -type d \( -name api -o -name types \)                         # harus kosong
```

---

## 5. Memperbarui Standar

- Standar berubah lewat PR ke `setup-project/standards/docs/`, lalu disebar ke
  project yang memakainya dengan `scripts/sync-standards.sh`. Satu sumber,
  banyak salinan. Jangan mengedit salinan di `docs/standard/` sebuah project
  tanpa mengembalikannya ke sumber.
- Perubahan harus berasal dari pola yang **sudah terbukti** di kode nyata,
  atau dari bug nyata (sertakan contohnya, seperti catatan bug query key di
  FRONTEND §7).
- Hal spesifik satu project (nama sistem eksternal, nama domain, path
  container) tidak dimasukkan ke file standar. Tempatnya di Project Profile.
