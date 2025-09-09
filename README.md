# Market Checkout System

A Vue 3 application for managing checkouts at the Clayton Early Learning Market.  
This tool allows staff to quickly scan family barcodes, record food checkout weights, and track participant history in Airtable.

Before this project, we were using an Airtable form to submit this information, but it had several limitations:

- No way to quickly access family information without searching the full database.
- No warnings if a participant with revoked access tried to shop, or if there is more than one transaction in a week with the same barcode.
- A poorly designed interface overall — no value checking or ability to add functionality later.

Since our team does not have permissions to modify the Airtable fields or form directly, this system was built to leverage Airtable’s strengths while also taking advantage of the flexibility of a standalone application. This allows additional functionality, such as checking whether a family profile is complete, supporting a "Staff" affiliation, and other enhancements to improve usability and data management.

---

## Features

- **Barcode Scanning Support**  
  Automatically looks up participants when an 8-digit barcode is scanned or typed.

- **Smart Form Handling**  
  Prevents accidental submissions from scanner "Enter" key presses.

- **Record Lookup & Filtering**  
  Search by name or barcode, and filter by affiliation (Enrolled / Community).

- **Checkout History**  
  Displays the last checkout date and highlights recent checkouts.  
  Participants with more than one checkout in a week are flagged in red.

- **Responsive UI**  
  Built with Bulma and custom Clayton branding.

---

## Tech Stack

- [Vue 3](https://vuejs.org/) (Composition API + `<script setup>`)
- [TypeScript](https://www.typescriptlang.org/)
- [Bulma](https://bulma.io/) (with custom CSS overrides)
- [Airtable API](https://airtable.com/api)

---

## Project Structure

```bash
src/
├── api/airtable.ts        # Airtable API utilities
├── assets/base.css        # Global styling
├── types/records.ts       # TypeScript type
├── views/CheckoutPage.vue # Checkout page component
├── App.vue                # Root app
└── main.ts                # App bootstrap

```

---

## Important Notice

- This project is for internal use only.
- It requires access to our private Airtable base.
- It will not function without the appropriate API key and database setup.

## Deployment

This project is deployed on [Vercel](https://vercel.com/) for internal use at Clayton Early Learning.

- Deployed internally — requires Airtable API access to function.
- Every push to the main branch is automatically deployed via Vercel.
- Environment variables (such as the Airtable API key) are configured in the Vercel project settings.
