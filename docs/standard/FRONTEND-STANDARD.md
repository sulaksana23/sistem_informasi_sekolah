# Standar Frontend — Laravel + Inertia.js + React + TypeScript

> Standar portable untuk frontend Inertia/React/TS di atas backend Laravel.
> Dipakai sebagai acuan baku untuk developer **dan** AI coding agent setiap
> kali menulis kode frontend. Pasangannya: [BACKEND-STANDARD.md](BACKEND-STANDARD.md).
> Cara memasang ke project lain: lihat [README.md](README.md).
>
> Diekstrak dari pola nyata project **m-campaign** (2026-10), lalu
> digeneralisasi. Contoh kode memakai modul fiktif `product` / domain
> `master-data` — ganti dengan modul project Anda.

## 0. Cara Membaca Dokumen Ini

Setiap aturan diberi label:

| Label | Arti |
|---|---|
| **[WAJIB]** | Invarian arsitektur. Tidak boleh dilanggar di project mana pun yang memakai standar ini. |
| **[DEFAULT]** | Pilihan baku. Boleh diganti per project, **asal** penggantinya ditulis di *Project Profile* (lihat README §3) supaya agent tahu. |
| **[OPSIONAL]** | Pakai bila project butuh. Kalau tidak dipakai, abaikan bagiannya. |

Asumsi stack (sesuaikan versi di Project Profile):

| Lapisan | Library |
|---|---|
| Routing & page | Inertia.js v2 (`@inertiajs/react`) — **bukan** React Router |
| UI | React 18/19 + TypeScript `strict` |
| Server state | TanStack Query v5 |
| Tabel | TanStack Table v8 + endpoint Yajra DataTables di backend |
| URL backend | Ziggy (`route()` dari `ziggy-js`) |
| HTTP client | axios |
| Styling | Tailwind CSS + komponen primitive gaya shadcn/ui |
| i18n **[OPSIONAL]** | react-intl |

---

## 1. Prinsip Inti

1. **[WAJIB] Satu arah, empat lapis** — cermin lapisan backend:

   ```
   Page (Inertia entry)  →  Hook (Query/Mutation/state)  →  API module (axios + route())  →  Types
     ≈ Controller             ≈ Service                       ≈ Repository                    ≈ Model/DTO
   ```

   Lapisan atas boleh memanggil lapisan di bawahnya, tidak sebaliknya.
   Komponen **tidak pernah** memanggil axios langsung.
2. **[WAJIB] Server adalah sumber kebenaran.** Validasi, permission, dan
   aturan bisnis diputuskan di backend. Frontend hanya mencerminkan
   (menyembunyikan tombol, menampilkan error 422) — tidak pernah jadi
   satu-satunya penjaga.
3. **[WAJIB] Nama route Laravel adalah kontrak.** Semua URL dibangun dengan
   `route('{feature}.{action}')`. URL hardcoded (`"/api/products"`) dilarang.
4. **[WAJIB] Feature-first.** Kode dikelompokkan per fitur, bukan per jenis
   file. Hal yang dipakai ≥2 fitur dipromosikan ke folder global — tidak
   disalin.
5. **[WAJIB] Page tipis.** File entry Inertia hanya menyusun komponen,
   tanpa logic fetch atau aturan bisnis.

---

## 2. Struktur Direktori

