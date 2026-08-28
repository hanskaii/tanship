import { STATUS_CODES, type StatusCode } from "../constants/status.constants";

export class ApiError extends Error {
	public readonly statusCode: StatusCode;
	public readonly isOperational: boolean;
	public readonly errors?: unknown;

	constructor(
		statusCode: StatusCode,
		message: string,
		errors?: unknown,
		isOperational = true
	) {
		super(message);
		this.name = "ApiError";
		this.statusCode = statusCode;
		this.errors = errors;
		this.isOperational = isOperational;
		if ("captureStackTrace" in Error) {
			(Error as any).captureStackTrace(this, this.constructor);
		}
	}

	static badRequest(message = "Bad Request", errors?: unknown) {
		return new ApiError(STATUS_CODES.BAD_REQUEST, message, errors);
	}

	static notFound(message = "Not Found") {
		return new ApiError(STATUS_CODES.NOT_FOUND, message);
	}

	static validation(message = "Validation failed", errors?: unknown) {
		return new ApiError(STATUS_CODES.BAD_REQUEST, message, errors);
	}

	static badGateway(message = "Bad Gateway") {
		return new ApiError(STATUS_CODES.BAD_GATEWAY, message);
	}

	static gatewayTimeout(message = "Gateway Timeout") {
		return new ApiError(STATUS_CODES.GATEWAY_TIMEOUT, message);
	}

	static server(message = "Internal Server Error") {
		return new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, message);
	}
}
