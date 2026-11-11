import { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";
import { ExternalLink, LogOut } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageProps } from "@/types/common/page-props";

function getInitials(name: string): string {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase();
}

// SSO-specific actions are shown only when both a user and SSO URL are present.
// A local Laravel account still uses its real user details and the normal logout route.
export function UserDropdownMenu() {
    const { auth, sso_url } = usePage<PageProps>().props;
    const isSsoUser = Boolean(auth.user && sso_url);

    const [logoutOpen, setLogoutOpen] = useState(false);
    const [logoutAppSsoOpen, setLogoutAppSsoOpen] = useState(false);
    const [logoutAppOnlyOpen, setLogoutAppOnlyOpen] = useState(false);

    const userName = auth.user?.name ?? "Guest";
    const userEmail = auth.user?.email ?? "";
    const initials = getInitials(userName);

    const handleLogout = () => {
        router.post(route("logout"));
    };

    const handleLogoutAppSso = () => {
        router.post(route("sso.logout-force"));
    };

    const handleLogoutAppOnly = () => {
        router.post(route("sso.logout"));
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="outline-none cursor-pointer">
                        <Avatar
                            size="default"
                            className="ring-2 ring-green-500 ring-offset-2 ring-offset-background bg-muted"
                        >
                            <AvatarFallback className="bg-muted text-muted-foreground font-semibold text-sm">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                    </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-64" side="bottom" align="end">
                    <div className="flex items-center gap-3 p-3">
                        <Avatar
                            size="lg"
                            className="shrink-0 bg-muted"
                        >
                            <AvatarFallback className="bg-muted text-muted-foreground font-bold">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-semibold text-mono truncate">
                                {userName}
                            </span>
                            <span className="text-xs text-muted-foreground truncate">
                                {userEmail}
                            </span>
                        </div>
                    </div>

                    <DropdownMenuSeparator />

                    {isSsoUser ? (
                        <>
                            <DropdownMenuItem className="cursor-pointer" asChild>
                                <a
                                    href={sso_url ?? "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2"
                                >
                                    <span className="grow">Application List</span>
                                    <ExternalLink />
                                </a>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                                onSelect={() => {
                                    setTimeout(() => setLogoutAppSsoOpen(true), 100);
                                }}
                                className="flex justify-between items-center gap-2 cursor-pointer"
                            >
                                <span>Logout App &amp; SSO</span>
                                <LogOut className="size-4" />
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onSelect={() => {
                                    setTimeout(() => setLogoutAppOnlyOpen(true), 100);
                                }}
                                className="flex justify-between items-center gap-2 cursor-pointer"
                            >
                                <span>Logout App</span>
                                <LogOut className="size-4" />
                            </DropdownMenuItem>
                        </>
                    ) : (
                        <DropdownMenuItem
                            onSelect={() => {
                                setTimeout(() => setLogoutOpen(true), 100);
                            }}
                            className="flex justify-between items-center gap-2 cursor-pointer"
                        >
                            <span>Log out</span>
                            <LogOut className="size-4" />
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog
                open={logoutOpen}
                onOpenChange={setLogoutOpen}
            >
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Log out?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You will be signed out of this application.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            onClick={handleLogout}
                            className="cursor-pointer"
                        >
                            Yes, Logout
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
                open={logoutAppSsoOpen}
                onOpenChange={setLogoutAppSsoOpen}
            >
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Logout App &amp; SSO?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You will be signed out of this application and your
                            SSO session will be terminated. You will need to log
                            in again to access all applications.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            onClick={handleLogoutAppSso}
                            className="cursor-pointer"
                        >
                            Yes, Logout
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
                open={logoutAppOnlyOpen}
                onOpenChange={setLogoutAppOnlyOpen}
            >
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Logout from App?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You will be signed out of this application only.
                            Your SSO session will remain active in other
                            applications.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            onClick={handleLogoutAppOnly}
                            className="cursor-pointer"
                        >
                            Yes, Logout
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
