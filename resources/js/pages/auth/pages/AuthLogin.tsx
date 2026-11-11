import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowRight } from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { route } from "ziggy-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/layouts/auth/AuthLayout";

function AuthLogin() {
    const form = useForm({ email: "", password: "", remember: false });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post(route("login.store"), { onFinish: () => form.reset("password") });
    };

    return (
        <>
            <Head title="Masuk" />
            <div className="rounded-xl border bg-background p-6 sm:p-8">
                <div className="mb-7">
                    <p className="text-sm font-medium text-primary">Selamat datang</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight">Masuk ke akun Anda</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Gunakan email dan kata sandi yang terdaftar.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            autoComplete="username"
                            autoFocus
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
                            autoComplete="current-password"
                            required
                            value={form.data.password}
                            onChange={(event) => form.setData("password", event.currentTarget.value)}
                            aria-invalid={Boolean(form.errors.password)}
                            aria-describedby={form.errors.password ? "password-error" : undefined}
                        />
                        {form.errors.password && (
                            <p id="password-error" role="alert" className="text-xs text-destructive">
                                {form.errors.password}
                            </p>
                        )}
                    </div>

                    <label htmlFor="remember" className="flex w-fit cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                        <input
                            id="remember"
                            type="checkbox"
                            checked={form.data.remember}
                            onChange={(event) => form.setData("remember", event.currentTarget.checked)}
                            className="size-4 rounded border-input accent-primary"
                        />
                        Ingat saya di perangkat ini
                    </label>

                    <Button type="submit" size="lg" className="w-full" disabled={form.processing}>
                        {form.processing ? "Sedang masuk..." : "Masuk"}
                        <ArrowRight aria-hidden="true" />
                    </Button>
                </form>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                    Belum punya akun?{" "}
                    <Link href={route("register")} className="font-medium text-primary underline-offset-4 hover:underline">
                        Daftar sekarang
                    </Link>
                </p>
            </div>
        </>
    );
}

export default Object.assign(AuthLogin, {
    layout: (page: ReactNode) => <AuthLayout>{page}</AuthLayout>,
});
