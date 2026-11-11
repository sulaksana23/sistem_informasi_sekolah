"use client";

import { ReactNode, useState } from "react";
import {
    QueryCache,
    QueryClient,
    QueryClientProvider,
} from "@tanstack/react-query";
import { showToast } from "@/components/common/alert";

const QueryProvider = ({ children }: { children: ReactNode }) => {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                queryCache: new QueryCache({
                    onError: (error) => {
                        const message =
                            error.message ||
                            "Something went wrong. Please try again.";

                        showToast("destructive", message);
                    },
                }),
            }),
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};

export { QueryProvider };
