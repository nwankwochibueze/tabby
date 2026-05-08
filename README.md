<div align="center">
  <h1>Tabby</h1>
  <p>Smart tab management by context - not just domain.</p>

  ![Status](https://img.shields.io/badge/status-in%20development-yellow)
  ![Stack](https://img.shields.io/badge/stack-React%20%7C%20TypeScript%20%7C%20Hono%20%7C%20PostgreSQL-blue)
  ![License](https://img.shields.io/badge/license-MIT-green)
</div>

---

## The Problem

Every tab manager groups by domain - google.com, youtube.com.
That tells you nothing about what you are actually doing.

## The Solution

Tabby groups tabs by intent and context - work, research, entertainment -
gives you a visual map, recovers closed tabs, and shows browsing insights.

---

## Features

- Smart Grouping - Groups tabs by context, not domain
- Visual Map - See all your tabs spatially, not as a list
- Session Recovery - Closed tabs are never gone forever
- Browsing Insights - See how long tabs sit untouched
- Clean UI - Built for everyday people, not power users

---

## Tech Stack

| Layer | Tech |
|---|---|
| Extension | React + TypeScript + CRXJS + Vite |
| Styling | Tailwind CSS + CSS Variables |
| Backend | Hono + TypeScript |
| Database | PostgreSQL + Prisma |
| Monorepo | pnpm workspaces |

---

## Project Structure