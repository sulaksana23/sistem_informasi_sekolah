# Standar Backend — Laravel + Inertia (Service/Repository Pattern)

> Standar portable untuk backend Laravel yang melayani frontend
> **Inertia.js + React** (lihat pasangannya [FRONTEND-STANDARD.md](FRONTEND-STANDARD.md))
> dan, opsional, API eksternal. Dipakai sebagai acuan baku untuk developer
> **dan** AI coding agent setiap kali menulis kode backend. Cara memasang ke
> project lain: lihat [README.md](README.md).
>
> Diekstrak dari pola nyata project **m-campaign** (2026-10), lalu
> digeneralisasi. Project Laravel + **Blade** juga memakai dokumen ini (lihat
> §0.1): layer backend-nya sama, yang beda hanya cara render.

## 0. Cara Membaca

| Label | Arti |
|---|---|
| **[WAJIB]** | Invarian arsitektur, berlaku di semua project pengguna standar ini. |
| **[DEFAULT]** | Pilihan baku. Boleh diganti, **asal** penggantinya ditulis di *Project Profile* (README §3). |
| **[OPSIONAL]** | Pakai bila project butuh. |

Asumsi stack: Laravel 11/12, PHP 8.2+, `inertiajs/inertia-laravel` v2,
`tightenco/ziggy`, `yajra/laravel-datatables`, PHPUnit. Contoh memakai modul
fiktif `Product`.

### 0.1 Dipakai di Project Blade

Semua aturan berlaku, kecuali bagian yang khusus Inertia:

| Bagian | Di project Blade |
|---|---|
| §5.1 jenis 1 (Inertia page) | `return view('pages.{feature}.index', [...])` — view di `resources/views/pages/{feature}/` |
| §5.2 nama komponen Inertia | tidak berlaku; nama view mengikuti folder fitur (kebab-case) |
| §11 Inertia shared props | data global lewat View Composer / `View::share()` di service provider, flash dibaca di layout Blade |
| §10 render `BusinessException` | sama; request AJAX/jQuery menerima JSON `{message}`, form biasa di-redirect back + flash |
| §12 permission di UI | `@can('product.create')` di Blade, bukan `usePermission()` |

Frontend dan desain Blade mengikuti
[FRONTEND-BLADE-STANDARD.md](FRONTEND-BLADE-STANDARD.md) dan
[DESIGN-BLADE-STANDARD.md](DESIGN-BLADE-STANDARD.md) (DataTables, tombol aksi
server-rendered, Enum `label()/color()/icon()` untuk badge).

---

## 1. Prinsip Inti

1. **[WAJIB] Satu arah, lima lapis:**
   `Route → Controller → FormRequest → Service (Facade) → Repository → Model`.
   Tidak ada lapisan yang melompati lapisan di bawahnya.
2. **[WAJIB] Repository = query saja.** `where`/`join`/`select`/`orderBy`/filter
   hanya ada di `*RepositoryImplement`. Repository tidak berisi aturan bisnis
   maupun transaksi.
3. **[WAJIB] Service = aturan bisnis + transaksi + orkestrasi.** Service memanggil
   satu atau lebih Repository/Service, membungkus `DB::transaction`, dan
   memutuskan valid/tidaknya suatu state.
4. **[WAJIB] Controller tipis.** Isinya hanya: terima FormRequest, panggil Service
   lewat Facade, lalu bentuk response (Inertia page, JSON, atau redirect).
   Tanpa query dan tanpa transaksi.
5. **[WAJIB] Nama route adalah kontrak dengan frontend.** Frontend memanggil
   lewat `route('{feature}.{action}')` (Ziggy), jadi mengganti nama route sama
   dengan mengubah API.
6. **[WAJIB] Setiap fitur disertai test otomatis** (§15).

---

## 2. Setup Repository Pattern

**[DEFAULT]** Pakai package `itmm/easy-repository`, yang mem-bind interface ke
implementasi secara otomatis berdasarkan nama folder/file:

```bash
composer require itmm/easy-repository
php artisan vendor:publish --provider="Itmm\EasyRepository\RepositoryServiceProvider" --tag=config
php artisan make:repository Product --service   # generate Repository + Service
```

```
App\Repositories\{Name}\{Name}Repository  →  App\Repositories\{Name}\{Name}RepositoryImplement
```