```
resources/js/
├── App.tsx                     # createInertiaApp + provider tree + page resolver (§5.3)
├── api/                        # [WAJIB] SEMUA panggilan HTTP ada di sini
│   └── {domain}/{module}.ts    #   fungsi fetch/mutate + query key factory (§6, §7)
├── types/                      # tipe lintas fitur
│   ├── common/                 #   page-props, user, yajra-response, dll
│   ├── models/                 #   cermin Model Eloquent (satu file per model)
│   └── {domain}/               #   tipe request/response per domain
├── components/
│   ├── ui/                     # primitive (shadcn) — TANPA business logic, tanpa import dari luar ui/ & lib/
│   ├── common/                 # komponen generik lintas fitur (datatable, header, sync-button, filters)
│   └── cells/                  # cell renderer tabel yang generik
├── hooks/                      # hook generik lintas fitur (use-debounce, use-permission, use-count-up)
├── layouts/                    # layout Inertia (MainLayout, dsb)
├── providers/                  # React context provider global (query, theme, i18n)
├── config/                     # konfigurasi statis (menu, settings)
├── lib/                        # util murni tanpa React (cn, formatter, helper)
├── utils/                      # [DEFAULT] boleh digabung ke lib/ — pilih satu per project
├── i18n/                       # [OPSIONAL] pesan terjemahan
└── pages/                      # modul fitur
    └── {feature}/              # kebab-case, sama dengan prefix route backend
        ├── pages/              # [WAJIB] HANYA entry Inertia (satu file per halaman)
        │   ├── {Feature}Index.tsx
        │   ├── {Feature}Create.tsx
        │   ├── {Feature}Edit.tsx
        │   └── {Feature}Detail.tsx
        ├── components/
        │   ├── datatables/     # {Feature}List.tsx — tabel utama
        │   ├── cells/          # cell renderer khusus fitur
        │   ├── forms/          # {Feature}Form.tsx + section form
        │   ├── detail/         # section halaman detail
        │   ├── filters/        # panel filter tabel
        │   ├── comboboxes/     # select/combobox berbasis data
        │   ├── sheets/  dialogs/  buttons/  cards/  lists/
        │   └── {Feature}Stats.tsx  # komponen tunggal boleh langsung di components/
        ├── hooks/
        │   ├── use-{feature}-columns.tsx   # definisi kolom TanStack Table
        │   └── use-{feature}-queries.ts    # useQuery/useMutation fitur (§8.2)
        ├── types.ts            # [OPSIONAL] tipe yang HANYA dipakai fitur ini
        ├── constants.ts        # [OPSIONAL]
        └── utils/              # [OPSIONAL] util khusus fitur
```

Aturan:

- **[WAJIB]** Subfolder `components/` hanya dibuat kalau ada isinya. Nama
  subfolder **jamak & baku**: `datatables`, `cells`, `forms`, `detail`,
  `filters`, `comboboxes`, `sheets`, `dialogs`, `buttons`, `cards`, `lists`.
  Jangan membuat varian ejaan baru (contoh salah: `comboboxs`, `modal`, `table`).
- **[WAJIB]** Fitur bersarang mengikuti route backend. Contoh:
  `store.product.*` → `pages/store/product/`, dan
  `promotion-{mechanism}.*` → `pages/promotion/{mechanism}/`.
- **[DEFAULT]** Beberapa fitur dalam satu domain yang berbagi banyak kode
  memakai folder `shared/` di level domain (`pages/promotion/shared/`)
  dengan struktur internal yang sama (`components/`, `hooks/`, `utils/`).
  `shared/` **tidak boleh** berisi folder `pages/`.
- **[WAJIB]** Tidak ada folder `api/` maupun `types/` di dalam `pages/{feature}/`.
  API dan tipe yang dipakai API selalu di `resources/js/api` dan
  `resources/js/types` (§3).
- **[WAJIB]** Jangan simpan kode template/demo yang tidak dipakai (partials
  bawaan theme, icon font demo, integrasi yang tidak dipakai). Kode mati
  membingungkan agent dan menambah error type-check.

---

## 3. Aturan Dependensi (Siapa Boleh Import Siapa)

| Dari \ Ke | `components/ui` | `components/common`, `cells` | `hooks/` | `api/` | `types/` | `lib/` | `pages/{feature yang sama}` | `pages/{fitur lain}` |
|---|---|---|---|---|---|---|---|---|
| `components/ui` | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `components/common`, `cells` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `hooks/` (global) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `api/` | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `types/` | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `pages/{feature}` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `pages/{domain}/{feature}` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (+ `pages/{domain}/shared`) | ❌ |

- **[WAJIB]** Kode global (`components`, `hooks`, `api`, `types`, `lib`)
  **tidak pernah** import dari `pages/`.
- **[WAJIB]** Fitur tidak import dari fitur lain. Kalau fitur B butuh
  komponen milik fitur A, **pindahkan** komponen itu ke `components/common`
  atau `components/cells` (atau ke `pages/{domain}/shared` bila keduanya satu
  domain). Duplikasi juga bukan solusi.
- **[WAJIB]** Import pakai alias `@/` untuk lintas folder; relative path
  (`../`) hanya di dalam satu fitur.
- **[DEFAULT]** Tidak memakai barrel file (`index.ts` yang `export *`) untuk
  `api/` dan `types/`. Import langsung dari file modulnya supaya
  tree-shaking dan pencarian kode tetap jelas.

