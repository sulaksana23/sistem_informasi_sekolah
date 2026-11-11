# Standar Desain UI — Laravel + Inertia + React + Tailwind

> Standar visual portable untuk aplikasi internal/admin di stack yang sama
> dengan [FRONTEND-STANDARD.md](FRONTEND-STANDARD.md). Dipakai developer
> **dan** AI agent setiap kali membuat atau mengubah tampilan. Cara memasang ke
> project lain: [README.md](README.md).
>
> Diekstrak dari tampilan nyata **m-campaign** (2026-10): token di
> `resources/css/*.css`, primitive di `resources/js/components/ui/`, lalu
> diukur ulang di browser. Nilai warna di dokumen ini adalah nilai m-campaign.
> Project lain cukup mengganti **brand ramp** (§3.1). Aturan lainnya tetap.

## 0. Cara Membaca & Cakupan

| Label | Arti |
|---|---|
| **[WAJIB]** | Berlaku di semua project pengguna standar ini. |
| **[DEFAULT]** | Nilai baku. Boleh diganti, asal dicatat di Project Profile. |
| **[OPSIONAL]** | Pakai bila dibutuhkan. |

**Cakupan:** area konten halaman (semua yang ada di dalam `<Container>`):
card, tabel, form, tombol, badge, alert, tab, statistik, dialog. **App shell**
(sidebar, topbar, menu) mengikuti template layout masing-masing project dan
tidak diatur di sini, kecuali soal token warna.

---

## 1. Prinsip Desain

1. **[WAJIB] Datar, garis tipis, tanpa bayangan.** Permukaan dibedakan oleh
   warna fill dan border 1px, bukan shadow. Card **tidak** memakai `shadow-*`
   dan tidak punya efek hover. Shadow hanya untuk layer yang melayang
   (popover, dropdown, dialog, toast).
2. **[WAJIB] Satu aksi utama per area.** Tombol solid warna brand hanya
   dipakai untuk satu aksi terpenting di setiap area (toolbar, footer dialog,
   kartu). Aksi lain memakai `secondary`, `outline`, `ghost`, atau `link`.
3. **[WAJIB] Warna = state, bukan dekorasi.** Warna status (sukses, peringatan,
   bahaya, info) selalu berpasangan dengan teks atau ikon yang menjelaskan
   maknanya. Tidak ada informasi yang hanya disampaikan lewat warna.
4. **[WAJIB] Angka netral, warna di ikon.** Di kartu statistik, angka besar
   berwarna netral. Warna hanya muncul di *icon chip* kecil.
5. **[WAJIB] Hierarki lewat ukuran & weight, bukan warna.** Judul maksimal
   `font-semibold` (600), umumnya `font-medium` (500). Teks pendukung memakai
   `text-muted-foreground`. Tidak ada paragraf yang ditebalkan seluruhnya.
6. **[WAJIB] Semua nilai visual lewat token.** Halaman tidak menulis hex atau
   radius/ukuran arbitrer. Pakai class semantik (`bg-primary`,
   `text-muted-foreground`, `border-border`, `rounded-sm`).

---

## 2. Arsitektur Token

```
resources/css/
├── config.reui.css   # token inti: background, foreground, card, primary + brand ramp, muted, border, radius, chart
└── app.css           # token status (success/warning/info/destructive-foreground), invert, kategori chart (mech-1..5), font
```

- **[WAJIB]** Token didefinisikan sebagai CSS variable di `:root` (terang) dan
  `.dark` (gelap). Token lalu dipetakan ke Tailwind lewat `@theme inline`
  (`--color-primary: var(--primary)`), supaya class `bg-primary`,
  `text-success`, dan sejenisnya tersedia.
- **[WAJIB]** Komponen dan halaman hanya memakai class semantik. Palet mentah
  Tailwind (`bg-green-50`, `text-amber-700`) **hanya** boleh dipakai di dalam
  primitive atau komponen pola (StatCard, chip) yang sudah memetakan warnanya
  di satu tempat, tidak di halaman.
- **[WAJIB]** Nama token tidak diganti. Untuk mengubah tampilan, ubah nilainya.
  Semua primitive sudah membaca nama-nama ini.
- **[WAJIB]** Token baru hanya ditambahkan kalau maknanya belum ada. Token baru
  harus punya nilai terang **dan** gelap, plus mapping di `@theme inline`.

---

## 3. Warna

### 3.1 Brand Ramp **[DEFAULT — ganti per project]**

