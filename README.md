# KasirAI 🚀
**AI-Powered POS + QRIS with Telegram Business Assistant**

KasirAI is a modern, multi-tenant POS web application designed for Indonesian UMKM.
It combines **POS**, **QRIS payments**, and **AI-powered business insights** delivered directly via **Telegram Bot**.

Built by **Digimetalab – AI Agency**.

---

## ✨ Key Features

### 🧾 POS Core
- Fast web-based cashier system
- Product & category management
- Discounts & tax configuration
- Digital receipts

### 💳 QRIS Payment
- Static & dynamic QRIS
- Real-time payment status
- Automatic reconciliation
- Secure webhook handling

### 🤖 AI Business Intelligence
- Sales analysis & peak hours
- Inventory forecasting
- Pricing recommendations
- Promotion suggestions
- Daily profit & cashflow insights

### 📲 Telegram Bot (AI Co-Pilot)
- Daily sales summary
- Low-stock alerts
- AI business coaching chat
- Promo recommendations
- Profit warnings

---

## 🧠 Product Vision

> KasirAI is not just a POS.
> It is an **AI business assistant** that helps UMKM owners make better decisions every day.

---

## 🏗️ Tech Stack

### Frontend
- React.js
- TypeScript
- Vite
- Tailwind CSS

### Backend
- Node.js
- NestJS
- PostgreSQL
- REST API (API-first)

### AI & Automation
- OpenAI API / Local LLM
- n8n for workflow automation

### Messaging
- Telegram Bot API

### Payment
- QRIS (via Indonesian Payment Gateway)

### Infrastructure
- Docker
- Cloud-ready (AWS / GCP / VPS)

---

## 📦 Monorepo Structure

apps/
web/ # POS Web App (React)
api/ # Backend API (NestJS)

packages/
shared-types/
utils/

docs/
infra/


---

## 🚀 Getting Started (Development)

### Prerequisites
- Node.js >= 18
- pnpm
- Docker

### Install Dependencies
```bash
pnpm install

Run Backend
cd apps/api
pnpm run start:dev

Run Frontend
cd apps/web
pnpm run dev

🤖 Telegram Bot Setup

Create a bot via @BotFather

Get BOT_TOKEN

Set webhook endpoint:

POST /telegram/webhook

🔐 Environment Variables

Each app uses its own .env file.

Example:

DATABASE_URL=
QRIS_API_KEY=
OPENAI_API_KEY=
TELEGRAM_BOT_TOKEN=

🗺️ Roadmap
MVP

POS Core

QRIS Payment

Telegram notifications

V1

AI Sales & Inventory

Telegram AI Coach

Promotion Engine

V2

Dynamic pricing

Financing recommendations

Multi-outlet support

📈 Success Metrics

Daily active merchants

QRIS transaction volume

Telegram bot engagement

AI feature adoption

🏢 Company

Digimetalab
AI Agency – Bali, Indonesia

📄 License

Apache 2.0 License
