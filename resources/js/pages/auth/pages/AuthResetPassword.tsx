import { Head, useForm } from "@inertiajs/react";
import { KeyRound } from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { route } from "ziggy-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/layouts/auth/AuthLayout";

type Props = { token: string; email: string };

function AuthResetPassword({ token, email }: Props) {
    const form = useForm({ token, email, password: "", password_confirmation: "" });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post(route("password.store"), { onFinish: () => form.reset("password", "password_confirmation") });
    };

    const fields = [
        { name: "email", label: "Email", type: "email", autoComplete: "username" },
        { name: "password", label: "Kata sandi baru", type: "password", autoComplete: "new-password" },
        { name: "password_confirmation", label: "Ulangi kata sandi baru", type: "password", autoComplete: "new-password" },
    ] as const;

    return (
        <>
            <Head title="Atur ulang kata sandi" />
            <div className="rounded-xl border bg-background p-6 sm:p-8">
                <div className="mb-7">
                    <h2 className="text-2xl font-semibold tracking-tight">Atur ulang kata sandi</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Minimal 8 karakter dan berisi huruf serta angka.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    {fields.map((field) => {
                        const error = form.errors[field.name];
                        return (
                            <div key={field.name} className="space-y-2">
                                <Label htmlFor={field.name}>{field.label}</Label>
                                <Input
                                    id={field.name}
                                    type={field.type}
                                    autoComplete={field.autoComplete}
                                    required
                                    value={form.data[field.name]}
                                    onChange={(event) => form.setData(field.name, event.currentTarget.value)}
                                    aria-invalid={Boolean(error)}
                                    aria-describedby={error ? `${field.name}-error` : undefined}
                                />
                                {error && (
                                    <p id={`${field.name}-error`} role="alert" className="text-xs text-destructive">{error}</p>
                                )}
                            </div>
                        );
                    })}

                    <Button type="submit" size="lg" className="w-full" disabled={form.processing}>
                        <KeyRound aria-hidden="true" />
                        {form.processing ? "Menyimpan..." : "Simpan kata sandi baru"}
                    </Button>
                </form>
            </div>
        </>
    );
}

export default Object.assign(AuthResetPassword, {
    layout: (page: ReactNode) => <AuthLayout>{page}</AuthLayout>,
});
