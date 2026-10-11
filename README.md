# Fish N Tingz Staff Portal

Independent Vite/React application connected to the root project's production Convex backend. This folder is a separate Git repository inside the local Fish N Tingz workspace.

Run `npm ci`, copy `.env.example` to `.env.production`, and run `npm run build`. `npm run dev` serves port 5183. Deploy only `dist/`; the source build has no dependency on the parent folder. API authorization is enforced in Convex.

Production: https://reimage-demo.github.io/fish-n-tingz-admin/
Public website: https://reimage-demo.github.io/fish-n-tingz/

The administrator can edit menu prices, descriptions, publication and availability, manage events, update opening hours/contact details, and supply the Appispot booking link. Toast manages orders and payment. The one-time access file is stored in the parent project's ignored `.local/` folder and is never committed.

The Reservations view receives native table requests from the public contact page. Administrators can confirm, decline, cancel, or reopen a request and call the guest using its phone link. Status changes do not send SMS/email; staff must contact guests. Every request initially remains pending. Reservation PII is protected by server-side admin authorization.

The October 2026 visual revision uses Fish N Tingz logo colors, square controls, and locally hosted Barlow Condensed (SIL OFL license included under public/assets/OFL.txt).
