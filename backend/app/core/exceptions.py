class AppError(Exception):
    def __init__(self, code: str, message: str, status_code: int = 400):
        self.code = code
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class NotFoundError(AppError):
    def __init__(self, resource: str):
        super().__init__(
            f"{resource.upper()}_NOT_FOUND",
            f"{resource.replace('_', ' ').title()} does not exist.",
            404,
        )
