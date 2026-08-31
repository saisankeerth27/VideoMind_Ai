"""Application-level errors rendered in a consistent JSON envelope."""


class AppError(Exception):
    def __init__(self, status_code: int, code: str, message: str):
        self.status_code = status_code
        self.code = code
        self.message = message
        super().__init__(message)


def envelope(code: str, message: str) -> dict:
    return {"success": False, "error": {"code": code, "message": message}}


# --- Summary-specific error categories ---

SUMMARY_ERROR_CATEGORIES = {
    "SUMMARY_CONTEXT_TOO_LARGE": {
        "status_code": 413,
        "message": "Transcript is too long for the AI model. Please try a shorter video.",
    },
    "SUMMARY_RATE_LIMIT": {
        "status_code": 429,
        "message": "AI generation rate limited. Please try again in a moment.",
    },
    "SUMMARY_TIMEOUT": {
        "status_code": 504,
        "message": "AI generation timed out. Please try again.",
    },
    "SUMMARY_INVALID_RESPONSE": {
        "status_code": 502,
        "message": "The AI returned an invalid response. Please try again.",
    },
    "SUMMARY_PROVIDER_ERROR": {
        "status_code": 502,
        "message": "The AI service encountered an error. Please try again.",
    },
    "SUMMARY_VALIDATION_ERROR": {
        "status_code": 502,
        "message": "The AI response could not be validated. Please try again.",
    },
    "SUMMARY_UNKNOWN_ERROR": {
        "status_code": 500,
        "message": "An unexpected error occurred during summary generation.",
    },
    "SUMMARY_PARSE_ERROR": {
        "status_code": 502,
        "message": "The AI response could not be parsed. Please try again.",
    },
}