import type { PropsWithChildren } from "react";
import { GraduationCap } from "lucide-react";

function BrandMark() {
    return (
        <div className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
                <GraduationCap className="size-6" aria-hidden="true" />
            </span>
            <span>
                <span className="block text-sm font-semibold">Sistem Informasi Sekolah</span>
                <span className="block text-xs text-muted-foreground">Portal akademik</span>
            </span>
        </div>
    );
}

export function AuthLayout({ children }: PropsWithChildren) {
    return (
        <main className="grid min-h-screen place-items-center bg-muted/40 px-4 py-8 sm:px-6 lg:py-12">
            <div className="mx-auto grid w-full max-w-6xl items-center gap-8 md:grid-cols-2 lg:gap-16">
                <aside className="relative hidden min-h-96 flex-col justify-between overflow-hidden rounded-xl bg-primary p-10 text-primary-foreground md:flex lg:p-12">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3">
                            <span className="grid size-11 place-items-center rounded-lg bg-primary-foreground/15">
                                <GraduationCap className="size-6" aria-hidden="true" />
                            </span>
                            <div>
                                <p className="text-sm font-semibold">Sistem Informasi Sekolah</p>
                                <p className="text-xs text-primary-foreground/75">Portal akademik</p>
                            </div>
                        </div>
                        <div className="mt-24 max-w-md">
                            <p className="text-xs font-semibold uppercase tracking-wide text-primary-foreground/75">
                                Ruang kerja sekolah
                            </p>
                            <h1 className="mt-4 text-3xl font-semibold leading-tight lg:text-4xl">
                                Informasi sekolah, lebih mudah dikelola.
                            </h1>
                            <p className="mt-4 text-sm leading-6 text-primary-foreground/80">
                                Masuk untuk melanjutkan pekerjaan administrasi dan akademik sekolah.
                            </p>
                        </div>
                    </div>
                    <p className="relative z-10 text-xs text-primary-foreground/70">
                        Gunakan akun sesuai akses yang diberikan oleh sekolah.
                    </p>
                    <div className="pointer-events-none absolute -bottom-20 -right-16 size-72 rounded-full border-8 border-primary-foreground/10" />
                    <div className="pointer-events-none absolute -bottom-8 -right-4 size-44 rounded-full border border-primary-foreground/15" />
                </aside>

                <section className="mx-auto w-full max-w-md md:ml-auto">
                    <div className="mb-6 md:hidden">
                        <BrandMark />
                    </div>
                    {children}
                    <p className="mt-6 text-center text-xs text-muted-foreground">
                        Gunakan akun sekolah sesuai tanggung jawab yang diberikan.
                    </p>
                </section>
            </div>
        </main>
    );
}
