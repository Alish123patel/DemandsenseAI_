import sys
from pathlib import Path

# Ensure project root and backend dir are in sys.path
_root = Path(__file__).resolve().parent.parent.parent
_backend = Path(__file__).resolve().parent.parent
for _p in [str(_root), str(_backend)]:
    if _p not in sys.path:
        sys.path.insert(0, _p)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routes.health import router as health_router
from app.routes.datasets import router as datasets_router
from app.routes.analytics import router as analytics_router
from app.routes.forecast import router as forecast_router
from app.routes.inventory import router as inventory_router
from app.routes.model_info import router as model_info_router


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        description="DemandSense AI — Demand Forecasting & Inventory Intelligence API",
        version="0.1.0",
        openapi_url="/openapi.json",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Health endpoints
    app.include_router(health_router)
    app.include_router(health_router, prefix=settings.API_V1_PREFIX)

    # Business & ML endpoints under /api/v1
    app.include_router(datasets_router, prefix=settings.API_V1_PREFIX)
    app.include_router(analytics_router, prefix=settings.API_V1_PREFIX)
    app.include_router(forecast_router, prefix=settings.API_V1_PREFIX)
    app.include_router(inventory_router, prefix=settings.API_V1_PREFIX)
    app.include_router(model_info_router, prefix=settings.API_V1_PREFIX)

    @app.get("/", tags=["Root"])
    def root():
        return {
            "message": "Welcome to DemandSense AI API",
            "docs": "/docs",
            "health": "/health",
            "api_v1": settings.API_V1_PREFIX,
        }

    return app


app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
