
export interface LoginResponse {
  success: boolean;
  user?: {
    id: string;
    name: string;
    phone: string;
    isAdmin: boolean;
    hasVoted: boolean;
  };
  message?: string;
}

export interface OtpResponse {
  success: boolean;
  message: string;
  otp?: string; // Only included in development mode
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  userId?: string;
}

// Mock database and storage types
export interface MockUser {
  id: string;
  name: string;
  phone: string;
  isAdmin: boolean;
  hasVoted: boolean;
  addressId?: string;
  registeredAt?: string;
}

export interface OtpData {
  otp: string;
  expiresAt: number;
}
