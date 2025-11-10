import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function Breadcrumbs({ items }) {
  const baseUrl = 'https://alexgaoth.github.io/UCSD_Crimes';

  // Always include Home as first item
  const breadcrumbItems = [
    { name: 'Home', path: '/' },
    ...items
  ];
  

  // Generate JSON-LD structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `${baseUrl}${item.path}`
    }))
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <nav aria-label="Breadcrumb" className="breadcrumbs">
        <ol className="breadcrumb-list">
          {breadcrumbItems.map((item, index) => (
            <li key={item.path} className="breadcrumb-item">
              {index === breadcrumbItems.length - 1 ? (
                <span aria-current="page">{item.name}</span>
              ) : (
                <>
                  <Link to={item.path}>{item.name}</Link>
                  <span className="breadcrumb-separator" aria-hidden="true"> / </span>
                </>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
