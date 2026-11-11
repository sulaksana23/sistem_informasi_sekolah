import { Head, Link, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Activity, BookOpen, Package, ShieldCheck, Users } from "lucide-react";
import { Container } from "@/components/common/container";
import Header from "@/components/common/header";
import { StatCard } from "@/components/common/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageProps } from "@/types/common/page-props";

export default function ExampleDashboard() {
    const { auth } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Dashboard" />
            <Container>
                <Header
                    title="Dashboard"
                    description={`Signed in as ${auth.user?.name ?? "Guest"} — this page is served by template-react.`}
                    actions={
                        <Button render={<Link href={route("example.products.index")} />} nativeButton={false}>
                            <Package />
                            Open reference module
                        </Button>
                    }
                />

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <StatCard title="Active users" value={1204} icon={Users} tone="brand" subtitle="Signed in this month" />
                        <StatCard title="Requests today" value={8942} icon={Activity} tone="info" subtitle="All API clients" />
                        <StatCard title="Open items" value={37} icon={Package} tone="warning" subtitle="Waiting for review" />
                        <StatCard title="Uptime" value={99.9} suffix="%" icon={ShieldCheck} tone="success" subtitle="Last 30 days" />
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                <BookOpen className="size-4 text-muted-foreground" />
                                Getting started
                            </CardTitle>
                            <CardDescription>
                                Coding and design rules for this project live in <code>docs/standard/</code> and are
                                loaded by AI agents through <code>AGENTS.md</code>.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-muted-foreground">
                            <p>
                                <span className="font-medium text-foreground">Products</span> (under Examples in the
                                sidebar) is the reference module: copy its folder layout —{" "}
                                <code>pages/example/products/</code>, <code>api/example/product.ts</code>,{" "}
                                <code>types/example/product.ts</code> and <code>ExampleProductController</code> — when
                                you build a real feature.
                            </p>
                            <p>
                                Replace the sidebar menu in <code>resources/js/config/menu.config.tsx</code> with your
                                own, and switch these example routes off with <code>EXAMPLE_ENABLED=false</code>.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </Container>
        </>
    );
}
