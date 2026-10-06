import type { ProductMapped } from "../lib/product-mapper";

interface Props {
  product: ProductMapped;
  url: string;
}

/** JSON-LD schema.org/Product untuk rich results Google */
export default function ProductJsonLd({ product, url }: Props) {
  const price = product.is_grosir
    ? product.harga_grosir ?? product.rawPrice
    : product.rawPrice;

  const availability =
    product.stok > 0
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.desc,
    image: product.images,
    sku: product.id,
    brand: {
      "@type": "Brand",
      name: "ALMACO FASHION",
    },
    category: product.category,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "IDR",
      price: String(price),
      availability,
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: "ALMACO FASHION",
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
