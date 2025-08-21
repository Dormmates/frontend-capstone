export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    details?: string;
    stack?: string;
  };
  data?: any;
}
