# Contact Form & Anti-Spam

## Current

- **Validation**: Client and server validation via zod in `/app/api/contact/route.ts`.
- **Honeypot**: A hidden `website` field is included in the form. If it is filled (e.g. by a bot), the submission is rejected with 400.
- **Customers**: Each valid submission upserts a row in `public.customers` (match by email when present) so leads appear under `/admin/customers`.
- **Resend**: When `RESEND_API_KEY` and `RESEND_FROM_EMAIL` are set, sends branded HTML to `CONTACT_TO_EMAIL` (default `sales@mwfab.co`) with reply-to set to the submitter.

## Future Options

- **Rate limiting**: Limit submissions per IP (e.g. in-memory or Redis) to reduce abuse.
- **Turnstile / hCaptcha**: Add a challenge for high-risk or high-volume scenarios.
