export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function getErrorMessage(error: unknown, fallback = 'Algo deu errado.'): string {
  if (error instanceof ApiError) {
    if (error.errors && typeof error.errors === 'object') {
      for (const field of Object.keys(error.errors)) {
        const messages = error.errors[field];
        if (Array.isArray(messages) && messages[0]) {
          return messages[0];
        }
      }
    }
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
