import { Head } from "@inertiajs/react";
import { useTheme } from "next-themes";
import { Container } from "@/components/common/container";
import Header from "@/components/common/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ExampleSettings() {
    const { theme, setTheme } = useTheme();

    return (
        <>
            <Head title="Settings" />
            <Container>
                <Header title="Settings" description="Application preferences." />

                <Card className="max-w-lg">
                    <CardHeader>
                        <CardTitle>Appearance</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium">Theme</div>
                            <div className="text-sm text-muted-foreground">Current: {theme}</div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant={theme === "light" ? "default" : "outline"}
                                onClick={() => setTheme("light")}
                            >
                                Light
                            </Button>
                            <Button
                                size="sm"
                                variant={theme === "dark" ? "default" : "outline"}
                                onClick={() => setTheme("dark")}
                            >
                                Dark
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </Container>
        </>
    );
}
