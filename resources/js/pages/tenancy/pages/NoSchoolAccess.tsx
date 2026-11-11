import { Head, router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Building2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
/**
 * Halaman untuk akun yang belum tergabung di sekolah mana pun
 * (tanpa keanggotaan yang sah — lihat SetTenantContext middleware).
 */
export default function NoSchoolAccess() {
    return (
        <>
            <Head title="Belum tergabung di sekolah" />
            <main className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col justify-center px-4 py-10">
                <Card>
                    <CardContent className="space-y-4 text-center">
                        <div className="mx-auto flex size-11 items-center justify-center rounded-lg border border-border bg-secondary text-secondary-foreground">
                            <Building2 className="size-5" />
                        </div>
                        <div className="space-y-1.5">
                            <h1 className="text-lg font-medium">Belum tergabung di sekolah</h1>
                            <p className="text-sm text-muted-foreground">
                                Akun Anda sudah aktif, tetapi belum terdaftar sebagai anggota sekolah mana pun.
                                Hubungi administrator sekolah untuk ditambahkan sebagai anggota, lalu masuk kembali.
                            </p>
                        </div>
                        <div className="flex justify-center">
                            <Button variant="outline" onClick={() => router.post(route("logout"))}>
                                <LogOut />
                                Keluar
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </>
    );
}