import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ErrorKeys, Errors } from 'src/exception/errors.codes';
import { AppException } from 'src/exception/http-exception.filter';

export const handleException = (error: any, code: ErrorKeys = 'GEN0500') => {
  if (error instanceof AppException) {
    throw error;
  }
  throw new AppException(code, error.message);
};

export const ApiErrorResponses = (...codes: ErrorKeys[]) => {
  const errorObj = {};
  if (codes.length) {
    for (const code of codes) {
      const value = Errors.get(code);
      if (value) {
        if (!errorObj[value.statusCode]) {
          errorObj[value.statusCode] = [];
        }
        errorObj[value.statusCode].push({ ...value, code });
      }
    }

    const responses = [];
    for (const [key, value] of Object.entries(errorObj)) {
      const testValues = value as [
        { message: string; statusCode: number; code: string },
      ];
      responses.push(
        ApiResponse({
          status: Number(key),
          content: {
            'application/json': {
              examples: [...testValues].reduce((list, schema) => {
                list[schema.code] = {
                  value: {
                    status: 'Failure',
                    errorCode: schema.code,
                    error: {
                      message: schema['message'],
                    },
                    timestamp: new Date().toISOString(),
                  },
                };
                return list;
              }, {}),
            },
          },
        }),
      );
    }
    return applyDecorators(...responses);
  }
};