Pemeriksaan cepat (tempel di CI atau jalankan sebelum commit):

```bash
# kode global yang import dari pages/ → harus kosong
grep -rlE "from ['\"]@/pages/" resources/js/{components,hooks,api,types,lib,layouts}
# komponen/halaman yang memanggil axios langsung → harus kosong (import type saja boleh)
grep -rnE "from ['\"]axios['\"]" resources/js/{pages,components} | grep -v "import type"
```

---

## 4. Penamaan

| Jenis | Pola | Contoh |
|---|---|---|
| Folder fitur | kebab-case = prefix route | `price-zone-group/` |
| Komponen | PascalCase, **diawali nama fitur** | `ProductList.tsx`, `ProductFormGeneral.tsx`, `ProductNameCell.tsx` |
| Entry page | `{Feature}{Index\|Create\|Edit\|Detail}` | `ProductIndex.tsx` |
| Komponen di `components/ui`, `common` | kebab-case (konvensi shadcn) | `data-grid.tsx`, `sync-button.tsx` |
| Hook | `use-kebab.ts(x)`; ekspor `useCamel` | `use-product-columns.tsx` → `useProductColumns` |
| Modul API | `api/{domain}/{module}.ts`, kebab-case singular | `api/master-data/product.ts` |
| Fungsi API | kata kerja + objek | `getProductStatistics`, `syncAllProducts`, `storeProduct`, `deleteProduct` |
| Query key factory | `{module}Keys` | `productKeys.list()` |
| Tipe | PascalCase, tanpa prefix `I` | `Product`, `ProductStatistics`, `ProductFormData` |
| Konstanta | `UPPER_SNAKE` | `PRODUCT_FILTERS_DEFAULT` |
| ID i18n **[OPSIONAL]** | `{FEATURE_UPPER}.{KEY_UPPER}` | `MASTER_PRODUCT.SYNC_BUTTON_LABEL` |

- **[WAJIB]** Satu komponen utama per file. Komponen kecil privat (skeleton,
  item list) boleh di file yang sama selama tidak diekspor.
- **[DEFAULT]** Entry page memakai `export default`. Komponen lain memakai
  `export default` untuk komponen utama file, atau named export bila satu
  file mengekspor beberapa hal (columns hook, konstanta).

---

## 5. Entry Page (Inertia)

### 5.1 Template

```tsx
// pages/product/pages/ProductIndex.tsx
import { Head } from "@inertiajs/react";
import { useState } from "react";
import { Container } from "@/components/common/container";
import Header from "@/components/common/header";
import ProductStats from "../components/ProductStats";
import ProductList from "../components/datatables/ProductList";
import { PRODUCT_FILTERS_DEFAULT, type ProductFiltersState } from "../components/filters/ProductFilters";

export default function ProductIndex() {
    const [filters, setFilters] = useState<ProductFiltersState>(PRODUCT_FILTERS_DEFAULT);

    return (
        <>
            <Head title="Product" />
            <Container>
                <Header title="Product" description="All products synced from POS" />
                <div className="space-y-4">
                    <ProductStats />
                    <ProductList filters={filters} onFiltersChange={setFilters} />
                </div>
            </Container>
        </>
    );
}
```

### 5.2 Aturan

- **[WAJIB]** Isi page = `<Head>` + layout container + komposisi komponen +
  state UI tingkat halaman (filter terpilih, tab aktif, dialog terbuka). Tidak
  ada `useQuery`/`axios`/kalkulasi bisnis di sini.
- **[WAJIB]** Props dari controller diketik eksplisit:

  ```tsx
  interface ProductEditProps { product: Product }
  export default function ProductEdit({ product }: ProductEditProps) { ... }
  ```

  Props global (auth, flash, permission) dibaca lewat
  `usePage<PageProps>().props` — tipe `PageProps` ada di
  `types/common/page-props.ts`.
- **[WAJIB]** Nama komponen yang dirender controller =
  `'{feature}/pages/{Feature}{Action}'` (path relatif dari `resources/js/pages`,
  tanpa `.tsx`). Contoh: `inertia('product/pages/ProductIndex')`.
- **[DEFAULT]** Layout default dipasang oleh resolver (§5.3). Page yang butuh
  layout lain mengisi `Page.layout = (page) => <OtherLayout>{page}</OtherLayout>`.