| Token | m-campaign (terang) | Gelap | Peran |
|---|---|---|---|
| `--primary` | `#005f33` | `#1a7a4a` | Tombol utama, indikator aktif (tab/nav), focus ring |
| `--primary-foreground` | white | white | Teks di atas primary |
| `--brand-light` | `#1a7a4a` | `#2d9c62` | Hover tombol utama |
| `--brand-medium` | `#2d9c62` | `#40b876` | Aksen, seri chart |
| `--brand-strong` | `#003d21` | `#d4ede1` | Teks di atas `brand-soft`, link penekanan |
| `--brand-soft` | `#d4ede1` | `#0d3d20` | Fill tombol `secondary` |
| `--brand-softer` | `#eaf6f0` | `#081f10` | Tint latar halus, chip ikon brand |

Cara menurunkan ramp untuk project lain:
1. Ambil warna dominan logo. Kalau kontrasnya dengan teks putih kurang dari
   4.5:1, gelapkan sampai lolos. Hasilnya jadi `--primary`.
2. `brand-light` dan `brand-medium`: hue yang sama, 1 dan 2 langkah lebih terang.
   `brand-strong`: sekitar 35% lebih gelap.
3. `brand-soft` dan `brand-softer`: tint sangat pucat dengan hue yang sama,
   cukup pucat supaya teks `brand-strong` di atasnya tetap lolos AA.
4. Kalau logo punya warna merah, merah itu **tidak** dijadikan primary. Merah
   disimpan untuk `destructive`, supaya aksi hapus/tolak tidak tertukar dengan
   aksi utama.

### 3.2 Warna Status **[WAJIB — makna tetap, nilai boleh disesuaikan]**

| Token | Nilai m-campaign | Teks di atas tint (`*-foreground`) | Dipakai untuk |
|---|---|---|---|
| `--success` | `#1F8A4C` | `#045C33` | Berhasil, aktif, disetujui |
| `--warning` | `#F7981D` | `#A15A0A` | Menunggu, perlu perhatian, mendekati batas |
| `--destructive` | rose-600 | rose-800 | Gagal, ditolak, hapus, error |
| `--info` | violet-500 | violet-900 | Informasi netral, dijeda |
| `--invert` | zinc-900 | zinc-50 | Penekanan netral gelap |

**[WAJIB]** Pola pemakaian status: tint `bg-{state}/10` + teks
`text-{state}-foreground` untuk badge/alert, dan warna solid `{state}` hanya
untuk titik indikator atau ikon kecil.

### 3.3 Netral & Permukaan

| Token | Nilai m-campaign | Peran |
|---|---|---|
| `--background` | `#FAFAFA` | Latar halaman (sedikit off-white) |
| `--card`, `--popover` | white | Card, panel, popover (satu tingkat lebih terang dari halaman) |
| `--muted` | `#EDEDED` | Permukaan sekunder di dalam card, hover ghost |
| `--muted-foreground` | zinc-500 | Teks pendukung, label, meta |
| `--secondary`, `--accent` | zinc-100 | Fill netral (kartu statistik, menu hover) |
| `--border` | `#E9E6E6` | **Satu-satunya** warna border 1px |
| `--input` | zinc-200 | Border field input |
| `--ring` | `= --primary` | Focus ring |

### 3.4 Warna Kategori / Chart

- **[WAJIB]** Seri chart atau kategori memakai token berurutan (`--chart-1..5`,
  atau token kategori domain seperti `--mech-1..5`) dengan **urutan tetap**:
  kategori yang sama selalu berwarna sama di seluruh aplikasi.
- **[WAJIB]** Warna kategori selalu disertai label teks (legend atau label
  langsung), karena sebagian slot terang tidak mencapai kontras 3:1.
- **[DEFAULT]** Status di timeline/chart dibedakan lewat **tekstur** (arsir
  `.timeline-hatch`), bukan dengan mengganti hue kategori.

---

## 4. Tipografi

- **[DEFAULT]** Satu keluarga font sans lewat token `--font-sans`. Jangan
  menambah font kedua. Kalau font kustom dipakai, file font **wajib** dimuat
  (link font atau `@font-face`). Tanpa itu browser diam-diam jatuh ke font
  sistem.
- **[WAJIB]** Skala untuk UI aplikasi (bukan landing page):

| Peran | Class | Ukuran | Weight |
|---|---|---|---|
| Judul halaman (`Header`) | `text-xl font-medium leading-none` | 20px | 500 |
| Judul section/card | `text-base font-semibold` atau `font-medium` | 16px | 500–600 |
| Teks konten, sel tabel, input | `text-sm` | 14px | 400 |
| Deskripsi halaman, sub-teks | `text-sm text-muted-foreground` | 14px | 400 |
| Meta, timestamp, helper | `text-xs` / `text-[13px]` + muted | 12–13px | 400 |
| Label kartu statistik | `text-[11px] font-semibold uppercase text-muted-foreground` | 11px | 600 |
| Angka statistik | `text-lg font-semibold tabular-nums` | 18px | 600 |
| Badge | dari primitive (`text-xs` / `text-[0.625rem]`) | 10–12px | 500 |

