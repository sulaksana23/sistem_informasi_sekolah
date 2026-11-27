import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { Mail } from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { route } from "ziggy-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/layouts/auth/AuthLayout";
import type { PageProps } from "@/types/common/page-props";

function AuthForgotPassword() {
    const { flash } = usePage<PageProps>().props;
    const form = useForm({ email: "" });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post(route("password.email"));
    };

    return (
        <>
            <Head title="Lupa kata sandi" />
            <div className="rounded-xl border bg-background p-6 sm:p-8">
                <div className="mb-7">
                    <h2 className="text-2xl font-semibold tracking-tight">Lupa kata sandi</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Masukkan email akun Anda. Kami akan mengirim tautan untuk membuat kata sandi baru.
                    </p>
                </div>

                {flash?.success && (
                    <p role="status" className="mb-5 rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">
                        {flash.success}
                    </p>
                )}

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
                            <p id="email-error" role="alert" className="text-xs text-destructive">{form.errors.email}</p>
                        )}
                    </div>

                    <Button type="submit" size="lg" className="w-full" disabled={form.processing}>
                        <Mail aria-hidden="true" />
                        {form.processing ? "Mengirim..." : "Kirim tautan reset"}
                    </Button>
                </form>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                    Ingat kata sandi?{" "}
                    <Link href={route("login")} className="font-medium text-primary underline-offset-4 hover:underline">
                        Kembali masuk
                    </Link>
                </p>
            </div>
        </>
    );
}

export default Object.assign(AuthForgotPassword, {
    layout: (page: ReactNode) => <AuthLayout>{page}</AuthLayout>,
});
