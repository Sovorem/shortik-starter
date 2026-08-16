// HTTP-aware errors: throw one of these anywhere in a handler and
// errorHandlingMiddleware turns it into the matching JSON response.
export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = new.target.name;
    this.status = status;
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string) {
    super(400, message);
  }
}

export class UserNotAuthenticatedError extends HttpError {
  constructor(message: string) {
    super(401, message);
  }
}

export class UserForbiddenError extends HttpError {
  constructor(message: string) {
    super(403, message);
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string) {
    super(404, message);
  }
}
