import { Head, Link } from "@inertiajs/react";
import { route } from "ziggy-js";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/common/container";
import Header from "@/components/common/header";
import { Button } from "@/components/ui/button";
import type { ExampleProduct } from "@/types/example/product";
import ExampleProductDetailInfo from "../components/detail/ExampleProductDetailInfo";

interface ExampleProductDetailProps {
    product: ExampleProduct;
}

export default function ExampleProductDetail({ product }: ExampleProductDetailProps) {
    return (
        <>
            <Head title={product.name} />
            <Container>
                <Header
                    title={product.name}
                    description={`${product.sku} · ${product.category}`}
                    actions={
                        <Button variant="outline" render={<Link href={route("example.products.index")} />} nativeButton={false}>
                            <ArrowLeft />
                            Back to products
                        </Button>
                    }
                />
                <div className="max-w-2xl">
                    <ExampleProductDetailInfo product={product} />
                </div>
            </Container>
        </>
    );
}