- **[DEFAULT]** Batas ukuran sekitar **300 baris per file**. Halaman Detail atau
  Form yang melewati batas dipecah per section ke `components/detail/` atau
  `components/forms/`.

### 5.3 Page Resolver

**[WAJIB]** Resolver hanya memuat file entry `pages/**/pages/*.tsx`, secara
**lazy**. Dengan begitu tiap halaman jadi chunk terpisah dan komponen biasa
tidak ikut terdaftar sebagai page:

```tsx
// App.tsx
const pages = import.meta.glob<PageModule>("./pages/**/pages/*.tsx");

createInertiaApp({
    resolve: async (name) => {
        const importPage = pages[`./pages/${name}.tsx`];
        if (!importPage) throw new Error(`Page not found: ${name}`);

        const page = await importPage();
        page.default.layout ??= (children) => <MainLayout>{children}</MainLayout>;
        return page;
    },
    // ...
});
```

Jangan pakai `import.meta.glob("./pages/**/*.tsx", { eager: true })`: seluruh
aplikasi akan masuk ke satu bundle awal.

**[WAJIB]** Provider tree hanya punya **satu** `QueryClientProvider`.

---

## 6. API Layer (`resources/js/api`)

### 6.1 Template Modul

```ts
// api/master-data/product.ts
import axios from "axios";
import { route } from "ziggy-js";
import type { ProductStatistics } from "@/types/statistics/product-statistics";
import type { ProductFormData } from "@/types/models/product";

export const getProductStatistics = async (): Promise<ProductStatistics> => {
    const res = await axios.get(route("product.statistics"));
    return res.data;
};

export const getSelectListProducts = async ({ pageParam = 1, search = "" }: { pageParam?: number; search?: string }) => {
    const res = await axios.get(route("product.select-list"), { params: { page: pageParam, search, per_page: 20 } });
    return res.data;
};

export const syncAllProducts = () => axios.post(route("product.sync-all"));

export const updateProduct = (id: number, data: ProductFormData) => axios.put(route("product.update", { id }), data);

/** Query keys = URL route. Lihat §7. */
export const productKeys = {
    list: () => [route("product.list")] as const,
    statistics: () => [route("product.statistics")] as const,
    selectList: (search: string) => [route("product.select-list"), search] as const,
};
```

### 6.2 Aturan

- **[WAJIB]** Satu file per modul backend (`{Module}Controller` ↔
  `api/{domain}/{module}.ts`). Folder `{domain}` mengikuti pengelompokan
  controller/menu, misalnya `master-data`, `promotion`, `api-management`,
  `monitoring`.
- **[WAJIB]** Hanya file di `api/` yang boleh memanggil axios. Pengecualian
  satu-satunya: hook generik infrastruktur (`hooks/use-datatables.ts`) yang
  menerima URL endpoint sebagai parameter.
- **[WAJIB]** URL selalu dari `route()`.
- **[WAJIB]** Fungsi GET mengembalikan `res.data` dengan tipe eksplisit
  (`Promise<T>`). Fungsi mutasi boleh mengembalikan `AxiosResponse` bila
  pemanggil butuh `res.data.message` untuk toast.
- **[WAJIB]** Modul API tidak berisi React (hook, JSX), toast, atau navigasi.
  Isinya fungsi murni I/O saja.
- **[WAJIB]** Setiap modul yang punya query mengekspor **query key factory**
  (§7).

---

## 7. Query Key

**[DEFAULT]** Konvensi key adalah **URL route sebagai elemen pertama**:

```ts
productKeys.list()            // ["https://app.test/product/list"]
productKeys.statistics()      // ["https://app.test/product/statistics"]
storeProductKeys.list(5)      // ["https://app.test/store/5/product/list"]
cacheKeys.progress("product") // ["https://app.test/cache/product"]
```

Alasannya: hook datatable generik memakai key `[endpoint, params]`. Jadi
`invalidateQueries({ queryKey: productKeys.list() })` otomatis me-refresh
tabel di semua halaman/filter/page, tanpa perlu koordinasi tambahan.

Aturan:

- **[WAJIB]** Key tidak pernah ditulis tangan di komponen (`["products", x]`,
  `[route("x")]`). Key selalu diambil dari factory `{module}Keys` di modul API.