- **[WAJIB]** Angka yang dibandingkan atau berubah (statistik, kolom nominal,
  persentase) memakai `tabular-nums`.
- **[DEFAULT]** Kolom nominal/kuantitas di tabel rata kanan. Ini belum berlaku
  di tabel lama m-campaign; terapkan di tabel baru.
- **[WAJIB]** `font-bold` (700) tidak dipakai untuk teks UI.

---

## 5. Radius

`--radius` = **12px** (`0.75rem`). Turunannya:

| Class | Nilai | Dipakai untuk |
|---|---|---|
| `rounded-sm` | 8px | **Kontrol**: tombol, input, select, badge, tab pill, toggle |
| `rounded-md` | 10px | Item menu, opsi dropdown |
| `rounded-lg` | 12px | Alert, panel di dalam card, icon chip, thumbnail |
| `rounded-xl` | 16px | **Permukaan**: card, dialog, sheet, popover besar |
| `rounded-full` | pill/lingkaran | Hanya avatar, switch, radio, titik indikator, badge status dengan titik |

- **[WAJIB]** Tidak ada radius arbitrer (`rounded-[7px]`) di halaman.
- **[WAJIB]** Elemen bersarang memakai radius lebih kecil dari induknya
  (card `xl` → panel dalam `lg` → kontrol `sm`).

---

## 6. Spasi, Layout & Elevasi

- **[WAJIB]** Skala spasi Tailwind (kelipatan 4px). Tidak ada nilai arbitrer.
- **[DEFAULT]** Pola yang dipakai:

| Kebutuhan | Nilai |
|---|---|
| Lebar konten | `<Container>`: `max-w-[1320px]`, `px-4 lg:px-6`, opsi `fluid` |
| Jarak header halaman ke konten | `pb-7.5` (ada di Toolbar) |
| Jarak antar blok di halaman | `space-y-4` / `gap-4` (16px) |
| Padding card | 24px (`py-6 px-6`); `size="sm"`: 16px |
| Jarak antar elemen di dalam card/baris | `gap-2` – `gap-3` |
| Ikon + teks di tombol/chip | `gap-1.5` |
| Grid kartu statistik | `grid grid-cols-2 md:grid-cols-4 gap-4` |
| Form 2 kolom | `grid grid-cols-1 md:grid-cols-2 gap-4` |

- **[WAJIB]** Elevasi: konten di halaman tidak ber-shadow. Popover, dropdown,
  dialog, dan toast boleh memakai shadow bawaan primitive-nya.
- **[WAJIB]** Halaman responsif minimal sampai lebar 375px. Tabel lebar
  di-scroll horizontal di dalam card, halaman tidak ikut melebar.

---

## 7. Ikon

- **[WAJIB]** Satu library ikon (m-campaign: `lucide-react`). Ikon dari
  library lain hanya boleh untuk logo merek.
- **[DEFAULT]** Ukuran: `size-4` di tombol, input, dan chip; `size-3` di badge
  dan tombol `xs`; `size-5` maksimum di judul atau empty state kecil.
- **[WAJIB]** Tombol yang hanya berisi ikon wajib punya `aria-label` atau
  tooltip.

---

## 8. Resep Komponen

Pakai primitive di `components/ui/` beserta variant-nya. Jangan meniru
tampilannya dengan class manual.

### 8.1 Kerangka Halaman

```tsx
<Head title={title} />
<Container>
    <Header title={title} description={description} actions={<PageActions />} />
    <div className="space-y-4">
        <FeatureStats />          {/* grid kartu statistik, opsional */}
        <FeatureList />           {/* Card berisi toolbar tabel + DataGrid */}
    </div>
</Container>
```

Aksi di header halaman: aksi utama (`Create`, `Sync`) memakai `default`,
sedangkan bantuan/panduan memakai `outline`.

### 8.2 Card

`<Card>` = `rounded-xl border border-border bg-card`, **tanpa shadow**.
Variant `size="sm"` untuk card padat (statistik, panel dashboard). Jangan
menambahkan `shadow-*`, `hover:shadow-*`, `ring-*`, atau latar berwarna pada
card. Kalau card bisa diklik, affordance-nya diletakkan di link/tombol di
dalamnya.

