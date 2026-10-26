# Nexo

Nexo is a personalized version of AFFiNE for notes, whiteboards and connected knowledge.
The scope preserves the local editor, data formats, technical identifiers and existing
browser data while changing the visible identity and disabling upstream cloud features.

The identity uses purple (#7C3AED), black (#0C0C0F), white and a folded N symbol
with a lilac diagonal ribbon (#A78BFA). The wordmark is authored SVG lettering.
The default theme is dark, stored under the Nexo-specific `nexo-theme` key;
users can still choose the light theme in appearance settings.
Existing application typography and interaction patterns remain in place. New browser
profiles start in Brazilian Portuguese; saved language preferences remain respected.

The local web application runs with Node 22.23.4 and Yarn 4.18.0. Creating and editing
notes, reloading persisted notes, switching to the edgeless whiteboard, and loading
light and dark themes have been checked in an isolated browser profile.

At the user's request, Nexo runs locally without accounts, cloud synchronization,
online sharing, collaboration or subscription controls. Startup does not request cloud
server configuration or authentication sessions, and telemetry transport is disabled.
Upstream AI preferences cannot re-enable cloud AI. An optional local assistant now
uses the user's API key with Claude's native Anthropic API or an OpenAI-compatible endpoint, without AFFiNE login
or billing. Its chat follows the upstream empty-state composition and uses the
original rich text renderer. It provides selected note/page/file context, writing
actions, provider web search with citations, in-memory history, confirmed creation
and editing of pages with Markdown blocks, and isolated HTML app/presentation previews.
Keys stay in memory unless the user opts
into tab session storage. See docs/local-ai.md for scope and limitations.
Existing notes are preserved.
Browser import/export and whiteboards remain available; local browser storage is not
an automatic external backup. This customization does not create a desktop distribution.

The local interface omits upstream website, community, legal-service, release and
download promotions from About, help, templates and loading errors. New workspaces
include Portuguese Nexo guides focused on local notes, whiteboards and backups.
Existing documents are not rewritten. Backup file extensions remain compatible.

Legacy account, OAuth, invitation, subscription, onboarding and desktop-opening URLs
redirect to the local workspace before their service modules initialize. Old cloud
startup parameters cannot stall local navigation or create cloud workspaces.
Import dialogs, error recovery, experimental settings, media metadata and editor
previews use the local identity and omit upstream promotions. Other language catalogs
follow the existing Nexo labels; original provider attribution in disabled service
flows is retained. Original public marketing screenshots and unused app icons are removed.

PDF export and Typst previews load Inter and Sarasa fonts from bundled assets instead
of the upstream CDN. Their licenses accompany the files in core/public/fonts.
Image import and canvas export do not use the upstream image proxy; remote images
remain subject to the source website's browser CORS permissions.
Internal package names, editor schemas, URI compatibility and persisted storage keys
remain unchanged so existing documents and backups stay readable.

Keep original licenses, attribution and service destinations accurate. See
docs/brand/nexo-spec.json for implementation scope and validation, and docs/BUILDING.md
for local startup instructions. This work has not been deployed publicly.