- Repository: `extends Itmm\EasyRepository\Implementations\Eloquent implements {Name}Repository`;
  interface `extends Itmm\EasyRepository\Repository`. Method CRUD dasar
  (`find`, `create`, `update`, `delete`, `all`, ...) didapat dari base class.
- ServiceImplement: `extends Itmm\EasyRepository\Service`.
- **[WAJIB]** Folder Repository **satu level** di bawah `app/Repositories`
  (`app/Repositories/DirectDiscount/`, bukan `app/Repositories/Promotion/DirectDiscount/`),
  karena auto-bind hanya memindai satu level.

**Alternatif tanpa package** — provider auto-bind sendiri:

```php
class RepositoryServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        foreach (File::directories(app_path('Repositories')) as $dir) {
            $name = basename($dir);
            $interface = "App\\Repositories\\{$name}\\{$name}Repository";
            $implement = "App\\Repositories\\{$name}\\{$name}RepositoryImplement";
            if (interface_exists($interface) && class_exists($implement)) {
                $this->app->bind($interface, $implement);
            }
        }
    }
}
```

---

## 3. Struktur per Modul

```
app/Http/Controllers/{Group}/ProductController.php        # {Group} = MasterData, Promotion, Settings, ...
app/Http/Controllers/Api/v1/ProductController.php          # [OPSIONAL] konsumen eksternal
app/Http/Requests/Product/StoreRequest.php
app/Http/Requests/Product/UpdateRequest.php
app/Http/Requests/Product/Concerns/*.php                   # [OPSIONAL] trait rules yang dipakai ulang
app/Services/Product/ProductService.php                    # Facade
app/Services/Product/ProductServiceImplement.php           # logic
app/Repositories/Product/ProductRepository.php             # interface
app/Repositories/Product/ProductRepositoryImplement.php    # query
app/Models/Product.php
app/Enums/ProductStatus.php                                # kolom kategori tetap
app/Jobs/{Group}/{Module}/*Job.php                         # [OPSIONAL] background job
app/Observers/ProductObserver.php                          # [OPSIONAL] efek samping model
app/Policies/ProductPolicy.php                             # [OPSIONAL] otorisasi per-record
database/factories/ProductFactory.php
tests/Feature/Product/ProductCrudTest.php
```

Penamaan:

- **[WAJIB]** Folder Service/Repository memakai nama **singular** = nama Model.
- **[DEFAULT]** Service untuk sub-domain boleh bersarang
  (`app/Services/Promotion/DirectDiscount/`) karena Facade tidak butuh
  auto-bind. Repository-nya tetap satu level.
- **[DEFAULT]** FormRequest di dalam folder modul memakai nama aksi pendek
  (`StoreRequest`, `UpdateRequest`, `ChangeStatusRequest`). Namespace folder
  sudah menjelaskan modulnya.
- **[WAJIB]** Config custom multi-kata memakai dash (`config/mime-types.php`).
  File hasil `vendor:publish` tidak di-rename.

---

## 4. Route

```php
// routes/web.php
Route::prefix('product')->as('product.')->group(function () {
    Route::middleware('can:product.view')->group(function () {
        Route::get('/', [ProductController::class, 'index'])->name('index');
        Route::get('list', [ProductController::class, 'list'])->name('list');
        Route::get('statistics', [ProductController::class, 'statistics'])->name('statistics');
        Route::get('select-list', [ProductController::class, 'selectList'])->name('select-list');
        Route::get('{id}', [ProductController::class, 'detail'])->name('detail');
    });
    Route::middleware('can:product.create')->group(function () {
        Route::get('create', [ProductController::class, 'create'])->name('create');
        Route::post('/', [ProductController::class, 'store'])->name('store');
    });
    Route::post('sync-all', [ProductController::class, 'syncAll'])->name('sync-all')->middleware('can:product.sync');
});
```

- **[WAJIB]** Nama route `{feature}.{action}`. Prefix dan `as` sama dengan
  folder fitur frontend (`pages/{feature}/`).
