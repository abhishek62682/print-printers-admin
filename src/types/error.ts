import type { AxiosError } from 'axios';

export type FieldError = {
    message: string;
    type: string;
};

export type ApiErrorResponse = {
    message: string;
    fieldErrors?: Record<string, FieldError[]>;
};

export type ApiAxiosError = AxiosError<ApiErrorResponse>;