### 8.3 Kartu Statistik

Ikuti pola `StatCard`: label kecil uppercase muted + icon chip
(`size-8 rounded-lg border`, tint warna state + ikon berwarna) di baris atas,
lalu angka netral `text-lg font-semibold tabular-nums`, lalu subtitle muted.
Gunakan satu komponen bersama untuk semua halaman, jangan membuat ulang per
fitur. Animasi count-up hanya untuk angka.

### 8.4 Tombol

| Variant | Kapan |
|---|---|
| `default` (brand solid) | Satu aksi utama per area |
| `secondary` (brand-soft) | Aksi pendamping yang masih positif |
| `outline` | Aksi netral: Filter, Kolom, Batal, Guide |
| `ghost` | Aksi ringan di toolbar, aksi baris tabel |
| `destructive` (tint rose) | Hapus, tolak, batalkan permanen |
| `link` | Navigasi di dalam teks |

Ukuran: `default` 36px untuk form dan toolbar, `sm` 32px untuk area padat dan
aksi baris, `icon*` untuk tombol ikon persegi. Footer dialog: aksi utama di
**kanan**, Batal (`outline`) di kirinya. Selama proses berjalan, tombol
`disabled` dan menampilkan spinner menggantikan ikon.

### 8.5 Badge

- Status dari enum dipetakan **sekali** di satu config
  (`{ label, badgeVariant }` per nilai enum, lihat FRONTEND §13). Tidak ada
  pemetaan warna di masing-masing halaman.
- Pemetaan baku: draft → `outline`; pending → `warning-outline`;
  approved/active → `success-outline`; rejected/cancelled/blacklisted →
  `destructive-outline`; paused/info → `info-outline`.
- Di tabel: badge status berbentuk pill (`rounded-full`) dengan titik
  `bg-[currentColor]` sebelum label. Di luar tabel: `rounded-sm`, varian
  `*-light` atau `*-outline`.
- Varian solid (`success`, `destructive`) hanya untuk penanda kecil yang
  sangat penting (hitungan notifikasi), bukan untuk status baris.

### 8.6 Form & Input

- Field: `Label` di atas, input, lalu helper/error di bawah (`text-xs`). Input
  memakai fill `bg-muted/60`, border `border-input`, `rounded-sm`, tinggi 36px.
- Error: border `destructive` + teks error di bawah field, dari
  `form.errors.{field}`. Field wajib diberi tanda `*` di label.
- Form panjang dibagi ke beberapa section (card per section, atau wizard
  dengan langkah). Aksi submit berada di footer yang konsisten.

### 8.7 Tabel (DataGrid)

- Tabel berada di dalam Card. Toolbar di atasnya berisi: search (kiri),
  lalu Filters, Columns, dan aksi utama (kanan).
- Datar: tanpa zebra, garis pemisah baris 1px `border-border`, header tinggi
  sekitar 40px dengan teks `text-sm` muted, baris lega (±56–62px untuk sel dua
  baris).
- Sel dua baris: nilai utama (`text-sm`) + sub-teks (`text-xs` muted/mono).
  Kategori ditampilkan sebagai badge. Angka memakai `tabular-nums`.
- Saat loading: skeleton per sel (`Skeleton*Cell`), bukan spinner menutupi
  tabel. Saat kosong: pesan empty state di dalam area tabel.

### 8.8 Tab & Filter

- Tab navigasi konten: teks dengan garis bawah 2px warna `primary` pada tab
  aktif.
- Segmented control (pill) hanya untuk mengganti mode atau rentang waktu
  tampilan (Harian/Mingguan/Bulanan), bukan untuk memfilter isi daftar.
- Filter daftar ditampilkan di popover/sheet "Filters", disertai jumlah filter
  aktif pada tombolnya.

### 8.9 Alert, Toast, Dialog

- **Alert** inline: fill tint state (`bg-{state}/10`), ikon + teks berwarna
  state, `rounded-lg`. Tidak hilang sendiri.
- **Toast** (`showToast`): hanya untuk hasil aksi (berhasil/gagal). Tidak
  dipakai untuk informasi yang perlu dibaca ulang.
- **Dialog** untuk konfirmasi dan form pendek. **Sheet** (panel samping) untuk
  detail atau review yang panjang. Dialog konfirmasi aksi berbahaya menyebut
  objeknya secara spesifik ("Hapus draft *Promo Lebaran*?").

### 8.10 Empty, Loading, Error State

- Setiap area data punya tiga state: **loading** (skeleton dengan bentuk mirip
  konten), **empty** (ikon muted kecil + kalimat singkat + aksi bila ada), dan
  **error** (pesan + aksi coba lagi).
