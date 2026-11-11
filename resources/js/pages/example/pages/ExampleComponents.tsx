import { useState } from "react";
import { Head } from "@inertiajs/react";
import { Container } from "@/components/common/container";
import Header from "@/components/common/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const BUTTON_VARIANTS = ["default", "outline", "secondary", "ghost", "destructive", "link"] as const;
// State badges use the soft "-light"/"-outline" variants (DESIGN-STANDARD §8.5); solid variants are for tiny counters only.
const BADGE_VARIANTS = ["outline", "primary-light", "success-light", "warning-light", "destructive-light", "info-light", "success-outline", "destructive-outline"] as const;

const ROWS = [
    { name: "Ada Lovelace", role: "Admin", status: "active" },
    { name: "Alan Turing", role: "Editor", status: "active" },
    { name: "Grace Hopper", role: "Viewer", status: "invited" },
];

export default function ExampleComponents() {
    const [notifications, setNotifications] = useState(true);

    return (
        <>
            <Head title="Components" />
            <Container>
                <Header
                    title="Components"
                    description="A sample of the UI kit bundled with template-react — see resources/js/components/ui for the rest, and docs/standard/DESIGN-STANDARD.md for when to use each variant."
                />

                <Tabs defaultValue="basics">
                    <TabsList>
                        <TabsTrigger value="basics">Basics</TabsTrigger>
                        <TabsTrigger value="table">Data table</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basics" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Buttons</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-wrap gap-2">
                                {BUTTON_VARIANTS.map((variant) => (
                                    <Button key={variant} variant={variant}>
                                        {variant}
                                    </Button>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Badges</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-wrap gap-2">
                                {BADGE_VARIANTS.map((variant) => (
                                    <Badge key={variant} variant={variant}>
                                        {variant}
                                    </Badge>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Form controls</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-wrap items-center gap-4">
                                <Input placeholder="you@example.com" className="max-w-64" />
                                <label className="flex items-center gap-2 text-sm">
                                    <Switch checked={notifications} onCheckedChange={setNotifications} />
                                    Notifications
                                </label>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="table">
                        <Card>
                            <CardHeader>
                                <CardTitle>Team members</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {ROWS.map((row) => (
                                            <TableRow key={row.name}>
                                                <TableCell>{row.name}</TableCell>
                                                <TableCell>{row.role}</TableCell>
                                                <TableCell>
                                                    <Badge variant={row.status === "active" ? "success-outline" : "outline"}>
                                                        {row.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </Container>
        </>
    );
}