- **[WAJIB]** Fungsi factory mengembalikan tuple `as const`. Prop yang
  menerima daftar key bertipe `readonly QueryKey[]`, yaitu **array of keys**:

  ```tsx
  <SyncProgress invalidateKeys={[productKeys.list(), productKeys.statistics()]} />
  ```

  > Bentuk `[route("a"), route("b")]` (satu key berisi dua URL) cocok dengan
  > **tidak satu pun** query. Bug ini pernah terjadi di m-campaign: tabel dan
  > statistik Member/Supplier tidak ter-refresh setelah sync.
- **[WAJIB]** Parameter yang mengubah hasil (search, filter, id) masuk ke key
  sebagai elemen setelah URL.
- Project yang tidak memakai hook datatable berbasis URL boleh memakai key
  hierarkis biasa (`["product", "list", filters]`), **asal** tetap lewat
  factory. Catat pilihan ini di Project Profile.

---

## 8. Data Fetching & Mutasi

### 8.1 Pilih Mekanisme yang Tepat

| Kebutuhan | Mekanisme | Contoh |
|---|---|---|
| Data awal yang dibutuhkan halaman untuk render | **Inertia props** dari controller | `product` di halaman Edit, `draft` di halaman Create |
| Data async di dalam halaman (widget, statistik, dropdown, tabel) | **`useQuery`** + fungsi API + key factory | `ProductStats`, combobox |
| Submit form yang berakhir pindah halaman/redirect + flash | **Inertia `useForm`** (`form.post(route(...))`) atau `router.post` | Create/Edit lalu kembali ke Index |
| Aksi di tempat yang membalas JSON (toggle, sync, simpan draft, hapus baris) | **`useMutation`** + fungsi API, lalu `invalidateQueries` | tombol sync, switch aktif |
| Tabel server-side | `useDataTable(route("x.list"), columns)` (§11) | `ProductList` |

- **[WAJIB]** Jangan mengambil ulang lewat `useQuery` data yang sudah dikirim
  sebagai Inertia props, dan jangan mengirim data besar/lambat lewat props
  bila bisa di-lazy-load (pakai `useQuery`, atau *deferred props* Inertia v2).
- **[WAJIB]** Jangan memakai `useEffect` + `axios` + `useState` untuk fetch.
  Selalu `useQuery`.

### 8.2 Di Mana `useQuery` / `useMutation` Ditulis

- **[DEFAULT]** Query/mutasi **tunggal** yang hanya dipakai satu komponen boleh
  ditulis langsung di komponen itu, **asal** `queryFn` dari `api/` dan
  `queryKey` dari factory:

  ```tsx
  const { data, isLoading } = useQuery({
      queryKey: productKeys.statistics(),
      queryFn: getProductStatistics,
  });
  ```

- **[WAJIB]** Pindahkan ke `hooks/use-{feature}-queries.ts` kalau dipakai
  ≥2 komponen, kalau punya `onSuccess`/`onError`/`invalidate` yang lebih dari
  beberapa baris, atau kalau satu komponen punya ≥2 query/mutasi.

  ```ts
  // pages/product/hooks/use-product-queries.ts
  export function useToggleProductActive() {
      const queryClient = useQueryClient();
      return useMutation({
          mutationFn: toggleProductActive,
          onSuccess: (res) => {
              showToast("success", res.data.message);
              queryClient.invalidateQueries({ queryKey: productKeys.list() });
          },
          onError: (error: AxiosError<{ message?: string }>) =>
              showToast("destructive", error.response?.data?.message ?? error.message),
      });
  }
  ```

### 8.3 Error & Notifikasi

- **[DEFAULT]** Error query ditangani secara global oleh `QueryCache.onError`
  di `providers/query-provider.tsx` (toast). Komponen cukup menampilkan
  skeleton/empty state.
- **[WAJIB]** Error mutasi di-toast di `onError`, dengan pesan dari
  `error.response?.data?.message`. Gunakan `import type { AxiosError } from "axios"`
  (import tipe saja).
- **[DEFAULT]** Flash session dari redirect (`with('success'|'error')`)
  ditampilkan **sekali** di layout utama, tidak di tiap halaman.
- **[WAJIB]** Error validasi 422 dari `useForm` dibaca dari `form.errors.{field}`
  dan ditampilkan di bawah field. Validasi frontend hanya untuk UX, bukan
  pengganti FormRequest.

---

## 9. Hooks

