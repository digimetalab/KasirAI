"""
KasirAI - Fintech-Grade POS API
FastAPI Application Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.cfg import get_settings
from src.api import health, transactions, products, customers, discounts

settings = get_settings()

app = FastAPI(
    title="KasirAI API",
    description="Fintech-grade AI-powered POS for Indonesian UMKM",
    version="1.0.0",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["Health"])
app.include_router(transactions.router, prefix="/api/transactions", tags=["Transactions"])
app.include_router(products.router, prefix="/api/products", tags=["Products"])
app.include_router(customers.router, prefix="/api/customers", tags=["Customers"])
app.include_router(discounts.router, prefix="/api/discounts", tags=["Discounts"])


@app.get("/")
async def root():
    return {
        "name": "KasirAI API",
        "version": "1.0.0",
        "status": "running"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )
