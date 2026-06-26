export interface ErrorDetail {
  field: string;
  message: string;
}

export default class ApiError extends Error {
  statusCode: number;
  details?: ErrorDetail[];

  constructor(statusCode: number, message: string, details?: ErrorDetail[]) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}
