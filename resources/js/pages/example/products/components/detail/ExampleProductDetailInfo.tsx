import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/helpers";
import { formatRp } from "@/utils/formatters/price";
import type { ExampleProduct } from "@/types/example/product";
import { ExampleProductStatusCell } from "../cells/ExampleProductStatusCell";

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-b-0">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="text-sm font-medium text-foreground">{children}</dd>
        </div>
    );
}

export default function ExampleProductDetailInfo({ product }: { product: ExampleProduct }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base font-semibold">Product information</CardTitle>
            </CardHeader>
            <CardContent>
                <dl>
                    <InfoRow label="SKU">
                        <span className="font-mono">{product.sku}</span>
                    </InfoRow>
                    <InfoRow label="Category">{product.category}</InfoRow>
                    <InfoRow label="Price">
                        <span className="tabular-nums">Rp {formatRp(product.price)}</span>
                    </InfoRow>
                    <InfoRow label="Stock">
                        <span className="tabular-nums">{product.stock.toLocaleString()}</span>
                    </InfoRow>
                    <InfoRow label="Status">
                        <ExampleProductStatusCell status={product.status} />
                    </InfoRow>
                    <InfoRow label="Last updated">{formatDateTime(product.updated_at)}</InfoRow>
                </dl>
            </CardContent>
        </Card>
    );
}
