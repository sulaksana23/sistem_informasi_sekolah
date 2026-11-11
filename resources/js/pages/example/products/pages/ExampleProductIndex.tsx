import { Head, Link } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Plus } from "lucide-react";
import { Container } from "@/components/common/container";
import Header from "@/components/common/header";
import { Button } from "@/components/ui/button";
import ExampleProductStats from "../components/ExampleProductStats";
import ExampleProductList from "../components/datatables/ExampleProductList";

// Entry page stays thin: Head + layout + composition, no fetching (FRONTEND-STANDARD §5).
// A real module would also gate "New product" with usePermission().hasPermission("product.create").
export default function ExampleProductIndex() {
    return (
        <>
            <Head title="Products" />
            <Container>
                <Header
                    title="Products"
                    description="Reference module that follows docs/standard — copy its structure for real features."
                    actions={
                        <Button render={<Link href={route("example.products.create")} />} nativeButton={false}>
                            <Plus />
                            New product
                        </Button>
                    }
                />
                <div className="space-y-4">
                    <ExampleProductStats />
                    <ExampleProductList />
                </div>
            </Container>
        </>
    );
}
