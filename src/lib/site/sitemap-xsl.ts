import type { RequestHandler } from '@sveltejs/kit';
import type { SiteConfig } from './config';

export function generateSitemapXsl(config?: SiteConfig): string {
	const siteName = config?.name || 'Yaxa';
	const primaryColor = config?.theme?.primaryColor || '#ff3e00';

	return `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" 
  xmlns:html="http://www.w3.org/TR/REC-html40"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
      <head>
        <title>XML Sitemap · ${siteName}</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <${'style'} type="text/css">
          :root {
            --primary: ${primaryColor};
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #121212;
            color: #e4e4e7;
            margin: 0;
            padding: 32px 16px;
          }
          .container {
            max-width: 1024px;
            margin: 0 auto;
            background-color: #18181b;
            border: 1px solid #27272a;
            border-radius: 16px;
            padding: 32px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
          }
          .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid #27272a;
            padding-bottom: 24px;
            margin-bottom: 24px;
          }
          .logo-area {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .badge {
            background-color: rgba(255, 62, 0, 0.15);
            color: var(--primary);
            border: 1px solid rgba(255, 62, 0, 0.3);
            border-radius: 9999px;
            padding: 4px 12px;
            font-size: 12px;
            font-weight: 600;
          }
          h1 {
            font-size: 24px;
            font-weight: 800;
            margin: 0;
            color: #ffffff;
          }
          p {
            color: #a1a1aa;
            font-size: 14px;
            margin: 8px 0 0 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
          }
          th {
            background-color: #27272a;
            color: #d4d4d8;
            font-weight: 600;
            text-align: left;
            padding: 12px 16px;
            border-bottom: 1px solid #3f3f46;
          }
          th:first-child { border-top-left-radius: 8px; }
          th:last-child { border-top-right-radius: 8px; }
          td {
            padding: 12px 16px;
            border-bottom: 1px solid #27272a;
          }
          tr:hover td {
            background-color: #27272a;
          }
          a {
            color: var(--primary);
            text-decoration: none;
            font-weight: 500;
          }
          a:hover {
            text-decoration: underline;
          }
          .footer {
            margin-top: 24px;
            font-size: 12px;
            color: #71717a;
            text-align: center;
          }
        </${'style'}>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div>
              <div class="logo-area">
                <h1>${siteName} Sitemap</h1>
                <span class="badge"><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/> URLs</span>
              </div>
              <p>Generated dynamically by Yaxa for SvelteKit 2.7+ and search crawlers.</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 55%;">URL Location</th>
                <th style="width: 15%;">Changefreq</th>
                <th style="width: 15%;">Priority</th>
                <th style="width: 15%;">Last Modified</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="sitemap:urlset/sitemap:url">
                <tr>
                  <td>
                    <a target="_blank">
                      <xsl:attribute name="href">
                        <xsl:value-of select="sitemap:loc"/>
                      </xsl:attribute>
                      <xsl:value-of select="sitemap:loc"/>
                    </a>
                  </td>
                  <td><xsl:value-of select="sitemap:changefreq"/></td>
                  <td><xsl:value-of select="sitemap:priority"/></td>
                  <td><xsl:value-of select="sitemap:lastmod"/></td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
          <div class="footer">
            Powered by Yaxa · SvelteKit 2.7+ · Svelte 5
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>`;
}

export function createSitemapXslHandler(options?: { config?: SiteConfig }): RequestHandler {
	return async () => {
		const xsl = generateSitemapXsl(options?.config);
		return new Response(xsl, {
			headers: {
				'Content-Type': 'application/xml; charset=utf-8',
				'Cache-Control': 'public, max-age=86400, s-maxage=86400'
			}
		});
	};
}
