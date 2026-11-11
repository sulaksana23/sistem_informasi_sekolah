import { useForm } from "@inertiajs/react";
import { route } from "ziggy-js";
import {
    Building2,
    GraduationCap,
    Info,
    Mail,
    MapPin,
    Phone,
    Save,
    ShieldCheck,
    UsersRound,
    UserRoundCog,
} from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { Panel, SchoolField, SchoolPage, type FieldSpec } from "@/components/common/SchoolShared";
import { usePermission } from "@/hooks/use-permission";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    SCHOOL_ACCREDITATION_OPTIONS,
    SCHOOL_LEVEL_OPTIONS,
    SCHOOL_STATUS_OPTIONS,
} from "@/types/school/enums";
import type { SchoolProfile, SchoolProfileFormData } from "@/types/school/profile";

type ProfileField = FieldSpec & { name: keyof SchoolProfileFormData };

const IDENTITY_FIELDS: ProfileField[] = [
    { name: "name", label: "Nama sekolah", type: "text", required: true },
    { name: "npsn", label: "NPSN", type: "text" },
    { name: "level", label: "Jenjang", type: "select", options: SCHOOL_LEVEL_OPTIONS },
    { name: "status", label: "Status sekolah", type: "select", options: SCHOOL_STATUS_OPTIONS },
    { name: "accreditation", label: "Akreditasi", type: "select", options: SCHOOL_ACCREDITATION_OPTIONS },
    { name: "founded_year", label: "Tahun berdiri", type: "number" },
];

const CONTACT_FIELDS: ProfileField[] = [
    { name: "headmaster_name", label: "Nama kepala sekolah", type: "text" },
    { name: "phone", label: "Nomor telepon", type: "text" },
    { name: "email", label: "Email sekolah", type: "email" },
    { name: "website", label: "Situs web", type: "text" },
    { name: "address", label: "Alamat", type: "textarea" },
];

const DESCRIPTION_FIELDS: ProfileField[] = [
    { name: "description", label: "Keterangan / motto sekolah", type: "textarea" },
];

/** Field yang dihitung pada indikator kelengkapan profil. */
const PROFILE_KEYS: (keyof SchoolProfileFormData)[] = [
    ...IDENTITY_FIELDS.map((field) => field.name),
    ...CONTACT_FIELDS.map((field) => field.name),
    ...DESCRIPTION_FIELDS.map((field) => field.name),
];

function toFormData(profile: SchoolProfile): SchoolProfileFormData {
    return {
        name: profile.name,
        npsn: profile.npsn ?? "",
        level: profile.level ?? "",
        status: profile.status ?? "",
        accreditation: profile.accreditation ?? "",
        address: profile.address ?? "",
        phone: profile.phone ?? "",
        email: profile.email ?? "",
        website: profile.website ?? "",
        headmaster_name: profile.headmaster_name ?? "",
        founded_year: profile.founded_year === null ? "" : String(profile.founded_year),
        description: profile.description ?? "",
    };
}

function initialsOf(name: string): string {
    const words = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
    return words.map((word) => word[0]?.toUpperCase() ?? "").join("") || "S";
}

