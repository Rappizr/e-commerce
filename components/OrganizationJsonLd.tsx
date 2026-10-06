/** JSON-LD schema.org/Organization + WebSite untuk homepage / seluruh site */
export default function OrganizationJsonLd() {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ALMACO FASHION",
    url: "https://almacofashion.com",
    logo: "https://almacofashion.com/logo.png",
    description:
      "Toko online busana muslimah premium. Grosir & eceran gamis, abaya, tunik, dan fashion syari berkualitas langsung dari konveksi.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Tulungagung",
      addressRegion: "Jawa Timur",
      addressCountry: "ID",
    },
    sameAs: [],
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ALMACO FASHION",
    url: "https://almacofashion.com",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://almacofashion.com/?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
    </>
  );
}