| Lokasi | Isi |
|---|---|
| `hooks/` (global) | Hook generik tanpa pengetahuan domain: `use-debounce`, `use-permission`, `use-datatables`, `use-count-up`, `use-animated-number`, `use-copy-to-clipboard` |
| `pages/{feature}/hooks/` | `use-{feature}-columns.tsx`, `use-{feature}-queries.ts`, hook state/form fitur |
| `pages/{domain}/shared/hooks/` | Hook yang dipakai beberapa fitur dalam satu domain (autosave draft, keyboard wizard) |

- **[WAJIB]** Hook yang sama tidak boleh ada di dua tempat. Kalau dua fitur
  butuh hook yang sama, pindahkan ke `hooks/` global dan beri parameter untuk
  bagian yang berbeda (contoh: `useCountUp(value, duration)`).
- **[WAJIB]** Hook kolom mengembalikan `ColumnDef[]` yang di-`useMemo`.

---

## 10. Komponen

- **[WAJIB]** `components/ui/*` adalah primitive. Tidak berisi teks domain,
  tidak fetch data, dan tidak import dari `api/`, `hooks/` domain, atau `pages/`.
  Ubah primitive hanya untuk perbaikan generik.
- **[WAJIB]** Aturan promosi:
  - dipakai 1 fitur → tetap di `pages/{feature}/components/`
  - dipakai ≥2 fitur dalam satu domain → `pages/{domain}/shared/components/`
  - dipakai ≥2 fitur lintas domain → `components/common/` atau `components/cells/`
- **[WAJIB]** Komponen yang menampilkan data async punya state loading
  (skeleton) dan empty state. Cell tabel menyediakan pasangan `Skeleton{Name}Cell`.
- **[DEFAULT]** Props diketik dengan `interface {Component}Props`. Tidak ada
  `any` pada props. Untuk data yang belum jelas bentuknya, pakai `unknown`
  dan persempit tipenya.
- **[DEFAULT]** Gaya class memakai Tailwind + `cn()` dari `lib/utils`. Tidak
  ada file CSS per komponen. Warna/radius/spacing mengikuti design system
  project (lihat Project Profile).

---

## 11. Pola Tabel (Datatable)

```
{Feature}List.tsx  ──uses──▶  useDataTable(route("{feature}.list"), columns, initialParams)
      │                              │
      │                              └── axios GET ke endpoint Yajra, key [endpoint, params]
      └── columns = use{Feature}Columns()   ──▶  cells/{Feature}*Cell.tsx + components/cells/*
```

- **[WAJIB]** Endpoint list di backend mengembalikan format Yajra
  (`draw`, `recordsTotal`, `recordsFiltered`, `data`). Paginasi, sort, dan
  search terjadi di server.
- **[WAJIB]** Filter tabel dikirim lewat `extraParams` milik hook. State
  filter berada di page atau komponen list, dengan nilai default
  `{FEATURE}_FILTERS_DEFAULT` yang diekspor dari komponen filter.
- **[WAJIB]** Refresh tabel setelah mutasi:
  `invalidateQueries({ queryKey: {module}Keys.list() })`. Jangan memanggil
  `refetch` dari luar komponen tabel.

---

## 12. Form

- **[DEFAULT]** Form halaman (Create/Edit) memakai Inertia `useForm<{Feature}FormData>()`.
  Tipe `{Feature}FormData` ada di `types/` dan mencerminkan `rules()` FormRequest.
- **[WAJIB]** Form besar dipecah:
  `{Feature}Form.tsx` (orkestrator, memegang `useForm`) +
  `{Feature}Form{Section}.tsx` (menerima `form` sebagai props, bertipe
  `ReturnType<typeof useForm<{Feature}FormData>>`).
- **[WAJIB]** Submit ke route bernama: `form.post(route("product.store"))`.
  Redirect dan flash ditentukan backend.
- **[OPSIONAL]** Untuk autosave atau simpan draft (tanpa pindah halaman),
  pakai `useMutation` ke endpoint JSON, di-debounce di hook fitur.

---

## 13. Types

- **[WAJIB]** `types/models/{model}.ts` mencerminkan kolom Model yang dikirim
  backend, dalam snake_case persis seperti JSON-nya. Field yang hanya muncul
  di endpoint tertentu ditandai opsional dan diberi komentar asalnya.
