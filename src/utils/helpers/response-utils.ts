// response.util.ts
export class ResponseUtil {
  static success<T>(data: T, message: string = 'Success') {
    return { status: 'Success', data, message };
  }

  static error(message: string = 'Error', statusCode: number = 500) {
    return { status: 'Failure', message, statusCode };
  }
}