- **[WAJIB]** Gunakan nama aksi baku berikut supaya frontend bisa ditebak:

  | Aksi | Method | Response |
  |---|---|---|
  | `index`, `create`, `edit`, `detail` | GET | Inertia page |
  | `list` | GET | JSON Yajra DataTables |
  | `statistics`, `overview` | GET | JSON objek ringkasan |
  | `select-list` | GET | JSON terpaginasi untuk combobox (§5.3) |
  | `store`, `update`, `destroy` | POST/PUT/DELETE | redirect + flash (form Inertia) **atau** JSON (aksi di tempat) |
  | `sync-all`, `toggle`, aksi domain lain | POST/PATCH | JSON `{ message, data? }` |
- **[WAJIB]** Setiap route yang dapat diakses user dilindungi `can:{module}.{action}` (§12).
- **[WAJIB]** Route statis (`create`, `list`) didaftarkan **sebelum** route
  berparameter (`{id}`).

---

## 5. Controller

### 5.1 Tiga Jenis Response

```php
class ProductController extends Controller
{
    // 1. Inertia page — hanya render + props awal
    public function index()
    {
        return inertia('product/pages/ProductIndex');
    }

    public function edit(int $id)
    {
        return inertia('product/pages/ProductEdit', [
            'product' => ProductService::getEditData($id),
        ]);
    }

    // 2. JSON — untuk useQuery / useDataTable di frontend
    public function list()
    {
        return ProductService::getDatatableList();
    }

    public function statistics()
    {
        return response()->json(ProductService::getStatistics());
    }

    // 3. Mutasi dari form Inertia — redirect + flash
    public function store(StoreRequest $request)
    {
        try {
            ProductService::store($request->validated());
        } catch (BusinessException $e) {
            return back()->with('error', $e->getMessage());
        }

        return to_route('product.index')->with('success', 'Product created.');
    }

    // 3b. Aksi di tempat (dipanggil useMutation) — JSON
    public function syncAll()
    {
        ProductService::dispatchSyncAll();

        return response()->json(['message' => 'Sync started.']);
    }
}
```

### 5.2 Aturan

- **[WAJIB]** Nama komponen Inertia = `'{feature}/pages/{Feature}{Action}'`
  (path relatif `resources/js/pages`, tanpa ekstensi).
- **[WAJIB]** Props Inertia hanya berisi data yang **dibutuhkan untuk render
  pertama**. Data besar/lambat disediakan lewat endpoint JSON terpisah (atau
  deferred/lazy props Inertia v2).
- **[WAJIB]** Tidak ada `DB::beginTransaction()` di Controller. Transaksi
  milik Service.
- **[WAJIB]** Jangan menangkap `\Throwable` lalu mengirim `$th->getMessage()`
  ke user, karena pesan error SQL/internal bisa bocor. Tangkap hanya exception
  bisnis (§10). Error lain dibiarkan sampai ke handler global (500 + log).
- **[WAJIB]** Mutasi form Inertia selalu diakhiri `redirect` (bukan
  `response()->json`), supaya Inertia bisa memperbarui halaman dan flash
  tampil. Error validasi (422) ditangani otomatis oleh FormRequest.
- **[WAJIB]** Input dibaca dari `$request->validated()`, bukan
  `$request->all()` atau `request('x')` di layer bawah.

### 5.3 Bentuk JSON Baku

| Endpoint | Bentuk |
|---|---|
| `list` | Native Yajra: `{ draw, recordsTotal, recordsFiltered, data: [...] }` |
| `select-list` | `{ message, meta: { current_page, next_page, has_more }, data: [...] }` |
| aksi (`sync-all`, `toggle`, `save-draft`) | `{ message, data? }` + status HTTP yang sesuai |
| `statistics` / `overview` | objek datar yang tipenya dicerminkan di `types/` frontend |
| error bisnis dari endpoint JSON | `{ message }` + 4xx (422/409) |

---

## 6. FormRequest

```php
class StoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // permission sudah dicek middleware `can:` di route
    }

    public function rules(): array
    {
        return [
            'name'     => ['required', 'string', 'max:150'],
            'sku'      => ['required', 'string', Rule::unique('products', 'sku')],
            'status'   => ['required', Rule::enum(ProductStatus::class)],
            'store_ids'   => ['array'],
            'store_ids.*' => ['integer', 'exists:stores,id'],
        ];
    }
}
```

- **[WAJIB]** Semua input divalidasi oleh FormRequest. `$request->validate()`
  inline tidak dipakai.
