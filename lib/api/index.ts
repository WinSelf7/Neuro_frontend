/**
 * API module exports
 */

export { apiClient, default as ApiClient } from './client';
export type {
  ApiResponse,
  Document,
  ProcessingJob,
  ParseResponse,
  TaskResponse,
  PrescriptionRequest,
  PrescriptionResponse,
} from './client';

export { authClient, default as AuthClient } from './auth';
export type {
  SignupData,
  SigninData,
  AuthResponse,
  User,
} from './auth';