- Skeleton memakai `<Skeleton>` dengan ukuran mendekati konten asli supaya
  layout tidak meloncat.

---

## 9. Interaksi & Motion

- **[WAJIB]** Efek hover hanya pada elemen yang bisa diklik (tombol, baris yang
  bisa diklik, link). Permukaan statis tidak berubah saat di-hover.
- **[WAJIB]** Fokus keyboard terlihat jelas: `focus-visible:ring` warna `--ring`
  dari primitive. Jangan menghapus outline fokus.
- **[DEFAULT]** Transisi singkat (≈150ms) hanya untuk warna, opasitas, dan
  transform kecil. Animasi angka (count-up) hanya di kartu statistik.
  Tidak ada animasi dekoratif (teks berputar, marquee, background bergerak).

---

## 10. Dark Mode

- **[WAJIB]** Setiap token punya nilai di `.dark`. Halaman tidak perlu menulis
  `dark:` selama memakai token semantik.
- **[DEFAULT]** `dark:` di halaman hanya untuk palet mentah yang sudah dipetakan
  di komponen pola (mis. chip StatCard). Kalau `dark:` mulai tersebar di
  halaman, itu tanda token yang dibutuhkan belum ada.
- **[WAJIB]** Fitur baru diperiksa di mode terang **dan** gelap.

---

## 11. Aksesibilitas

- **[WAJIB]** Kontras teks minimal 4.5:1 (teks besar dan ikon 3:1).
  Teks di atas tint memakai `*-foreground`, bukan warna state solid.
- **[WAJIB]** Warna tidak menjadi satu-satunya pembawa makna (§1.3).
- **[WAJIB]** Target klik minimal 32px (tombol `sm`). Tombol ikon di tabel
  minimal `icon-sm`.
- **[WAJIB]** Semua input punya label yang terhubung ke field-nya. Ikon tanpa
  teks punya `aria-label`.

---

## 12. Larangan

| ❌ Jangan | ✅ Lakukan |
|---|---|
| `shadow-md` / `hover:shadow-lg` pada card | border 1px, tanpa shadow |
| `bg-[#005f33]`, `text-green-700` di halaman | `bg-primary`, `text-success-foreground` |
| `rounded-[6px]`, `p-[13px]` | token radius & skala spasi |
| Dua tombol solid brand berdampingan | satu `default` + sisanya `outline`/`ghost` |
| Badge hanya warna tanpa label | warna + teks |
| Angka statistik berwarna hijau/merah | angka netral, warna di icon chip |
| Judul `font-bold` / `text-3xl` di halaman aplikasi | `text-xl font-medium` |
| Memetakan status → warna di tiap halaman | config enum terpusat |
| Spinner menutupi seluruh tabel saat loading | skeleton per sel |
| Font kustom di token tanpa memuat file font | muat font atau pakai font sistem |
| Library ikon kedua | satu library |
| Komponen dekoratif (marquee, typing text, gradient bergerak) | UI fungsional |

---

## 13. Checklist Review UI

1. Hanya ada satu tombol `default` per area. Varian tombol lain sesuai §8.4.
2. Tidak ada `shadow-*`, hex, atau nilai arbitrer di file halaman/fitur.
3. Card, tabel, dan form memakai primitive dan resep §8.
4. Status memakai config enum terpusat + badge berlabel.
5. Ada state loading (skeleton), empty, dan error.
6. Angka memakai `tabular-nums`.
7. Dicek di lebar 375px, mode terang, dan mode gelap.
8. Navigasi keyboard: fokus terlihat dan semua aksi bisa dijangkau.
9. Teks UI lewat i18n (bila project memakai i18n).

---

## 14. Memasang ke Project Lain

1. Salin blok token dari `resources/css/config.reui.css` dan `resources/css/app.css`
   (`:root`, `.dark`, `@theme inline`), lalu **ganti hanya brand ramp** §3.1
   (dan warna status bila brand berbenturan).
2. Salin primitive `components/ui/` yang dipakai (minimal: `button`, `card`,
   `badge`, `input`, `select`, `dialog`, `sheet`, `tabs`, `skeleton`,
   `data-grid*`), beserta variant-nya **tanpa diubah**.
3. Salin komponen pola: `Container`, `Header`, `StatCard`, `showToast`.
4. Muat font yang disebut di `--font-sans`, atau gunakan font sistem dan
   hapus nama font kustom dari token.
5. Catat di Project Profile: warna brand, font, library ikon, dan setiap
   pengecualian dari standar ini.
