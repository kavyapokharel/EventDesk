# EventDesk

EventDesk is an event directory built with AngularJS and a custom WordPress plugin. It separates event publishing from the visitor interface: editors manage events in WordPress, while visitors search and filter events through a responsive directory.

## Features

- Keyword search across event titles, descriptions, and locations.
- Filters for in-person, online, and hybrid events.
- Upcoming-only filtering and chronological sorting.
- Responsive event cards with external registration links.
- Loading indicators, empty states, and retryable errors.
- WordPress event editor and `[eventdesk]` shortcode.
- Standalone demonstration using fictional event data.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | AngularJS 1.8.3, JavaScript, HTML, CSS |
| Content management | WordPress |
| Plugin | PHP |
| Data integration | WordPress REST API |
| Unit tests | Node.js built-in test runner |
| CI configuration | GitHub Actions |

## How It Works

1. An editor creates an event in WordPress.
2. WordPress stores the event and its metadata.
3. The AngularJS application retrieves published events through the REST API.
4. The application normalizes the response and displays searchable event cards.
5. Visitors follow external links to register with the event provider.

The directory reads public event information. It does not collect registrations, process payments, or store attendee information.

## WordPress Integration

The plugin registers an `eventdesk_event` custom post type with these fields:

- Event title and description
- Short excerpt
- Event date
- Location
- Format
- External registration URL

Published events are available through:

```text
GET /wp-json/wp/v2/eventdesk-events
```

Adding the following shortcode to a WordPress page displays the directory:

```text
[eventdesk]
```

The plugin validates event metadata and checks editing permissions. The frontend displays retrieved content as text and restricts registration links to HTTP and HTTPS URLs.

## Project Structure

```text
EventDesk/
├── index.html                 # Standalone demo
├── demo/
│   └── events.json            # Fictional sample events
├── eventdesk/
│   ├── eventdesk.php          # WordPress plugin
│   ├── view.php               # Directory template
│   └── assets/
│       ├── angular.min.js     # AngularJS runtime
│       ├── app.js             # Controller and REST requests
│       ├── core.js            # Validation, filtering, and sorting
│       └── style.css          # Responsive styles
├── tests/
│   └── core.test.js           # JavaScript unit tests
├── .github/workflows/
│   └── test.yml               # Automated checks
└── package.json
```

## Running the Standalone Demo

From the project directory, run:

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

Open:

```text
http://localhost:8000
```

The demo uses fictional events from `demo/events.json` and does not require WordPress.

## Installing the WordPress Plugin

1. Copy the `eventdesk` folder into `wp-content/plugins/`, or upload `eventdesk-plugin.zip` through WordPress.
2. Activate **EventDesk**.
3. Create and publish events under **EventDesk Events**.
4. Add a Shortcode block containing `[eventdesk]` to a page.
5. Publish the page to display the directory.

## Testing

Run the JavaScript unit tests:

```bash
npm test
```

Tests cover date validation, search and filtering, sorting, missing metadata, and registration URL validation.

## Project Status

EventDesk is a portfolio prototype. JavaScript unit tests and static-file serving checks have passed. Browser rendering and integration within a running WordPress installation remain unverified.

AngularJS is used to demonstrate development with a legacy framework; its upstream support has ended.

## Limitations

- Registration is handled by external websites.
- No Cvent API integration is implemented.
- Event dates have day-level precision.
- The directory loads a maximum of 2,000 events.
- One directory instance is supported per page.

EventDesk is an independent project and is not affiliated with USM, NCS4, or Cvent.
