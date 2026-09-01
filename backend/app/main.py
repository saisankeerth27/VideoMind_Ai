import logging
import traceback as tb_mod
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.routes import api_router
from app.core.config import settings
from app.core.errors import AppError, envelope
from app.database.database import SessionLocal, init_db

logger = logging.getLogger("videomind")


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        db = SessionLocal()
        db.connection().close()
        db.close()
        init_db()
    except Exception as exc:
        print(f"[startup] Database initialization failed: {exc}")
    yield


app = FastAPI(
    title=settings.APP_NAME,
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_origin_regex=r"https://([a-z0-9-]+\.vercel\.app|[a-z0-9-]+\.devtunnels\.ms)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.exception_handler(AppError)
async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    logger.error("[AppError] %s %s -> %s %s", request.method, request.url.path, exc.code, exc.message)
    return JSONResponse(status_code=exc.status_code, content=envelope(exc.code, exc.message))


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content={"detail": "Invalid request data", "errors": exc.errors()},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    tb_mod.print_exception(exc)
    logger.error("[UNHANDLED] %s %s: %r", request.method, request.url.path, exc)
    return JSONResponse(
        status_code=500,
        content=envelope("INTERNAL_SERVER_ERROR", "An unexpected internal server error occurred."),
    )
