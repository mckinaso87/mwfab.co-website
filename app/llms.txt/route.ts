import {
  PROPOSAL_LICENSES,
  PROPOSAL_STATE_LICENSE,
  formatLicenseLine,
  licensedCountySlugs,
} from "@/lib/licenses";
import { SERVICE_SLUGS } from "@/lib/services";
import { SITE_URL, SITE_NAME, PUBLIC_CONTACT_EMAIL } from "@/lib/site";

export function GET() {
  const stateLicenseLine = `- ${PROPOSAL_STATE_LICENSE.label}: ${PROPOSAL_STATE_LICENSE.number} (statewide — all 67 Florida counties)`;
  const countyLicenseLines = PROPOSAL_LICENSES.map((e) => `- ${formatLicenseLine(e)}`).join("\n");
  const serviceLinks = SERVICE_SLUGS.map((s) => `- ${SITE_URL}/services/${s}`).join("\n");
  const countyLinks = licensedCountySlugs()
    .map((slug) => `- ${SITE_URL}/service-areas/${slug}`)
    .join("\n");

  const body = `# ${SITE_NAME}

> Florida state licensed structural and ornamental steel contractor (17+ years). Licensed statewide in Florida; active operations on the East Coast and in South Florida.

${SITE_NAME} fabricates and installs structural steel, ornamental steel, and coordinated finishes for commercial and industrial projects.

## Licenses

${stateLicenseLine}
${countyLicenseLines}

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
