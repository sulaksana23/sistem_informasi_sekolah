import React from "react";
import { toast } from "sonner";
import {
    RiCheckboxCircleFill,
    RiErrorWarningFill,
    RiNotificationFill,
    RiSpam3Fill,
    RiSpamFill,
    RiCloseLine,
} from "@remixicon/react";

import {
    Alert,
    AlertDescription,
    AlertAction,
} from "../ui/alert";

export type ToastVariant =
    | "default"
    | "destructive"
    | "success"
    | "info"
    | "warning";

interface ToastAlertProps {
    variant: ToastVariant;
    message: string;
    onClose?: () => void;
}

const VariantIcon: Record<ToastVariant, React.ReactNode> = {
    default: <RiNotificationFill />,
    destructive: <RiErrorWarningFill className="text-destructive" />,
    success: <RiCheckboxCircleFill className="text-success" />,
    info: <RiSpamFill className="text-info" />,
    warning: <RiSpam3Fill className="text-warning" />,
};

export const ToastAlert: React.FC<ToastAlertProps> = ({
    variant,
    message,
    onClose,
}) => {
    return (
        <Alert variant={"invert"}>
            {/* ICON */}
            {VariantIcon[variant]}

            {/* CONTENT */}
            <AlertDescription>{message}</AlertDescription>

            {/* CLOSE BUTTON */}
            {onClose && (
                <AlertAction>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground transition"
                    >
                        <RiCloseLine className="size-4" />
                    </button>
                </AlertAction>
            )}
        </Alert>
    );
};

export const showToast = (
    variant: ToastVariant,
    message: string
) => {
    toast.custom(
        (t) => (
            <ToastAlert
                variant={variant}
                message={message}
                onClose={() => toast.dismiss(t)}
            />
        ),
        {
            position: "bottom-right",
        }
    );
};