- **[WAJIB]** `authorize()` default `true`. Isi hanya untuk otorisasi
  per-record, dengan mendelegasikan ke Policy:
  `Gate::allows('update', $this->route('product'))`.
- **[DEFAULT]** Rules yang dipakai ulang di beberapa request dijadikan trait
  di `Requests/{Module}/Concerns/`. Rule yang butuh query lintas tabel
  dijadikan class di `app/Rules/`.
- **[WAJIB]** Nama field sama dengan tipe `{Feature}FormData` di frontend
  (snake_case).

---

## 7. Service (Facade + Implement)

```php
// ProductService.php — Facade
class ProductService extends Facade
{
    protected static function getFacadeAccessor()
    {
        return ProductServiceImplement::class;
    }
}
```

```php
// ProductServiceImplement.php
class ProductServiceImplement extends Service
{
    public function __construct(
        protected ProductRepository $mainRepository,
        protected StoreRepository $storeRepository,
    ) {}

    public function getDatatableList(array $filters = [])
    {
        return DataTables::eloquent($this->mainRepository->getDatatableList($filters))
            ->addIndexColumn()
            ->toJson();
    }

    public function store(array $data): Product
    {
        return DB::transaction(function () use ($data) {
            $product = $this->mainRepository->create(Arr::except($data, ['store_ids']));
            $product->stores()->sync($data['store_ids'] ?? []);

            return $product;
        });
    }

    public function approve(int $id): Product
    {
        return DB::transaction(function () use ($id) {
            $product = $this->mainRepository->findForUpdate($id); // lockForUpdate
            if ($product->status !== ProductStatus::PENDING) {
                throw new BusinessException('Product has already been processed.');
            }

            return $this->mainRepository->update($id, ['status' => ProductStatus::APPROVED]);
        });
    }
}
```

- **[WAJIB]** Controller, Job, dan Command memanggil Service lewat Facade
  (`ProductService::store()`), tidak pernah `new ProductServiceImplement`.
- **[WAJIB]** Operasi tulis multi-langkah dibungkus `DB::transaction()`.
- **[WAJIB]** Pelanggaran aturan bisnis dilempar sebagai `BusinessException`
  (§10), bukan `\Exception` generik.
- **[WAJIB]** Listing untuk datatable dibungkus `DataTables::eloquent($builder)`
  atau `DataTables::of($builder)`, bukan `paginate()` manual.
- **[WAJIB]** Service boleh memanggil Service lain untuk orkestrasi lintas
  modul, tapi tidak boleh membentuk respons HTTP (redirect, json, inertia).
- **[DEFAULT]** Kalau satu method Service lebih dari ~40 baris logic, atau
  menyuntik banyak repository di luar repository utamanya, ekstrak ke Action
  class `app/Actions/{Module}/{Verb}{Module}Action.php` (method `handle()`),
  lalu panggil dari Service.
- **[DEFAULT]** Efek samping yang tidak harus berada di transaksi yang sama
  (notifikasi, cache, log aktivitas) dipisah lewat Event/Listener atau Observer.
- **[WAJIB]** Service bersifat stateless. Data per-panggilan tidak disimpan
  di property, karena instance Facade dipakai bersama sepanjang request/worker.

---

## 8. Repository

```php
interface ProductRepository extends Repository
{
    public function getDatatableList(array $filters = []): Builder;
    public function getSelectList(?string $search, int $perPage = 15): LengthAwarePaginator;
    public function findForUpdate(int $id): Product;
}
```

```php
class ProductRepositoryImplement extends Eloquent implements ProductRepository
{
    public function __construct(protected Product $model) {}

    public function getDatatableList(array $filters = []): Builder
    {
        return $this->model->query()
            ->leftJoin('brands', 'brands.id', 'products.brand_id')
            ->select(['products.*', 'brands.name as brand_name'])
            ->when($filters['brand_id'] ?? null, fn ($q, $v) => $q->where('products.brand_id', $v))
            ->when($filters['is_active'] ?? null, fn ($q, $v) => $q->where('products.is_active', $v));
        // JANGAN ->get() — Yajra yang paginate/sort/search di SQL
    }

    public function getSelectList(?string $search, int $perPage = 15): LengthAwarePaginator
    {
        return $this->model->query()
            ->when($search, fn ($q, $s) => $q->where('name', 'ilike', "%{$s}%"))
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function findForUpdate(int $id): Product
    {
        return $this->model->query()->lockForUpdate()->findOrFail($id);
    }
}
```

