import { Head } from "@inertiajs/react";
import { Container } from "@/components/common/container";
import Header from "@/components/common/header";
import ExampleProductForm from "../components/forms/ExampleProductForm";

interface ExampleProductCreateProps {
    categories: string[];
}

export default function ExampleProductCreate({ categories }: ExampleProductCreateProps) {
    return (
        <>
            <Head title="New product" />
            <Container>
                <Header title="New product" description="Inertia useForm posts to a FormRequest; errors come back as 422." />
                <ExampleProductForm categories={categories} />
            </Container>
        </>
    );
}
