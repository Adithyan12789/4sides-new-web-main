// Auth Types
export interface RegisterData {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    password: string;
    password_confirmation?: string;
}

export interface LoginData {
    email: string;
    password: string;
    remember?: boolean;
}

export interface SocialLoginData {
    provider: 'google' | 'facebook' | 'apple';
    access_token: string;
    email: string; // Required by backend
    first_name: string; // Required by backend
    login_type?: string;
    last_name?: string;
    name?: string;
    provider_id?: string;
}

export interface ChangePasswordData {
    old_password: string; // Backend uses 'old_password'
    new_password: string; // Backend uses 'new_password'
    current_password?: string; // Alias for compatibility
    new_password_confirmation?: string; // Optional confirmation
}

export interface ForgotPasswordData {
    email: string;
}

export interface UpdateProfileData {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    mobile?: string; // Backend uses 'mobile' field
    avatar?: string;
    file_url?: File | string; // Backend accepts file upload
}

export interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    mobile?: string; // Backend uses 'mobile' field
    avatar?: string;
    file_url?: string; // Backend returns file_url for avatar
    email_verified_at?: string;
    created_at: string;
    updated_at: string;
    api_token?: string; // Backend returns api_token
    is_parental_lock_enable?: number; // 0 or 1
    is_child_profile?: number; // 0 or 1 - filters 18+ content when enabled
}

export interface AuthResponse {
    success: boolean;
    status?: boolean; // Backend sometimes uses 'status' instead of 'success'
    message: string;
    error?: string; // Error message for failed requests
    data?: {
        user: User;
        token: string;
    };
}

export interface Notification {
    id: number;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    created_at: string;
}

export interface NotificationResponse {
    success: boolean;
    data: Notification[];
    total: number;
}

// Helper function to get full name from User object
export const getUserFullName = (user: User | null | undefined): string => {
    if (!user) return '';
    return `${user.first_name} ${user.last_name}`.trim();
};
