import logging
import sys
from backend.app.core.config import settings

def setup_logging() -> None:
    """
    Configures application-wide logging.
    In production environments, structured JSON is logged for cloud processing.
    In development, standard stream formats with colors/human readability are used.
    """
    log_level = logging.INFO
    if settings.ENVIRONMENT == "development":
        log_level = logging.DEBUG

    # Logging handlers
    handlers: list[logging.Handler] = [logging.StreamHandler(sys.stdout)]

    # Use python-json-logger if in production/staging for structured logs
    if settings.ENVIRONMENT in ["production", "staging"]:
        try:
            from pythonjsonlogger import jsonlogger
            formatter = jsonlogger.JsonFormatter(
                fmt="%(asctime)s %(levelname)s %(name)s %(message)s"
            )
            handlers[0].setFormatter(formatter)
        except ImportError:
            # Fallback formatting if library isn't present
            formatter = logging.Formatter(
                "[%(asctime)s] %(levelname)s in %(module)s: %(message)s"
            )
            handlers[0].setFormatter(formatter)
    else:
        # Standard clean terminal logger output
        formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        handlers[0].setFormatter(formatter)

    # Configure root logger
    logging.basicConfig(
        level=log_level,
        handlers=handlers,
    )

    # Silent noisy libraries loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

    logger = logging.getLogger(__name__)
    logger.info("Logging configured successfully under %s mode.", settings.ENVIRONMENT)