export default function SchoolProfilePage({ profile }: { profile: SchoolProfile }) {
    const { hasPermission } = usePermission();
    const canManage = hasPermission("school.manage");
    const form = useForm<SchoolProfileFormData>(toFormData(profile));

    const filled = PROFILE_KEYS.filter((key) => String(form.data[key] ?? "").trim() !== "").length;
    const completeness = Math.round((filled / PROFILE_KEYS.length) * 100);

    const setField = (name: keyof SchoolProfileFormData, value: string | number | boolean) => {
        form.setData(name, String(value));
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.put(route("school.profile.update"), { preserveScroll: true });
    };

    return (
        <SchoolPage
            title="Profil Sekolah"
            description="Identitas resmi sekolah yang dipakai di absensi, nilai, dan laporan."
        >
            <Panel>
                <div className="flex flex-wrap items-start gap-4">
                    <span
                        aria-hidden="true"
                        className="flex size-14 shrink-0 items-center justify-center rounded-xl border border-brand-soft bg-brand-softer text-lg font-semibold text-primary"
                    >
                        {initialsOf(profile.name)}
                    </span>
                    <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-lg font-semibold text-secondary-foreground">{profile.name}</h2>
                            {profile.status_label && <Badge variant="success-outline">{profile.status_label}</Badge>}
                            {profile.level_label && <Badge variant="outline">{profile.level_label}</Badge>}
                            {profile.accreditation && (
                                <Badge variant="info-outline">
                                    <ShieldCheck />
                                    Akreditasi {profile.accreditation}
                                </Badge>
                            )}
                        </div>
                        <p className="max-w-3xl text-sm text-muted-foreground">
                            {profile.description ??
                                "Belum ada keterangan sekolah. Lengkapi profil agar dokumen sekolah memuat identitas yang utuh."}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                            <ContactItem icon={MapPin} value={profile.address} />
                            <ContactItem icon={Phone} value={profile.phone} />
                            <ContactItem icon={Mail} value={profile.email} />
                            <ContactItem icon={Building2} value={profile.website} />
                            <ContactItem
                                icon={UserRoundCog}
                                value={profile.headmaster_name && `Kepala sekolah: ${profile.headmaster_name}`}
                            />
                        </div>
                    </div>
                </div>

                <dl className="mt-5 grid gap-3 sm:grid-cols-3">
                    <Counter icon={GraduationCap} label="Siswa" value={profile.student_count} />
                    <Counter icon={UsersRound} label="Guru" value={profile.teacher_count} />
                    <Counter icon={UserRoundCog} label="Anggota sekolah" value={profile.member_count} />
                </dl>
            </Panel>

            {canManage ? (
                <Panel
                    title="Ubah profil"
                    description="Perubahan berlaku untuk seluruh pengguna sekolah ini."
                    actions={
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground">Kelengkapan {completeness}%</span>
                            <Progress value={completeness} aria-label="Kelengkapan profil sekolah" className="w-24" />
                        </div>
                    }
                >
                    <form onSubmit={submit} className="space-y-6">
                        <FormSection title="Identitas sekolah" description="Data resmi yang dipakai pada laporan dan cetakan.">
                            <FieldGrid fields={IDENTITY_FIELDS} form={form} onChange={setField} />
                        </FormSection>

                        <FormSection title="Kontak & alamat" description="Cara orang tua dan dinas menghubungi sekolah.">
                            <FieldGrid fields={CONTACT_FIELDS} form={form} onChange={setField} />
                        </FormSection>

                        <FormSection title="Keterangan" description="Ringkasan singkat yang tampil di bagian atas halaman ini.">
                            <FieldGrid fields={DESCRIPTION_FIELDS} form={form} onChange={setField} />
                        </FormSection>

                        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
                            <Button type="submit" disabled={form.processing || !form.isDirty}>
                                <Save />
                                {form.processing ? "Menyimpan…" : "Simpan profil"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={form.processing || !form.isDirty}
                                onClick={() => form.reset()}
                            >
                                Batalkan perubahan
                            </Button>
                            {form.isDirty && (
                                <span className="text-xs text-muted-foreground">Ada perubahan yang belum disimpan.</span>
                            )}
                        </div>
                    </form>
                </Panel>
            ) : (
                <Alert variant="info">
                    <Info />
                    <AlertDescription>
                        Hanya administrator dan tata usaha yang dapat mengubah profil sekolah. Hubungi mereka bila ada
                        data yang perlu diperbarui.
                    </AlertDescription>
                </Alert>
            )}
        </SchoolPage>
    );
}

function FieldGrid({
    fields,
    form,
    onChange,
}: {
    fields: ProfileField[];
    form: { data: SchoolProfileFormData; errors: Partial<Record<string, string>> };
    onChange: (name: keyof SchoolProfileFormData, value: string | number | boolean) => void;
}) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {fields.map((field) => (
                <SchoolField
                    key={field.name}
                    field={field}
                    value={form.data[field.name]}
                    onChange={(value) => onChange(field.name, value)}
                    error={form.errors[field.name]}
                />
            ))}
        </div>
    );
}

function FormSection({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: ReactNode;
}) {
    return (
        <section className="space-y-3">
            <div className="space-y-1">
                <h3 className="text-sm font-medium text-foreground">{title}</h3>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            {children}
        </section>
    );
}

function ContactItem({ icon: Icon, value }: { icon: typeof MapPin; value?: string | null }) {
    if (!value) return null;
    return (
        <span className="inline-flex items-center gap-1.5">
            <Icon className="size-3.5 shrink-0" />
            {value}
        </span>
    );
}

function Counter({ icon: Icon, label, value }: { icon: typeof GraduationCap; label: string; value: number }) {
    return (
        <div className="rounded-lg border border-border bg-muted/40 p-3">
            <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase text-muted-foreground">
                <Icon className="size-3.5" />
                {label}
            </dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums text-secondary-foreground">{value}</dd>
        </div>
    );
}
