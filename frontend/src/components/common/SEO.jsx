import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({ title, description, url, isArticle, structuredData }) {
  const siteName = 'Studio Floor';
  const defaultTitle = `${siteName} - Where You Record Studio Quality Sound & Broadcasts`;
  const defaultDescription = 'Book 4K broadcast presentation suites & podcast studios with real-time slot scheduling, sound engineering, teleprompters, and instant digital session pass.';
  const defaultUrl = 'https://studiofloor.com';
  const defaultImage = `${defaultUrl}/favicon.png`;

  const seo = {
    title: title ? `${title} | ${siteName}` : defaultTitle,
    description: description || defaultDescription,
    image: defaultImage,
    url: url ? `${defaultUrl}${url}` : defaultUrl,
  };

  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Studio Floor",
    "image": seo.image,
    "@id": defaultUrl,
    "url": defaultUrl,
    "telephone": "+1800555STUDIO",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "100 Media Boulevard, Suite 400",
      "addressLocality": "San Francisco",
      "addressRegion": "CA",
      "postalCode": "94105",
      "addressCountry": "US"
    },
    "description": seo.description,
  };

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={isArticle ? 'article' : 'website'} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={seo.url} />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData || defaultStructuredData)}
      </script>
    </Helmet>
  );
}