- **[WAJIB]** PHP backed enum dicerminkan sebagai union string, dengan nilai
  persis sama:

  ```ts
  // PHP: enum PromotionStatus: string { case DRAFT = 'draft'; ... }
  export type PromotionStatus = "draft" | "pending_approval" | "approved" | "rejected";
  ```
- **[WAJIB]** Response JSON non-model (statistik, overview, preview) diberi
  tipe di `types/{domain}/`, lalu dipakai sebagai return type fungsi API.
- **[DEFAULT]** Tipe yang hanya dipakai di dalam satu fitur (state filter,
  props internal) boleh di `pages/{feature}/types.ts` atau di file
  komponennya, tapi **tidak** boleh dipakai oleh `api/`.
- **[WAJIB]** Tidak ada `any` baru. `any` lama dirapikan saat file disentuh.

---

## 14. Permission di UI

- **[WAJIB]** Gating UI memakai `usePermission()`:
  `hasPermission("product.update")`. Nama permission **sama persis** dengan
  middleware `can:` di route backend.
- **[WAJIB]** UI gating hanya kosmetik. Backend tetap mengecek di route.
  Setiap aksi baru yang di-gate wajib diupdate di tiga tempat: route
  middleware, `usePermission` di UI, dan katalog permission project.

---

## 15. i18n **[OPSIONAL]**

- Teks UI lewat `intl.formatMessage({ id, defaultMessage })` atau
  `<FormattedMessage>`. `defaultMessage` wajib diisi (bahasa default project).
- ID: `{FEATURE_UPPER}.{KEY}`; teks umum memakai `COMMON.{KEY}`.
- Tambahkan key baru ke **semua** file `i18n/messages/*.json`, minimal
  dengan nilai bahasa default.

---

## 16. Performa

- **[WAJIB]** Page di-lazy-load (§5.3).
- **[WAJIB]** Definisi kolom, opsi select, dan objek config besar di-`useMemo`
  atau ditaruh di luar komponen.
- **[DEFAULT]** Library berat (chart, peta, editor) hanya diimpor oleh fitur
  yang memakainya, tidak dari `components/common` yang dipakai semua halaman.
- **[DEFAULT]** Pencarian ketik-langsung di-debounce (≈300–400 ms) sebelum
  masuk query key.

---

## 17. Larangan

| ❌ Jangan | ✅ Lakukan |
|---|---|
| `axios.get(...)` di komponen/page | fungsi di `api/{domain}/{module}.ts` |
| `queryKey: ["products"]` ditulis tangan | `productKeys.list()` |
| URL hardcoded `"/product/list"` | `route("product.list")` |
| Folder `pages/{feature}/api` atau `pages/{feature}/types` yang diimpor `api/` | `api/{domain}/` + `types/{domain}/` |
| Import `@/pages/supplier/...` dari fitur `brand` | promosikan ke `components/cells` |
| Menyalin hook/komponen ke fitur lain | pindah ke global, beri parameter |
| `useEffect` + `axios` + `useState` untuk fetch | `useQuery` |
| Logic fetch di entry page | komponen/hook di bawahnya |
| File > ~300 baris | pecah per section |
| `any` di props/return API | tipe di `types/` |
| Barrel `index.ts` raksasa untuk `api/`/`types/` | import langsung dari modul |
| Menyimpan kode template/demo yang tidak terpakai | hapus |

---

## 18. Checklist Fitur Baru (Listing + CRUD)

1. Backend selesai lebih dulu: route bernama, permission, endpoint `list`
   (Yajra), dan endpoint JSON lain (lihat BACKEND-STANDARD).
2. `types/models/{model}.ts` + tipe form/response di `types/{domain}/`.
3. `api/{domain}/{module}.ts`: fungsi API + `{module}Keys`.
4. `pages/{feature}/hooks/use-{feature}-columns.tsx` (+ cell di `components/cells/`).
5. `pages/{feature}/components/datatables/{Feature}List.tsx` memakai `useDataTable`.
6. Form: `components/forms/{Feature}Form*.tsx` dengan `useForm`.
7. Entry page di `pages/{feature}/pages/`. Nama page = string di `inertia()` controller.
8. Gating tombol dengan `usePermission()` memakai nama permission yang sama dengan route.
9. i18n key (bila dipakai) di semua file bahasa.
10. `npx tsc --noEmit` tanpa error baru, dan pemeriksaan grep §3 kosong.
11. Buka halaman di browser: tabel, filter, form, toast, permission.