- **[WAJIB]** Interface hanya mendeklarasikan method kustom, dengan
  return type eksplisit.
- **[WAJIB]** Method untuk datatable mengembalikan **query builder**.
- **[WAJIB]** Filter diterima sebagai parameter (`array $filters`,
  `?string $search`). Repository **tidak membaca** `request()` secara langsung,
  karena method seperti itu tidak bisa dipakai ulang dari Job/Command dan
  susah dites. Service atau Controller yang meneruskan nilai dari request.
- **[WAJIB]** Kolom yang dibutuhkan di setiap baris tabel di-`join`/`select`,
  atau di-eager-load dengan `with()`/`withCount()`, supaya tidak terjadi N+1.
- **[WAJIB]** Tidak ada transaksi dan tidak ada keputusan bisnis di Repository.
- **[DEFAULT]** Data referensi yang jarang berubah (dropdown) di-cache dengan
  `Cache::remember`, lalu di-`forget` di method tulis repository yang sama.
- **[OPSIONAL]** Repository ke DB eksternal read-only memakai connection
  terpisah (`protected $connection` di Model, atau `DB::connection('x')`).
  Repository itu **tidak pernah** menulis ke koneksi tersebut.

---

## 9. Model, Enum, Observer

- **[WAJIB]** Model hanya berisi `$fillable`/`$guarded`, `casts()`, relasi,
  scope kecil, dan accessor. Model tidak memanggil Service/Repository.
- **[WAJIB]** Kolom kategori tetap (status, tipe) memakai PHP backed enum,
  di-cast di Model, divalidasi dengan `Rule::enum()`, dan **dicerminkan sebagai
  union string di `resources/js/types`** dengan nilai yang identik.

  ```php
  enum ProductStatus: string
  {
      case DRAFT    = 'draft';
      case PENDING  = 'pending';
      case APPROVED = 'approved';

      public function label(): string
      {
          return match ($this) {
              self::DRAFT    => 'Draft',
              self::PENDING  => 'Pending',
              self::APPROVED => 'Approved',
          };
      }
  }
  ```
- **[DEFAULT]** Observer dipakai untuk efek samping model yang generik
  (invalidasi cache, audit). Observer tidak dipakai untuk aturan bisnis yang
  harus terlihat jelas di Service.
- **[WAJIB]** Setiap Model punya Factory.

---

## 10. Penanganan Error

**[DEFAULT]** Buat satu exception bisnis per project:

```php
// app/Exceptions/BusinessException.php
class BusinessException extends RuntimeException
{
    public function __construct(string $message, public readonly int $status = 422)
    {
        parent::__construct($message);
    }
}
```

Lalu render sentral di `bootstrap/app.php`:

```php
->withExceptions(function (Exceptions $exceptions) {
    $exceptions->render(function (BusinessException $e, Request $request) {
        if ($request->expectsJson() && ! $request->header('X-Inertia')) {
            return response()->json(['message' => $e->getMessage()], $e->status);
        }

        return back()->with('error', $e->getMessage());
    });
})
```

Dengan cara ini Controller tidak perlu `try/catch` sama sekali untuk error
bisnis:

| Situasi | Hasil |
|---|---|
| Validasi gagal (FormRequest) | 422 → Inertia mengisi `form.errors`, axios `error.response.data.errors` |
| Aturan bisnis dilanggar (`BusinessException`) | form Inertia: redirect back + flash `error`; axios: `{message}` 4xx |
| Tidak berhak (`can:` gagal) | 403 |
| Bug/infra (`QueryException`, dll) | 500 + log, pesan detail hanya saat `APP_DEBUG` |

- **[WAJIB]** Pesan `BusinessException` aman dibaca user. Detail teknis
  dicatat ke log, tidak ditampilkan.

---

## 11. Inertia Shared Props

`app/Http/Middleware/HandleInertiaRequests::share()`:

