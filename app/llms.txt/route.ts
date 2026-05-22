import { PROPOSAL_LICENSES, formatLicenseLine, licensedCountySlugs } from "@/lib/licenses";
import { SERVICE_SLUGS } from "@/lib/services";
import { SITE_URL, SITE_NAME, PUBLIC_CONTACT_EMAIL } from "@/lib/site";

export function GET() {
  const licenseLines = PROPOSAL_LICENSES.map((e) => `- ${formatLicenseLine(e)}`).join("\n");
  const serviceLinks = SERVICE_SLUGS.map((s) => `- ${SITE_URL}/services/${s}`).join("\n");
  const countyLinks = licensedCountySlugs()
    .map((slug) => `- ${SITE_URL}/service-areas/${slug}`)
    .join("\n");

  const body = `# ${SITE_NAME}

> Licensed structural and ornamental steel contractor on Florida's East Coast and in South Florida (17+ years).

${SITE_NAME} fabricates and installs structural steel, ornamental steel, and coordinated finishes for commercial and industrial projects in licensed counties.

## Licensed counties

${licenseLines}

## Services

${serviceLinks}

## Service areas (by county)

${countyLinks}

## Contact

- ${SITE_URL}/contact
- ${PUBLIC_CONTACT_EMAIL}

## Optional

Full FAQ: ${SITE_URL}/faq
About: ${SITE_URL}/about
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
