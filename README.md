# DIGITAL SOKO — Run Instructions

## Quick Start (no install)
- Open `dashboard.html` in your browser (Chrome, Edge, Firefox).
- Navigate using the top/side menu to `marketplace.html`, `post-item.html`, and `barter-requests.html`.

## Recommended: Run with a local web server
Running via `http://localhost` keeps a single origin so LocalStorage works consistently across pages.

- Windows PowerShell (Node installed):
  - Navigate: `cd "c:\Users\USER\Documents\PersonalProjects\DS MAIN\DS MAIN"`
  - Install dependencies: `npm install`
  - Start integrated backend: `npm start`
  - Open: `http://127.0.0.1:8000/dashboard.html`

- If Python 3 is available:
  - `python -m http.server 8000`
  - Open: `http://127.0.0.1:8000/dashboard.html`

- VS Code Live Server (optional):
  - Install the Live Server extension.
  - Open this folder in VS Code.
  - Right‑click `dashboard.html` → `Open with Live Server`.

## Pages and Flow
- `login.html`: sign in with your account (use `register.html` to create one). Token is stored in LocalStorage.
- `register.html`: create a user account and automatically sign in.
- `dashboard.html`: quick links to common actions and a recent items snapshot.
- `post-item.html`: add new items; stored in the backend and listed in both My Items and Marketplace.
- `marketplace.html`: browse items; click `Trade Now` to propose barter or full top‑up; requests go to item owners.
- `barter-requests.html`: review incoming requests for your items; accept/decline to finalize status.
- `messages.html`: select a trade to view conversation and send messages.
- `settings.html`: view your profile and update your name or password.

### Admin Test Data and External API
- Default admin: email `admin@digitalsoko.test`, password `admin123`.
- As admin, go to `marketplace.html` and click `Import External Test Products (Admin)`.
- Backend proxies `https://dummyjson.com/products` and imports a selection into the local DB for testing.
- Imported products are saved in SQLite and deduplicated via `external_source+external_id`. Regular users can trade these items.

## Data Persistence
- Backend database: SQLite (`data/db.sqlite`) holds users, items, trades, and messages.
- Auth: JWT stored in LocalStorage under `token`.
- To reset: stop the server and delete `data/db.sqlite` (this removes all data).

## Troubleshooting
- Use the integrated backend: `npm start` runs both static hosting and API server on port 8000.
- Port blocked: free port 8000 or edit `server.js` to change `port`.
- Auth errors: ensure you are logged in (check LocalStorage `token`).
- Images: uploads are stored as Data URLs; a placeholder is used if none is provided.

Admin default credentials: email admin@digitalsoko.test , password admin123

- Start: npm install , then npm start in c:\Users\USER\Documents\PersonalProjects\DS MAIN\DS MAIN
- Register or login:
- User: open http://127.0.0.1:8000/register.html or login.html
- Admin: admin@digitalsoko.test / admin123
- As admin, go to marketplace.html and click “Import External Test Products (Admin)” to populate items from DummyJSON.