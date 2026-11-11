import { useEffect, useState } from "react";

import { UserDropdownMenu } from "@/partials/topbar/user-dropdown-menu";
import {
    Menu,
    Moon,
    Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toAbsoluteUrl } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { LAYOUT_DESKTOP_BREAKPOINT, useIsMobile } from "@/hooks/use-mobile";
import { useScrollPosition } from "@/hooks/use-scroll-position";
import { Button, buttonVariants } from "@/components/ui/button";
import {
    Sheet,
    SheetBody,
    SheetContent,
    SheetHeader,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Container } from "@/components/common/container";
import { Breadcrumb } from "./Breadcrumb";
import { SidebarMenu } from "./SidebarMenu";
import { Link, usePage } from "@inertiajs/react";

export function Header() {
    const [isSidebarSheetOpen, setIsSidebarSheetOpen] = useState(false);
    const { theme, setTheme } = useTheme();

    const pathname = usePage().url;
    const mobileMode = useIsMobile(LAYOUT_DESKTOP_BREAKPOINT);

    const scrollPosition = useScrollPosition();
    const headerSticky: boolean = scrollPosition > 0;

    // Close sheet when route changes
    useEffect(() => {
        setIsSidebarSheetOpen(false);
    }, [pathname]);

    return (
        <header
            className={cn(
                "header fixed top-0 z-10 start-0 flex items-stretch shrink-0 border-b border-transparent bg-background end-0 pe-[var(--removed-body-scroll-bar-size,0px)]",
                headerSticky && "border-b border-border",
            )}
        >
            <Container className="flex justify-between items-stretch lg:gap-4">
                {/* HeaderLogo */}
                <div className="flex gap-1 lg:hidden items-center gap-2.5">
                    <Link href="/" className="shrink-0">
                        <img
                            src={toAbsoluteUrl("/media/app/logo.svg")}
                            className="h-[25px] w-full"
                            alt="mini-logo"
                        />
                    </Link>
                    <div className="flex items-center">
                        {mobileMode && (
                            <Sheet
                                open={isSidebarSheetOpen}
                                onOpenChange={setIsSidebarSheetOpen}
                            >
                                <SheetTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}>
                                    <Menu className="text-muted-foreground/70" />
                                </SheetTrigger>
                                <SheetContent
                                    className="p-0 gap-0 w-[275px]"
                                    side="left"
                                    close={false}
                                >
                                    <SheetHeader className="p-0 space-y-0" />
                                    <SheetBody className="p-0 overflow-y-auto">
                                        <SidebarMenu />
                                    </SheetBody>
                                </SheetContent>
                            </Sheet>
                        )}
                    </div>
                </div>

                {/* Main Content (MegaMenu or Breadcrumbs) */}
                <Breadcrumb />

                {/* HeaderTopbar */}
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-9 hover:bg-primary/10 hover:[&_svg]:text-primary rounded-full cursor-pointer"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    >
                        {theme === "dark" ? (
                            <Sun className="size-4.5!" />
                        ) : (
                            <Moon className="size-4.5!" />
                        )}
                    </Button>
                    <UserDropdownMenu />
                </div>
            </Container>
        </header>
    );
}
