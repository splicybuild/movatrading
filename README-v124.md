# MOVA Trading v124 — Mobile Welcome / Account Landing

Built from the stable v123 platform-comparison version.

## Mobile-only startup change
When MOVA is opened on a phone and there is no active prototype session, the first screen is now the MOVA welcome / Sign In / Create Account experience.

The mobile screen includes:
- the MOVA icon above the authentication controls;
- Sign In and Create Account tabs;
- a clear message that visitors can still explore MOVA as a guest;
- the existing five-button navigation tray locked at the bottom.

Tapping Home, Pulse, Tools, Portfolio or News immediately leaves the welcome screen and opens that section. Registration is **not required to explore** the current prototype.

## Desktop
Desktop startup remains unchanged and continues to open the normal Home experience.

## Signed-in behaviour
If a prototype session already exists on that device, mobile opens normally rather than showing the welcome page again.

Signing out on mobile returns to the welcome screen.

## Important security note
This remains a frontend prototype. It is not production authentication.

Before public account creation or paid subscriptions are enabled, MOVA should use:
- server-side authentication;
- secure password hashing/identity provider;
- email verification and password reset;
- protected sessions;
- persistent database profiles;
- subscription billing/entitlement checks;
- server-side access control for premium features.

No real password-security claims are made by this prototype.

## Deployment
Only `index.html` changed from v123.
The complete package is included for download convenience.
