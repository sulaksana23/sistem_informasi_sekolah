import { router, useForm, usePage } from "@inertiajs/react";
import { Trash2, UserPlus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { route } from "ziggy-js";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    ConfirmDialog,
    Panel,
    SchoolField,
    SchoolPage,
    type SelectOption,
} from "@/components/common/SchoolShared";
import type { PageProps } from "@/types/common/page-props";

type Member = {
    id: number; user_id: number; name: string | null; email: string | null;
    role: string; role_label: string; joined_at: string | null;
};
type Props = { members: Member[]; roles: SelectOption[] };

export default function MemberIndex({ members, roles }: Props) {
    const { auth } = usePage<PageProps>().props;
    const form = useForm({ email: "", role: "teacher" });
    const [removing, setRemoving] = useState<Member | null>(null);
    const [busyId, setBusyId] = useState<number | null>(null);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post(route("school.members.store"), { preserveScroll: true, onSuccess: () => form.reset("email") });
    };

    const changeRole = (member: Member, role: string) => {
        if (role === member.role) return;
        router.put(route("school.members.update", { id: member.id }), { role }, {
            preserveScroll: true,
            onStart: () => setBusyId(member.id),
            onFinish: () => setBusyId(null),
        });
    };

    const confirmRemove = () => {
        if (!removing) return;
        router.delete(route("school.members.destroy", { id: removing.id }), {
            preserveScroll: true,
            onStart: () => setBusyId(removing.id),
            onFinish: () => { setBusyId(null); setRemoving(null); },
        });
    };

    return (
        <SchoolPage title="Anggota Sekolah" description="Kelola akun yang dapat mengakses sekolah ini beserta perannya.">
            <Panel title="Tambah anggota" description="Akun harus sudah mendaftar. Masukkan email akun lalu pilih perannya.">
                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <SchoolField
                            field={{ name: "email", label: "Email akun", type: "email", required: true }}
                            value={form.data.email}
                            onChange={(value) => form.setData("email", String(value))}
                            error={form.errors.email}
                        />
                        <SchoolField
                            field={{ name: "role", label: "Peran", type: "select", required: true, options: roles }}
                            value={form.data.role}
                            onChange={(value) => form.setData("role", String(value))}
                            error={form.errors.role}
                        />
                    </div>
                    <Button type="submit" disabled={form.processing}>
                        <UserPlus aria-hidden="true" />
                        {form.processing ? "Menyimpan…" : "Tambah anggota"}
                    </Button>
                </form>
            </Panel>

            <Panel title="Daftar anggota" description={`${members.length} anggota.`}>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nama</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Peran</TableHead>
                            <TableHead>Bergabung</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {members.map((member) => {
                            const self = member.user_id === auth.user?.id;
                            return (
                                <TableRow key={member.id}>
                                    <TableCell>{member.name ?? "—"}{self && <span className="ml-1 text-xs text-muted-foreground">(Anda)</span>}</TableCell>
                                    <TableCell>{member.email ?? "—"}</TableCell>
                                    <TableCell>
                                        {self ? member.role_label : (
                                            <Select value={member.role} disabled={busyId === member.id}
                                                onValueChange={(role) => changeRole(member, role)}>
                                                <SelectTrigger className="w-40" aria-label={`Peran ${member.name ?? member.email}`}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {roles.map((role) => (
                                                        <SelectItem key={role.value} value={String(role.value)}>{role.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </TableCell>
                                    <TableCell>{member.joined_at ?? "—"}</TableCell>
                                    <TableCell className="text-right">
                                        {!self && (
                                            <Button type="button" variant="ghost" size="sm" className="text-destructive"
                                                disabled={busyId === member.id} onClick={() => setRemoving(member)}>
                                                <Trash2 aria-hidden="true" />
                                                Cabut
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </Panel>

            <ConfirmDialog
                open={removing !== null}
                onOpenChange={(open) => !open && setRemoving(null)}
                title="Cabut keanggotaan?"
                description={removing ? `${removing.name ?? removing.email} tidak lagi dapat mengakses sekolah ini.` : undefined}
                confirmLabel="Cabut"
                busy={busyId !== null}
                onConfirm={confirmRemove}
            />
        </SchoolPage>
    );
}