```php
return [
    ...parent::share($request),
    'flash' => [
        'success' => fn () => $request->session()->get('success'),
        'error'   => fn () => $request->session()->get('error'),
    ],
    'auth' => fn () => [
        'user'        => /* user ringkas, tanpa data sensitif */,
        'permissions' => /* daftar nama permission user */,
    ],
];
```

- **[WAJIB]** Shared props dibungkus closure (lazy) supaya hanya dievaluasi
  ketika dibutuhkan, dan setelah middleware auth jalan.
- **[WAJIB]** Jangan membagikan data sensitif (token, secret, data user lain).
  Semua shared props terlihat di HTML halaman.
- **[WAJIB]** Kunci flash baku: `success` dan `error`. Bentuk shared props
  dicerminkan di `types/common/page-props.ts` frontend.

---

## 12. Permission & Authorization

- **[WAJIB]** Format nama: `{module}.{action}` (contoh `product.view`,
  `product.create`, `product.sync`). Daftar lengkapnya didokumentasikan di
  satu file katalog (mis. `PERMISSIONS.md`).
- **[WAJIB]** Dicek di **route** (`->middleware('can:product.create')`) dan
  dicerminkan di **UI** (`usePermission().hasPermission('product.create')`).
  Aksi baru wajib memperbarui route, UI, dan katalog sekaligus.
- **[DEFAULT]** Gate untuk "boleh akses fitur ini". Policy untuk "boleh akses
  record ini" (kepemilikan, scope wilayah).
- **[DEFAULT]** Sumber permission ditulis di Project Profile: SSO eksternal
  (Gate didefinisikan dinamis per request), atau tabel lokal
  (`spatie/laravel-permission`).
- **[WAJIB]** Bypass untuk development hanya lewat flag env, dengan guard
  **allow-list** `app()->isLocal()`. Jangan pakai block-list
  `! app()->isProduction()`, karena environment `testing` ikut lolos dan test
  permission jadi palsu. Jangan pernah aktif di staging/production.

---

## 13. Background Job & Sinkronisasi

```php
class SyncAllProductJob implements ShouldQueue, ShouldBeUnique
{
    use Queueable;

    public $timeout = 3600;

    public function __construct(public readonly string $triggeredBy = 'System') {}

    public function handle(): void
    {
        ProductService::syncAll(); // Job memanggil Service, bukan query langsung
    }

    public function failed(Throwable $e): void
    {
        // tandai progress/sync log sebagai gagal
    }
}
```

- **[WAJIB]** Job memanggil Service Facade di `handle()`, seperti Controller.
- **[WAJIB]** Job yang bisa terpicu ganda (scheduler overlap, tombol diklik dua
  kali) memakai `ShouldBeUnique` atau lock.
- **[WAJIB]** `retry_after` koneksi queue harus **lebih besar** dari runtime
  job terlama. Jika tidak, worker akan menjalankan job yang sama dua kali.
- **[DEFAULT]** Satu queue untuk satu flow bisnis (`sync`, `approval`,
  `reports`), supaya job lambat tidak menahan job yang perlu cepat.
- **[DEFAULT]** Exception "tidak eligible" yang memang diharapkan di-log
  sebagai warning tanpa rethrow. Error lain di-rethrow supaya di-retry.
- **[OPSIONAL]** Progress job yang tampil di UI disimpan di cache/tabel dan
  dibaca lewat endpoint `cache.progress`. Frontend melakukan polling dengan
  `useQuery` + `refetchInterval`.

---

## 14. API Eksternal **[OPSIONAL]**

```
routes/api.php → app/Http/Controllers/Api/v1/{Module}Controller.php
app/Http/Requests/Api/{Module}/*Request.php      # dipisah dari request web
```

- **[WAJIB]** Versi di namespace dan folder memakai huruf kecil (`Api\v1`),
  sama persis dengan prefix URL `api/v1`.
- **[WAJIB]** Auth API terpisah dari auth web (Sanctum token / OAuth client
  credential / API key). Keduanya tidak boleh dicampur.
- **[WAJIB]** Envelope JSON seragam untuk seluruh endpoint API, misalnya
  `{ success, message, data | errors, timestamp }`, dibentuk oleh helper atau
  middleware formatter, tidak ditulis ulang per action.
