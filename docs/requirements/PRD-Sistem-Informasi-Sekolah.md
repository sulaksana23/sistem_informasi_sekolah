# PRD: Sistem Informasi Sekolah

| Field | Value |
|---|---|
| Status | MVP implemented in code; operational decisions remain provisional |
| Versi | v0.3 |
| Tanggal | 06/11/2026 |
| Stack | Laravel, Inertia.js, React, TypeScript, MariaDB |

## 1. Tujuan dan pengguna

Aplikasi memusatkan administrasi sekolah dan pencatatan akademik. Satu instalasi melayani beberapa sekolah (tenant): setiap sekolah punya data master, staf, dan akademik sendiri (lihat §8). Pengguna MVP adalah administrator sekolah, petugas tata usaha, dan guru per sekolah; keanggotaan ditetapkan operator via perintah shell karena pendaftaran mandiri tidak memberi akses ke sekolah mana pun.

## 2. Cakupan MVP

- Tenant sekolah: tabel `schools`, keanggotaan pengguna per sekolah (`school_memberships`) beserta peran, pemilih sekolah aktif, dan isolasi data per sekolah — lihat §8.
- Akun lokal: daftar, login, logout, dan sesi terlindungi.
- Master CRUD: siswa, guru, kelas, mata pelajaran, dan tahun ajaran.
- Penempatan siswa pada satu kelas per tahun ajaran.
- Penugasan guru ke kelas dan mata pelajaran per tahun ajaran.
- Absensi harian: hadir, sakit, izin, alpa.
- Nilai per asesmen dengan nilai maksimum yang dapat diatur.
- Dashboard dan laporan akademik dengan filter tahun ajaran/kelas, cetak, dan CSV.

Jadwal pelajaran, semester terpisah, portal siswa/wali, notifikasi, pembayaran, perpustakaan, LMS, API eksternal, SSO, dan reset kata sandi email belum termasuk. UI khusus untuk mengelola keanggotaan (lihat §8 keterbatasan) belum ada; pengelolaan anggota dilakukan lewat perintah shell.

## 3. Peran dan aturan akses (asumsi awal)

Peran berlaku **per sekolah** (enum `SchoolRole` pada keanggotaan):

| Peran | Akses pada sekolah tempat tergabung |
|---|---|
| `admin` | Semua master data, penempatan, penugasan, akademik, dan laporan |
| `staff` | Semua master data, penempatan, penugasan, akademik, dan laporan |
| `teacher` | Absensi kelas yang ditugaskan sebagai guru/wali kelas; nilai untuk pasangan kelas-mapel-tahun ajaran yang ditugaskan |

Role tidak dapat dikirim melalui form register, dan pendaftaran mandiri tidak memberi akses ke sekolah mana pun — akun baru tetap di halaman "Belum tergabung di sekolah" sampai operator menetapkan keanggotaan melalui perintah shell (`school:create-school`, `school:assign-member`). Profil akun guru dihubungkan ke data guru pada halaman Data Guru per sekolah. Matriks ini perlu disahkan sekolah sebelum memakai data nyata.

## 4. Alur dan aturan bisnis

1. Petugas membuat tahun ajaran, guru, kelas, mata pelajaran, dan siswa.
2. Petugas menempatkan siswa pada kelas dan tahun ajaran; satu siswa hanya dapat memiliki satu penempatan per tahun ajaran.
3. Petugas menghubungkan akun login dengan profil guru lalu membuat penugasan kelas/mapel/tahun.
4. Guru memilih kelas dan tanggal absensi, lalu menyimpan status siswa aktif. Menyimpan ulang siswa/tanggal yang sama memperbarui catatan.
5. Guru memilih kelas/mapel dan nama asesmen untuk mengisi nilai. Nilai harus berada dalam rentang 0 hingga nilai maksimum; baris tanpa nilai dilewati.
6. Petugas/admin melihat laporan per tahun ajaran dan opsional kelas. Rata-rata nilai menormalisasi setiap asesmen terhadap nilai maksimumnya; absensi dihitung dari catatan yang tersimpan.
7. Data yang sudah dipakai absensi/nilai tidak bisa dihapus. Hanya satu tahun ajaran dapat berstatus aktif per sekolah.

