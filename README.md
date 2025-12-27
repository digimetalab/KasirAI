<p align="center">
  <img src="assets/logo.png" alt="KasirAI Logo" width="120"/>
</p>

<h1 align="center">KasirAI</h1>

<p align="center">
  <strong>Fintech-Grade AI-Powered POS for Indonesian SMEs</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#deployment">Deployment</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white" alt="NestJS"/>
  <img src="https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white" alt="Prisma"/>
</p>

***

## Overview

**KasirAI** is a production-ready, multi-tenant Point of Sale system designed specifically for Indonesian UMKM (SMEs). Built with fintech-grade standards, it combines fast checkout operations with AI-powered business intelligence delivered via Telegram.

> 💡 *Not just a cashier — an AI business assistant for business owners.*

***

## Features

### 🧾 POS Core

* **Cashier-first UX** — Minimal clicks, keyboard shortcuts, fast checkout
* Real-time calculation with transparent breakdown
* Member & non-member transaction modes
* Digital receipt generation

### 💳 Payments

* **QRIS Integration** — Static & dynamic QR codes
* Real-time payment status updates
* Automatic reconciliation

### 👥 Loyalty Program

* **Member tiers**: Regular, Silver (1.2x), Gold (1.5x), Platinum (2x) points
* Configurable points earning & redemption
* Member search with quick registration
* Margin protection to prevent losses

### 🎫 Discount Engine

* Percentage & fixed amount discounts
* Minimum purchase requirements
* Usage limits & validity periods

### 📊 Tax & Compliance

* Inclusive/exclusive tax calculation
* DPP (taxable base) separation
* **Coretax Indonesia export-ready**
* Complete audit trail

### 🤖 AI Insights (Groq)

* Daily sales analysis
* Discount effectiveness metrics
* Loyalty ROI tracking
* Tax impact analysis
* **Multilingual**: 🇮🇩 Indonesian, 🇬🇧 English, 🇨🇳 Chinese

### 📲 Telegram Integration

* Transaction notifications
* Daily summary reports
* AI business coaching
* Configurable via admin dashboard

***

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│              POS Interface • Owner Dashboard             │
└─────────────────────────┬───────────────────────────────┘
                          │ REST API
┌─────────────────────────▼───────────────────────────────┐
│                   Backend (NestJS)                       │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │  Auth   │ │ Products│ │  POS    │ │Payments │       │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │ Loyalty │ │Discount │ │   Tax   │ │   AI    │       │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│              PostgreSQL (Prisma ORM)                     │
└─────────────────────────────────────────────────────────┘
```

**Calculation Order (Strict):**

```
Subtotal → Discount → Loyalty Points → Tax → Grand Total
```

***

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Backend | NestJS, Node.js |
| Database | PostgreSQL, Prisma ORM |
| AI | Groq API |
| Messaging | Telegram Bot API |
| Payment | QRIS (Indonesian Payment Gateway) |
| Infrastructure | Docker, VPS-ready |

***

## Project Structure

```
KasirAI/
├── apps/
│   ├── api/                 # NestJS Backend
│   │   └── src/
│   │       ├── modules/     # Feature modules
│   │       ├── services/    # Business logic
│   │       └── prisma/      # Database schema
│   └── web/                 # React Frontend
│       └── src/
│           ├── pages/       # Page components
│           ├── components/  # UI components
│           └── stores/      # State management
├── packages/
│   └── shared-types/        # Shared TypeScript types
├── docker-compose.yml
└── README.md
```

***

## Getting Started

### Prerequisites

* Node.js ≥ 18
* pnpm
* PostgreSQL (or Docker)

### Installation

```bash
# Clone repository
git clone https://github.com/digimetalab/KasirAI.git
cd KasirAI

# Install dependencies
pnpm install

# Setup environment
cp .env.example .env

# Start database
docker-compose up -d postgres

# Run migrations
pnpm --filter api prisma migrate dev

# Start development
pnpm dev
```

***

## Deployment

### Docker (Recommended)

```bash
docker-compose up -d
```

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/kasirai

# AI
GROQ_API_KEY=your_groq_api_key

# Telegram (configurable via Admin UI)
TELEGRAM_BOT_TOKEN=your_bot_token
```

***

## Roadmap

| Phase | Status |
|-------|--------|
| POS Core + Tax | 🔄 In Progress |
| QRIS + Loyalty | ⏳ Planned |
| AI Insights + Telegram | ⏳ Planned |
| Coretax Export | ⏳ Planned |

***

## About

**Digimetalab** — AI Agency, Bali, Indonesia\
Building intelligent solutions since 2020.

***

## License

[Apache 2.0](LICENSE)
