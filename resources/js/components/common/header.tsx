import { Toolbar, ToolbarActions, ToolbarDescription, ToolbarHeading, ToolbarPageTitle } from "@/partials/common/toolbar";
import { type ReactNode } from "react";

interface HeaderProps {
    title: string;
    description: string;
    actions?: ReactNode;
}

export default function Header({ title, description, actions }: HeaderProps) {
    return (
        <Toolbar>
            <ToolbarHeading>
                <ToolbarPageTitle text={title} />
                <ToolbarDescription>
                    {description}
                </ToolbarDescription>
            </ToolbarHeading>
            {actions && <ToolbarActions>{actions}</ToolbarActions>}
        </Toolbar>
    )
}
