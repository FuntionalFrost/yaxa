import type { RequestEvent, RequestHandler } from '@sveltejs/kit';
import type { ApiDocsOptions, ApiDocsTheme } from './types';
import { generateOpenApiSpec } from './generator';

interface DocMeta {
	title: string;
	description?: string;
	canonicalUrl?: string;
	ogImage?: string;
}

function renderHeadMeta({ title, description, canonicalUrl, ogImage }: DocMeta): string {
	const descTag = description
		? `<meta name="description" content="${description.replace(/"/g, '&quot;')}" />`
		: '';
	const canonicalTag = canonicalUrl ? `<link rel="canonical" href="${canonicalUrl}" />` : '';
	const ogImageTag = ogImage ? `<meta property="og:image" content="${ogImage}" />` : '';
	const ogDescTag = description
		? `<meta property="og:description" content="${description.replace(/"/g, '&quot;')}" />`
		: '';
	const ogUrlTag = canonicalUrl ? `<meta property="og:url" content="${canonicalUrl}" />` : '';

	return `    <title>${title}</title>
    ${descTag}
    <meta name="robots" content="index, follow" />
    ${canonicalTag}
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${title.replace(/"/g, '&quot;')}" />
    ${ogDescTag}
    ${ogUrlTag}
    ${ogImageTag}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title.replace(/"/g, '&quot;')}" />
    ${ogDescTag}
    ${ogImageTag}`.trim();
}

function renderScalarHtml(specJson: string, meta: DocMeta): string {
	return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    ${renderHeadMeta(meta)}
    <style>
      body { margin: 0; background-color: #0f172a; }
    </style>
  </head>
  <body>
    <script id="api-reference" data-configuration='{"darkMode":true,"layout":"modern"}' type="application/json">
      ${specJson}
    </script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>`;
}

function renderSwaggerHtml(specJson: string, meta: DocMeta): string {
	return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    ${renderHeadMeta(meta)}
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    <style>
      body { margin: 0; background: #fafafa; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        spec: ${specJson},
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout"
      });
    </script>
  </body>
</html>`;
}

function renderRedocHtml(specJson: string, meta: DocMeta): string {
	return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    ${renderHeadMeta(meta)}
    <style>
      body { margin: 0; padding: 0; }
    </style>
  </head>
  <body>
    <div id="redoc-container"></div>
    <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
    <script>
      Redoc.init(${specJson}, {
        scrollYOffset: 50,
        theme: {
          colors: { primary: { main: '#3b82f6' } }
        }
      }, document.getElementById('redoc-container'));
    </script>
  </body>
</html>`;
}

/**
 * Creates a turnkey SvelteKit RequestHandler that generates an interactive OpenAPI 3.1 documentation
 * page (Scalar, Swagger UI, or Redoc) or returns raw OpenAPI 3.1 JSON when ?format=json is requested.
 */
export function createApiDocsHandler(options: ApiDocsOptions = {}): RequestHandler {
	const defaultTheme = options.theme || 'scalar';

	return async (event: RequestEvent) => {
		const { url, request } = event;
		const format = url.searchParams.get('format');
		const themeQuery = url.searchParams.get('theme') as ApiDocsTheme | null;
		const activeTheme: ApiDocsTheme =
			themeQuery && ['scalar', 'swagger', 'redoc'].includes(themeQuery) ? themeQuery : defaultTheme;
		const acceptHeader = request.headers.get('accept') || '';

		const spec = generateOpenApiSpec(options);

		// If caller requests JSON via query param, accept header, or path ending in .json
		if (
			format === 'json' ||
			acceptHeader.includes('application/json') ||
			url.pathname.endsWith('/openapi.json')
		) {
			return Response.json(spec, {
				headers: {
					'content-type': 'application/json; charset=utf-8',
					'cache-control': 'public, max-age=60'
				}
			});
		}

		// Render Interactive HTML Docs
		const specJson = JSON.stringify(spec);
		const canonicalUrl = `${url.origin}${url.pathname}`;
		const ogImage = `${url.origin}/api/og?title=${encodeURIComponent(spec.info.title)}&badge=API+Docs`;
		const meta: DocMeta = {
			title: spec.info.title,
			description: spec.info.description,
			canonicalUrl,
			ogImage
		};

		let html: string;

		if (activeTheme === 'swagger') {
			html = renderSwaggerHtml(specJson, meta);
		} else if (activeTheme === 'redoc') {
			html = renderRedocHtml(specJson, meta);
		} else {
			html = renderScalarHtml(specJson, meta);
		}

		return new Response(html, {
			headers: {
				'content-type': 'text/html; charset=utf-8',
				'cache-control': 'public, max-age=300'
			}
		});
	};
}
