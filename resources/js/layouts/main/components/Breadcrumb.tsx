import { Fragment } from "react";
import { ChevronRight } from "lucide-react";
import { MENU_SIDEBAR, EXAMPLE_MENU_SIDEBAR } from "@/config/menu.config";
import { MenuItem } from "@/config/types";
import { cn } from "@/lib/utils";
import { useMenu } from "@/hooks/use-menu";
import { usePage } from "@inertiajs/react";

export function Breadcrumb() {
    const pathname = usePage().url;
    const { getBreadcrumb, isActive } = useMenu(pathname);
    // Sama pola dengan SidebarMenu.tsx — pakai menu section /example kalau
    // lagi di sana, selain itu pakai menu project sungguhan.
    const activeMenu = pathname.startsWith("/example")
        ? EXAMPLE_MENU_SIDEBAR
        : MENU_SIDEBAR;
    const items: MenuItem[] = getBreadcrumb(activeMenu);

    if (items.length === 0) {
        return null;
    }

    return (
        <div className="flex items-center gap-1.25 text-xs lg:text-sm font-medium mb-2.5 lg:mb-0">
            {items.map((item, index) => {
                const last = index === items.length - 1;
                const active = item.path ? isActive(item.path) : false;

                return (
                    <Fragment key={`root-${index}`}>
                        <span
                            className={cn(
                                active
                                    ? "text-mono"
                                    : "text-secondary-foreground",
                            )}
                            key={`item-${index}`}
                        >
                            {item.title}
                        </span>
                        {!last && (
                            <ChevronRight
                                className="size-3.5 text-muted-foreground"
                                key={`separator-${index}`}
                            />
                        )}
                    </Fragment>
                );
            })}
        </div>
    );
}
