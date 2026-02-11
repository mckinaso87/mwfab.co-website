# Contact Form & Anti-Spam

## Current (Phase 1)

- **Validation**: Client and server validation via zod in `/app/api/contact/route.ts`.
- **Honeypot**: A hidden `website` field is included in the form. If it is filled (e.g. by a bot), the submission is rejected with 400.
- **Resend**: API route is scaffolded. When `RESEND_API_KEY` and `RESEND_FROM_EMAIL` are set, uncomment the Resend send logic in the route to enable email delivery.

## Future Options

- **Rate limiting**: Limit submissions per IP (e.g. in-memory or Redis) to reduce abuse.
- **Turnstile / hCaptcha**: Add a challenge for high-risk or high-volume scenarios.