## 5. Data utama

| Entitas | Data penting | Relasi/aturan |
|---|---|---|
| `schools` | nama tenant | nama unik; dibuat operator lewat `school:create-school` |
| `school_memberships` | sekolah, user, peran (`admin`/`staff`/`teacher`) | satu baris keanggotaan per user per sekolah |
| `users` | nama, email, password hash | email unik global; tanpa peran global — peran hidup di keanggotaan per sekolah |
| `students` | NIS, NISN opsional, nama, jenis kelamin, tanggal lahir, kontak, status | NIS unik per sekolah; NISN unik per sekolah bila diisi |
| `teachers` | nomor pegawai, nama, kontak, status, `user_id` opsional | nomor pegawai unik per sekolah; satu akun bisa jadi guru di beberapa sekolah |
| `school_classes` | nama, tingkat, rombel, wali kelas | tingkat + rombel unik per sekolah |
| `subjects` | kode, nama, deskripsi | kode unik per sekolah |
| `academic_years` | nama, tanggal mulai/akhir, aktif | nama unik per sekolah; maksimal satu aktif per sekolah |
| `student_enrollments` | siswa, kelas, tahun, tanggal masuk, status | satu siswa per tahun ajaran; siswa/kelas/tahun harus satu sekolah |
| `teacher_assignments` | guru, kelas, mapel, tahun | kombinasi unik; keempat referensi harus satu sekolah |
| `attendances` | penempatan, tanggal, status, catatan, pencatat | satu catatan per siswa/tanggal |
| `grades` | penempatan, mapel, asesmen, tanggal, nilai, maksimum, catatan, pencatat | satu nilai per siswa/mapel/nama asesmen; penempatan dan mapel harus satu sekolah |

Seluruh entitas data sekolah membawa kolom `school_id` yang dijaga global scope model (lihat §8).

## 6. Antarmuka utama

| Route | Akses | Fungsi |
|---|---|---|
| `/no-school` | Akun tanpa keanggotaan | Info belum tergabung + keluar; semua area lain mengarah ke sini |
| `/tenancy/current` (POST) | Anggota sekolah | Ganti sekolah aktif (membentuk ulang konteks sesi) |
| `/dashboard` | Anggota sekolah | Ringkasan sekolah aktif dan akses cepat |
| `/school/students`, `/school/teachers`, `/school/classes`, `/school/subjects`, `/school/academic-years` | Admin/staff sekolah aktif | CRUD master data |
| `/school/enrollments`, `/school/teacher-assignments` | Admin/staff sekolah aktif | Penempatan siswa dan penugasan guru |
| `/school/attendance`, `/school/grades` | Admin/staff sekolah aktif; guru dibatasi penugasan | Input absensi dan nilai |
| `/school/reports` | Admin/staff sekolah aktif | Ringkasan akademik, cetak, ekspor CSV |

Semua form divalidasi di server. Route dibatasi middleware `auth`, `tenant.context` (konteks sekolah), dan Gate `can:`; service memeriksa ulang cakupan penugasan guru dan kesetiaan tenant pada referensi yang dikirim sebelum menyimpan data akademik. Pemilih sekolah aktif tampil di kepala halaman sekolah.

## 7. Keamanan dan keputusan lanjutan

- Kata sandi di-hash, form dilindungi CSRF, sesi diregenerasi saat login, dan login/register dibatasi percobaan.
- Jangan menerima role dari input publik. Jalankan perintah penetapan role dari operator tepercaya.
- Jalankan migrasi sebelum memakai modul sekolah.
- Data siswa dan nilai bersifat sensitif; aktifkan HTTPS, backup, dan pembatasan akses server produksi.
- Sekolah masih perlu mengonfirmasi kebijakan pendaftaran, peran kepala sekolah, format NIS/NIP, rentang kelas, kalender/semester, kategori dan koreksi nilai, masa retensi, serta kebutuhan akses siswa/wali.

