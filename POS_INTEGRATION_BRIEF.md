# Brief — Integrate a QR ordering website with a coffeeshop's touchscreen cash register

## Context (existing system, already live)
A QR-menu + self-ordering web app for a café ("Tanit Lounge", Tunisia). Customers scan a table QR → order from their phone → staff see orders live on a web POS dashboard.

- **Frontend:** static HTML/CSS/vanilla JS (no framework, no build). Hosted on **Vercel** (auto-deploy from GitHub `main`).
- **Backend:** **Supabase** (Postgres + auto REST API via PostgREST + Auth + Storage). No custom server.
- **How an order is created today:** the customer's browser does an HTTP `POST` to the Supabase REST API (`/rest/v1/orders`) using the public anon key. Staff read/update orders the same way (authenticated).
- **Staff dashboard** (`pos.html`) polls orders every 5s and shows them with statuses; staff tap buttons to move an order pending → preparing → done.

### `orders` table (the key object)
```
id             uuid
table_number   text
items          jsonb     -- [{ name, price, qty }]
total          numeric
status         text      -- pending | preparing | done | cancelled
notes          text
table_verified boolean   -- true if the customer confirmed the table by scanning its QR
created_at     timestamptz
```
Other tables: `menu_items` (availability/price overrides), `category_images`, `feedback` (1–5 rating). Supabase project is reachable via its REST URL + keys.

## Goal
**Send/sync these web orders into the café's physical touchscreen cash register (caisse enregistreuse tactile)** so staff don't re-enter them manually, and so sales/totals land in the register's system.

## What must be determined first (ask the user)
The right solution depends entirely on the register. Need to know:
1. **Brand / model** of the touchscreen register (e.g. Square, Loyverse, Odoo POS, Tactill, L'Addition, SumUp, generic Android POS, generic Windows POS…).
2. **OS:** Android, Windows, or proprietary/embedded?
3. Does it expose an **API / SDK / webhook / cloud account**? (the decisive factor)
4. Is there a **network thermal printer** (ESC/POS) attached?
5. Is the register **online** (internet) and on the same local network as a possible bridge device?

## Candidate integration approaches (for the new chat to evaluate)
1. **Register has an open/cloud API (best case):** a **Supabase Edge Function** (or a small webhook) triggers on each new `orders` row and pushes it into the register via its API (create ticket/sale). Bidirectional status sync optional.
2. **No API but has a network receipt/kitchen printer:** auto-print each order as an **ESC/POS ticket** (a small local agent subscribes to Supabase Realtime and prints). Staff then ring it into the register from the ticket — semi-automated.
3. **Local bridge / middleware:** a Raspberry Pi or mini-PC next to the register runs a tiny app that listens to **Supabase Realtime** on the `orders` table and either calls the register's local API, drives the printer, or (last resort) injects keystrokes/HID into the register UI.
4. **Closed/proprietary register (worst case):** direct integration may be impossible. Fallbacks: keep running `pos.html` on a tablet beside the register; or export orders (CSV/print) for manual entry.

## Constraints / notes
- Everything currently runs **client-side + Supabase**; there is **no backend server**, so any push-to-register logic needs either a Supabase Edge Function or a small local/cloud worker.
- Orders already carry everything a ticket needs (items, qty, price, total, table, notes).
- A full system spec exists (`PROJECT_BRIEF.md`) if deeper detail is needed.

**Deliverable wanted from the new chat:** identify the register's integration capability, then propose + implement the most reliable path (API push, printer bridge, or middleware).
