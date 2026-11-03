# EventDesk

An AngularJS event directory and WordPress plugin for a campus-style event publishing workflow. Independent, AI-assisted portfolio prototype; not affiliated with USM, NCS4, or Cvent.

## What it does

- Responsive event cards with search, format filters, upcoming-only filtering and date sorting.
- Explicit loading, empty and retryable error states.
- WordPress custom post type, event metadata editor and `[eventdesk]` shortcode.
- Public, read-only WordPress REST API consumption, including pagination (up to 2,000 records).
- HTTP(S)-only external registration links. No registration collection, payment processing or Cvent API integration.
- Sample-data mode that runs without WordPress. All sample events are fictional; registration links are intentionally blank.
- Eight Node unit tests and a GitHub Actions workflow that also runs PHP syntax checks.

AngularJS 1.8.3 is intentional because the target role maintains AngularJS applications. AngularJS is not modern Angular; upstream support ended in January 2022. This is a legacy-maintenance learning project, not a recommendation for a new production system.

## Quick start on a Mac

Install Python 3 if `python3 --version` does not work. In Terminal, enter the extracted project directory:

```bash
cd ~/Downloads/EventDesk
python3 -m http.server 8000 --bind 127.0.0.1
```

Open http://localhost:8000. Keep Terminal running; Control-C stops it. Do not open `index.html` with `file://`: the sample JSON is loaded over HTTP. AngularJS is vendored locally, so the sample application needs no CDN connection.

Try searching `workshop`, choose Online, select Upcoming only, and then clear filters. Current-day comparisons use your browser's local date. The fictional 2027 examples will eventually become past events. Edit `demo/events.json` to keep the demo useful.

## Use it with WordPress

You need a WordPress installation where you can install plugins (your own local or development site). A hosted account may restrict plugin installation. Do not install it on an employer's site without their approval.

1. Copy the inner `eventdesk` folder to your site's `wp-content/plugins/` directory. Alternatively upload the included `eventdesk-plugin.zip` using Plugins → Add New Plugin → Upload Plugin.
2. Activate **EventDesk**.
3. In **EventDesk Events → Add Event**, enter a title, body, short Excerpt and the Event details fields: date, location, format and an optional external registration URL.
4. Publish at least three events with different dates and formats. Leave one as a draft to check that anonymous visitors cannot see it.
5. Create a Page and add a Shortcode block containing `[eventdesk]`. Publish and open it while signed out.
6. Confirm edits in WordPress appear after reloading the directory. Change an event's format and verify its filter result.
7. Test a real registration URL that you control. An existing Cvent registration-page URL can be linked, but that does **not** demonstrate Cvent administration or API integration.

The shortcode provides a same-origin REST URL using WordPress `rest_url()`. There are no API keys in JavaScript. Private editing is handled by WordPress authentication, capabilities and REST behavior. The custom meta box uses a nonce and edit permission check. Meta sanitizers reject invalid dates/formats and restrict URLs to HTTP(S). The event day has no time or timezone; put session times and timezone in the body and registration page.

### REST shape

`GET /wp-json/wp/v2/eventdesk-events?per_page=100&page=1`

```json
{
  "id": 42,
  "title": {"rendered": "Community workshop"},
  "excerpt": {"rendered": "<p>A short description.</p>"},
  "meta": {
    "eventdesk_date": "2027-03-12",
    "eventdesk_location": "Community room",
    "eventdesk_format": "In person",
    "eventdesk_registration": "https://example.com/register"
  }
}
```

The client decodes rendered text in a detached document and binds it as text. It never uses `ng-bind-html` or compiles WordPress content as Angular templates. Invalid or executable registration URLs are suppressed.

## How the code fits together

```text
WordPress editor -> eventdesk_event posts + validated metadata
WordPress REST API -> AngularJS $http service
normalize response -> filter/sort -> event cards -> external registration page
```