## 8. Model multi-sekolah, onboarding, dan keterbatasan

### 8.1 Model tenant

- **Tenant** = baris `schools` (nama). **Keanggotaan** = baris `school_memberships` (`user_id` + `school_id` + peran `SchoolRole`). Satu akun boleh anggota lebih dari satu sekolah; sebuah guru dapat punya profil guru di tiap sekolahnya.
- **Konteks sekolah aktif** disimpan di sesi (`current_school_id`) dan dibentuk `SetTenantContext` per request, hanya dari keanggotaan yang sah. Tanpa konteks: semua kueri data sekolah kosong, Gate permission gagal, dan request diarahkan ke `/no-school` (deny-by-default).
- **Isolasi data** lewat kolom `school_id` di seluruh tabel data sekolah + global scope (`BelongsToTenant`): baca laut ter-pagasi tenant aktif, tulis/baru ditandai sekolah aktif, dan update/delete lintas tenant tidak dapat menyentuh baris lain (fail-closed). Validasi FormRequest juga mencakup `school_id` pada rule `unique`/`exists`.
- **Kegagalan akses via ID** (IDOR) di jalur create/update/delete ditolak: rule `exists` dibatasi sekolah aktif, dan service memeriksa ulang bahwa seluruh referensi (siswa/kelas/mapel/tahun/guru) milik sekolah yang sama sebelum menyimpan.
- **Permission** = mapping Gate (`school.manage`, `school.academic`, `school.report`) dari peran keanggotaan sekolah aktif, dibagikan juga ke menu Inertia.

### 8.2 Onboarding sekolah baru (operator, shell tepercaya)

1. `php artisan school:create-school {nama} [--member-email=admin@x.y]` — membuat tenant dan (opsional) menetapkan admin pertama.
2. `php artisan school:assign-member {email} {admin|staff|teacher} [--school-id=]` — menambah/memutakhirkan anggota. Tanpa `--school-id` hanya berlaku bila tepat satu tenant ada; operator harus memilih sekolah eksplisit bila lebih dari satu.
3. User yang sudah masuk memilih sekolah lewat pemilih sekolah aktif; keanggotaan baru berlaku saat request berikutnya.

Pendaftaran mandiri tidak mengaitkan akun ke sekolah mana pun dan tidak menerima peran.

### 8.3 Migrasi data lama

Migrasi `2026_11_06_100002_tenantize_school_tables` membuat tenant awal (nama dari `TENANT_INITIAL_NAME`, default `Sekolah Utama`) dan mengaitkan seluruh data lama ke tenant itu — pemetaan tidak ambigu karena asumsi lama satu instalasi = satu sekolah. Kolom `users.role` (peran global) dihapus dan digantikan keanggotaan; **akun lama tidak otomatis jadi anggota** — operator harus menjalankan `school:assign-member` untuk tiap akun setelah migrate, sampai saat itu akses aplikasi akan menampilkan halaman `/no-school`. Nama tenant awal sebaiknya segera diperbaiki operator (belum ada UI rename tenant).

### 8.4 Keterbatasan yang belum ditangani

- Tidak ada UI/e2e endpoint untuk membuat/mengubah tenant dan mengelola keanggotaan — lewat perintah shell saja.
- Simpanan konteks tidak diperbarui real-time saat keanggotaan dicabut; efeknya muncul pada request berikutnya.
- Absensi/nilai/penempatan mengacu referensi lintas entitas dalam satu sekolah; belum ada pekerjaan lintas-sekolah (konsolidasi laporan grup) — di luar cakupan MVP.
- Pengujian fitur tenant belum dibuat (kontrak pekerjaan ini melarang menambah file test).
