# Security Policy

The Yaxa team takes the security of our component primitives, server utilities, database adapters, and authentication integrations seriously. We appreciate your efforts to responsibly disclose vulnerabilities to us.

---

## Supported Versions

Security updates and patches are actively applied to the following releases:

| Version | Supported          |
| ------- | ------------------ |
| `0.x.x` | :white_check_mark: |

---

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

If you believe you have discovered a vulnerability in Yaxa—particularly involving:

- Authentication & session handling (`yaxa-svelte/auth`, Better-Auth integrations)
- Webhook signature verification & HMAC parsing (`yaxa-svelte/polar`)
- Database query generation & schema security (`yaxa-svelte/db`)
- Server hooks and request context isolation (`yaxa-svelte/server`)

Please report it privately to our security team:

✉️ **Email:** [devfrost@protonmail.com](mailto:devfrost@protonmail.com)

### What to Include in Your Report

To help us triage and resolve the issue quickly, please provide:

1. **Description**: A clear summary of the potential vulnerability and its impact.
2. **Component / Subpath**: The affected module (e.g. `yaxa-svelte/polar`, `yaxa-svelte/auth`).
3. **Reproduction Steps**: A minimal proof of concept (PoC), code snippet, or steps to reproduce.
4. **Environment**: Svelte / SvelteKit version, Node.js runtime, and operating system.
5. **Mitigation**: Any potential fix or workaround you have identified (if applicable).

---

## Response Timeline & Disclosure Process

- **Acknowledgment**: We aim to acknowledge your initial report within **48 hours**.
- **Investigation**: We will investigate and confirm the vulnerability, keeping you informed of our progress.
- **Remediation**: Once verified, we will develop, test, and release a patched version.
- **Credit**: We are happy to publicly acknowledge and credit your contribution in release notes (unless you prefer to remain anonymous).

Thank you for helping keep Yaxa and its community safe!