- `eventdesk/eventdesk.php`: registers event type, metadata, editor fields and shortcode; enqueues assets.
- `eventdesk/view.php`: WordPress view; same directory markup as the standalone demo.
- `eventdesk/assets/app.js`: AngularJS controller, $http pagination, lifecycle/error state and text decoding.
- `eventdesk/assets/core.js`: framework-independent normalization, date validation, URL validation and filtering.
- `eventdesk/assets/style.css`: scoped responsive styles, visible keyboard focus and mobile layout.
- `index.html` and `demo/events.json`: standalone demo only, not a WordPress installation.
- `tests/core.test.js`: meaningful boundary and filtering tests.

## Tests

Install Node.js 22 or later, then:

```bash
npm test
```

No npm dependencies are required for the unit tests. PHP lint requires PHP locally:

```bash
php -l eventdesk/eventdesk.php
php -l eventdesk/view.php
```

The Actions workflow runs both after you push. Read `VERIFICATION.md` for exactly what was checked in the delivery environment. A passing syntax check does not prove WordPress integration works.

### Manual acceptance checks

- Search/filter combinations and no-result message.
- Upcoming-only excludes past and undated events; same-day events remain.
- Cards remain within the screen at 375px width.
- Every input has a label and every link/button can be reached with Tab.
- Disconnect or block the event request: an error and working retry button appear.
- WordPress drafts remain hidden; published edits appear on reload.
- Missing registration links do not produce dead buttons.
- Enter invalid dates and `javascript:` URLs: do not expose unsafe links.

## Push to GitHub

Create a new **empty** repository named `EventDesk` under your GitHub account. Do not initialize a README there. From this project's root:

```bash
git init
git add .
git commit -m "Add EventDesk AngularJS and WordPress prototype"
git branch -M main
git remote add origin https://github.com/kavyapokharel/EventDesk.git
git push -u origin main
```

GitHub may ask you to authenticate with GitHub CLI, a credential manager or a token; an account password cannot authenticate Git pushes. Never put a token inside your remote URL or commit it. If `origin` already exists, inspect `git remote -v` before changing it.

Suggested repository description:
> Campus-style event directory built with AngularJS and a WordPress custom plugin, featuring search, format filters, REST API integration, and automated tests.

### Optional static demo

If GitHub Pages is available for your repository, choose Settings → Pages → Deploy from a branch → `main` → `/ (root)`. This serves the **sample-data frontend only**; GitHub Pages does not run PHP or WordPress. Expected URL after deployment: `https://kavyapokharel.github.io/EventDesk/`. This project has not been pushed or deployed for you.

## Explain it in an interview

“The prototype separates event editing from the directory UI. WordPress owns published content and permissions; AngularJS reads public events over REST. I separated data normalization and filtering into plain JavaScript so I can test edge cases without a browser. Registration links send visitors to an external provider, so this project doesn't handle attendee records or payments.”

Be ready to explain `$http`, controller-as syntax, `ng-model`, `ng-repeat`, `ng-if`, dependency injection, shortcode registration, post metadata, nonces and permission checks. Do not claim independent authorship of generated code: read, run, modify and test the project, and explain your own changes.

Useful personal extensions: add a real event in WordPress, improve the keyboard experience, add an event detail page, write browser regression tests, or add server-side filtering when the event collection grows. Record these changes in commits and a screenshot before adding completed-project claims to your resume.

## Boundaries and tradeoffs

- No live WordPress integration, paid registration, email reminders, attendee database or employer website maintenance is claimed.
- Loading all events is simple for a small directory but capped at 2,000; larger sites should filter and paginate on the server.
- No WordPress instance is included in the ZIP. Existing WordPress themes/plugins and AngularJS apps may require compatibility work.
- Only one EventDesk directory is supported per page.
- No timezone-aware scheduling, capacity tracking or recurring-event model.
- Responsive CSS and basic semantics are included; this is not an accessibility certification or production security audit.
- Uninstalling the plugin leaves event content in WordPress to avoid deleting your data.

## References

- https://developer.wordpress.org/rest-api/
- https://developer.wordpress.org/rest-api/using-the-rest-api/pagination/
- https://developer.wordpress.org/reference/functions/register_post_type/
- https://developer.wordpress.org/reference/functions/register_post_meta/
- https://angularjs.org/

AngularJS is MIT-licensed. Its license is preserved in `eventdesk/assets/ANGULAR-LICENSE.txt`.
