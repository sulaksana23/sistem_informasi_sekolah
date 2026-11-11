import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowRight } from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { route } from "ziggy-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/layouts/auth/AuthLayout";

function AuthRegister() {
    const form = useForm({ name: "", email: "", password: "", password_confirmation: "" });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post(route("register.store"), {
            onFinish: () => form.reset("password", "password_confirmation"),
        });
    };

    return (
        <>
            <Head title="Daftar" />
            <div className="rounded-xl border bg-background p-6 sm:p-8">
                <div className="mb-7">
                    <p className="text-sm font-medium text-primary">Buat akun</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight">Daftar ke portal sekolah</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Isi data berikut untuk membuat akun baru.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nama lengkap</Label>
                        <Input
                            id="name"
                            autoComplete="name"
                            autoFocus
                            required
                            value={form.data.name}
                            onChange={(event) => form.setData("name", event.currentTarget.value)}
                            aria-invalid={Boolean(form.errors.name)}
                            aria-describedby={form.errors.name ? "name-error" : undefined}
                            placeholder="Nama lengkap"
                        />
                        {form.errors.name && (
                            <p id="name-error" role="alert" className="text-xs text-destructive">
                                {form.errors.name}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={form.data.email}
                            onChange={(event) => form.setData("email", event.currentTarget.value)}
                            aria-invalid={Boolean(form.errors.email)}
                            aria-describedby={form.errors.email ? "email-error" : undefined}
                            placeholder="nama@sekolah.sch.id"
                        />
                        {form.errors.email && (
                            <p id="email-error" role="alert" className="text-xs text-destructive">
                                {form.errors.email}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Kata sandi</Label>
                        <Input
                            id="password"
                            type="password"
                            autoComplete="new-password"
                            required
                            value={form.data.password}
                            onChange={(event) => form.setData("password", event.currentTarget.value)}
                            aria-invalid={Boolean(form.errors.password)}
                            aria-describedby={form.errors.password ? "password-error" : "password-hint"}
                        />
                        <p id="password-hint" className="text-xs text-muted-foreground">
                            Minimal 8 karakter, berisi huruf dan angka.
                        </p>
                        {form.errors.password && (
                            <p id="password-error" role="alert" className="text-xs text-destructive">
                                {form.errors.password}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password_confirmation">Konfirmasi kata sandi</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            autoComplete="new-password"
                            required
                            value={form.data.password_confirmation}
                            onChange={(event) => form.setData("password_confirmation", event.currentTarget.value)}
                            aria-invalid={Boolean(form.errors.password_confirmation)}
                            aria-describedby={form.errors.password_confirmation ? "confirmation-error" : undefined}
                        />
                        {form.errors.password_confirmation && (
                            <p id="confirmation-error" role="alert" className="text-xs text-destructive">
                                {form.errors.password_confirmation}
                            </p>
                        )}
                    </div>

                    <Button type="submit" size="lg" className="w-full" disabled={form.processing}>
                        {form.processing ? "Membuat akun..." : "Buat akun"}
                        <ArrowRight aria-hidden="true" />
                    </Button>
                </form>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                    Sudah punya akun?{" "}
                    <Link href={route("login")} className="font-medium text-primary underline-offset-4 hover:underline">
                        Masuk
                    </Link>
                </p>
            </div>
        </>
    );
}

export default Object.assign(AuthRegister, {
    layout: (page: ReactNode) => <AuthLayout>{page}</AuthLayout>,
});
