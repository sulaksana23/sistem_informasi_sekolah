import { ChevronFirst } from "lucide-react";
import { toAbsoluteUrl } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { useSettings } from "@/providers/settings-provider";
import { Button } from "@/components/ui/button";
import { Link } from "@inertiajs/react";

export function SidebarHeader() {
    const { settings, storeOption } = useSettings();
    const appName = import.meta.env.VITE_APP_NAME || "Laravel";
    const appSubName = import.meta.env.VITE_APP_SUB_NAME || "Laravel Sub Name";

    const handleToggleClick = () => {
        storeOption(
            "layouts.demo1.sidebarCollapse",
            !settings.layouts.demo1.sidebarCollapse,
        );
    };

    const logoUrl = toAbsoluteUrl("/media/app/logo.svg");

    return (
        <div className="sidebar-header hidden lg:flex items-center relative justify-between px-3 lg:px-6 shrink-0">
            <Link href="/">
                <div className="default-logo">
                    <div className="flex items-center justify-between gap-2.5 h-[70px]">
                        <img src={logoUrl} className="h-[34px]" alt="" />
                        <div className="flex flex-col items-start">
                            <div className="text-mono font-semibold text-xl -mb-0.5">
                                {appName}
                            </div>
                            <div className="text-secondary-foreground text-xs font-normal">
                                {appSubName}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="small-logo">
                    <div className="flex items-center justify-between gap-2.5 h-[70px]">
                        <img src={logoUrl} className="h-[34px]" alt="" />
                    </div>
                </div>
            </Link>
            <Button
                onClick={handleToggleClick}
                size="icon-sm"
                variant="outline"
                className={cn(
                    "size-7 absolute start-full top-2/4 rtl:translate-x-2/4 -translate-x-2/4 -translate-y-2/4",
                    settings.layouts.demo1.sidebarCollapse
                        ? "ltr:rotate-180"
                        : "rtl:rotate-180",
                )}
            >
                <ChevronFirst className="size-4!" />
            </Button>
        </div>
    );
}