- **[DEFAULT]** Urutan middleware API ditetapkan eksplisit lewat
  `withMiddleware()->priority([...])`: logger → formatter → auth → IP allowlist →
  expiry/scope → signature. Beri komentar di `bootstrap/app.php`, karena urutan
  ini menentukan perilaku.
- **[DEFAULT]** Bentuk data kompleks memakai `JsonResource`.

---

## 15. Testing

- **[WAJIB]** Feature test per endpoint, lewat HTTP (route + middleware +
  response). Untuk halaman Inertia, assert nama komponen dan props:

  ```php
  public function test_index_renders_page(): void
  {
      $this->actingAsWithPermissions(['product.view'])
          ->get(route('product.index'))
          ->assertOk()
          ->assertInertia(fn (AssertableInertia $page) => $page->component('product/pages/ProductIndex'));
  }

  public function test_store_requires_permission(): void
  {
      $this->actingAsWithPermissions([])
          ->post(route('product.store'), [...])
          ->assertForbidden();
  }
  ```
  `actingAsWithPermissions()` adalah helper di base `TestCase` project (bukan
  bawaan Laravel). Isinya login sebagai user dengan daftar permission
  tertentu, mengikuti sumber permission project (SSO/session atau tabel lokal).
  Tulis nama helper project Anda di Project Profile.
- **[WAJIB]** Test untuk: render page, bentuk JSON `list`, validasi 422,
  permission 403, dan transisi status penting.
- **[DEFAULT]** Unit test Service untuk logic murni (kalkulasi, validasi
  state), dengan Repository di-mock.
- **[DEFAULT]** `phpunit.xml`: SQLite in-memory + `QUEUE_CONNECTION=sync`,
  supaya job yang di-dispatch ikut jalan saat test.
- **[WAJIB]** Factory untuk setiap Model.

---

## 16. Ringkasan: Concern → Lokasi

| Concern | Lokasi |
|---|---|
| URL, middleware, permission per aksi | `routes/web.php` / `routes/api.php` |
| Bentuk response (Inertia / JSON / redirect + flash) | Controller |
| Validasi input | FormRequest (+ `Concerns/`, `app/Rules/`) |
| Aturan bisnis, transaksi, orkestrasi | ServiceImplement (atau Action class) |
| Query, filter, join, sort, lock | RepositoryImplement |
| Relasi, cast, accessor | Model |
| Nilai kategori tetap | Enum (+ union type di frontend) |
| Efek samping non-kritis | Event/Listener atau Observer |
| Otorisasi per-record | Policy |
| Pekerjaan lama / terjadwal | Job (memanggil Service) + scheduler |
| Data global ke semua halaman | `HandleInertiaRequests::share()` |
| Render error bisnis | `bootstrap/app.php` `withExceptions()` |

---

## 17. Larangan

| ❌ Jangan | ✅ Lakukan |
|---|---|
| Query Eloquent di Controller | method Repository |
| `DB::beginTransaction()` di Controller | `DB::transaction()` di Service |
| `catch (\Throwable $th) { return back()->with('error', $th->getMessage()); }` | lempar `BusinessException`; render sentral |
| `request('x')` di dalam Repository | parameter method |
| `->get()` pada method untuk datatable | return builder |
| `$request->all()` diteruskan ke `create()` | `$request->validated()` |
| `new ProductServiceImplement()` | `ProductService::method()` |
| Magic string status tersebar | Enum |
| Route tanpa `can:` | middleware permission |
| Mengganti nama route tanpa update frontend | nama route = kontrak |
| Data sensitif di shared props | hanya data minimum |
| Repository bersarang dua level | satu level di `app/Repositories` |

---

## 18. Checklist Modul Baru

1. Migration + Model (+ cast Enum) + Factory.
2. `php artisan make:repository {Module} --service` → isi interface + implement.
3. FormRequest untuk setiap aksi yang menerima input.
4. Service: method listing (DataTables), CRUD dalam transaksi, aturan bisnis.
5. Controller tipis dengan tiga jenis response (§5).
6. Route group `{feature}.*` + `can:{module}.{action}` + nama aksi baku (§4).
7. Tambahkan permission ke katalog permission project.
8. Feature test (page, list, validasi, permission).
9. Frontend sesuai FRONTEND-STANDARD (`api/`, `types/`, `pages/{feature}`).
10. `php artisan test` hijau dan `vendor/bin/pint` bersih.
