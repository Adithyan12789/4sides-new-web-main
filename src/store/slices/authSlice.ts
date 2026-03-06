/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { authService, notificationService } from '@/services/authService';
import type {
    User,
    LoginData,
    RegisterData,
    SocialLoginData,
    ChangePasswordData,
    ForgotPasswordData,
    UpdateProfileData,
    Notification,
} from '@/types/auth';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    notifications: Notification[];
    notificationCount: number;
}

const initialState: AuthState = {
    user: authService.getCurrentUser(),
    isAuthenticated: authService.isAuthenticated(),
    isLoading: false,
    error: null,
    notifications: [],
    notificationCount: 0,
};

// Async Thunks
export const register = createAsyncThunk(
    'auth/register',
    async (data: RegisterData, { rejectWithValue }) => {
        try {
            const response = await authService.register(data);

            // 1. Check for standard data structure
            if (response.data) return response.data;

            // 2. Check for flat data structure (backend inconsistency fix)
            const anyResp = response as any;
            if (anyResp.user && anyResp.token) {
                localStorage.setItem('authToken', anyResp.token);
                localStorage.setItem('user', JSON.stringify(anyResp.user));
                return { user: anyResp.user, token: anyResp.token };
            }

            // 3. Check for explicit failure
            if (response.success === false) {
                return rejectWithValue(response.message);
            }

            // 4. Fallback to localStorage (if service side-loaded it)
            const user = authService.getCurrentUser();
            const token = localStorage.getItem('authToken');
            if (user && token) return { user, token };

            return undefined;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Registration failed');
        }
    }
);

export const login = createAsyncThunk(
    'auth/login',
    async (data: LoginData, { rejectWithValue }) => {
        try {
            const response = await authService.login(data);
            
            console.log('Login response:', response);

            // 1. Check for standard data structure
            if (response.data) {
                const user = response.data.user || response.data;
                const token = response.data.token || (response.data as any).api_token || (user as any).api_token;
                
                console.log('Extracted user:', user);
                console.log('Extracted token:', token);
                
                if (token) {
                    localStorage.setItem('authToken', token);
                    console.log('Token saved to localStorage');
                }
                if (user) {
                    localStorage.setItem('user', JSON.stringify(user));
                    console.log('User saved to localStorage');
                }
                
                return { user, token };
            }

            // 2. Check for flat data structure (backend inconsistency fix)
            const anyResp = response as any;
            if (anyResp.user || anyResp.api_token) {
                const user = anyResp.user || anyResp;
                const token = anyResp.token || anyResp.api_token || (user as any).api_token;
                
                console.log('Flat structure - user:', user);
                console.log('Flat structure - token:', token);
                
                if (token) {
                    localStorage.setItem('authToken', token);
                    console.log('Token saved to localStorage (flat)');
                }
                if (user) {
                    localStorage.setItem('user', JSON.stringify(user));
                    console.log('User saved to localStorage (flat)');
                }
                
                return { user, token };
            }

            // 3. Check for explicit failure
            if (response.success === false || response.status === false) {
                return rejectWithValue(response.message || 'Login failed');
            }

            // 4. Fallback to localStorage (if service side-loaded it)
            const user = authService.getCurrentUser();
            const token = localStorage.getItem('authToken');
            console.log('Fallback - user from localStorage:', user);
            console.log('Fallback - token from localStorage:', token);
            if (user && token) return { user, token };

            console.error('Invalid response format:', response);
            return rejectWithValue('Invalid response format');
        } catch (error: any) {
            console.error('Login error:', error);
            return rejectWithValue(error.response?.data?.message || error.message || 'Login failed');
        }
    }
);

export const socialLogin = createAsyncThunk(
    'auth/socialLogin',
    async (data: SocialLoginData, { rejectWithValue }) => {
        try {
            const response = await authService.socialLogin(data);

            // 1. Check for standard data structure
            if (response.data) {
                const user = response.data.user || response.data;
                const token = response.data.token || (response.data as any).api_token || (user as any).api_token;
                
                if (token) {
                    localStorage.setItem('authToken', token);
                }
                if (user) {
                    localStorage.setItem('user', JSON.stringify(user));
                }
                
                return { user, token };
            }

            // 2. Check for flat data structure (backend inconsistency fix)
            const anyResp = response as any;
            if (anyResp.user || anyResp.api_token) {
                const user = anyResp.user || anyResp;
                const token = anyResp.token || anyResp.api_token || (user as any).api_token;
                
                if (token) {
                    localStorage.setItem('authToken', token);
                }
                if (user) {
                    localStorage.setItem('user', JSON.stringify(user));
                }
                
                return { user, token };
            }

            // 3. Check for explicit failure
            if (response.success === false || response.status === false) {
                return rejectWithValue(response.message || 'Social login failed');
            }

            // 4. Fallback to localStorage (if service side-loaded it)
            const user = authService.getCurrentUser();
            const token = localStorage.getItem('authToken');
            if (user && token) return { user, token };

            return rejectWithValue('Invalid response format');
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Social login failed');
        }
    }
);

export const logout = createAsyncThunk(
    'auth/logout',
    async () => {
        try {
            // Priority 1: Clear local storage immediately
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            
            // Priority 2: Try to notify backend
            await authService.logout().catch(err => console.warn('Logout API failed:', err));
            
            return true;
        } catch (error: any) {
            // Still return true because we cleared the local session
            return true;
        }
    }
);

export const changePassword = createAsyncThunk(
    'auth/changePassword',
    async (data: ChangePasswordData, { rejectWithValue }) => {
        try {
            const response = await authService.changePassword(data);
            if (!response.success) {
                return rejectWithValue(response.message);
            }
            return response.message;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Password change failed');
        }
    }
);

export const forgotPassword = createAsyncThunk(
    'auth/forgotPassword',
    async (data: ForgotPasswordData, { rejectWithValue }) => {
        try {
            const response = await authService.forgotPassword(data);
            if (!response.success) {
                return rejectWithValue(response.message);
            }
            return response.message;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Password reset request failed');
        }
    }
);

export const fetchUserDetail = createAsyncThunk(
    'auth/fetchUserDetail',
    async (_, { rejectWithValue }) => {
        try {
            const response = await authService.userDetail();
            if (!response.success) {
                return rejectWithValue('Failed to fetch user details');
            }
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch user details');
        }
    }
);

export const updateProfile = createAsyncThunk(
    'auth/updateProfile',
    async (data: UpdateProfileData, { rejectWithValue }) => {
        try {
            const response = await authService.updateProfile(data);
            
            // Check for success using both possible fields
            const isSuccess = response.success || (response as any).status;
            
            if (!isSuccess) {
                return rejectWithValue(response.message || 'Profile update failed');
            }
            
            // Return the user data
            return response.data;
        } catch (error: any) {
            // Don't logout on profile update errors
            const errorMessage = error.response?.data?.message || error.message || 'Profile update failed';
            return rejectWithValue(errorMessage);
        }
    }
);

export const deleteAccount = createAsyncThunk(
    'auth/deleteAccount',
    async (_, { rejectWithValue }) => {
        try {
            const response = await authService.deleteUserAccount();
            
            // Always clear local session after deletion attempt
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');

            if (!response.success) {
                return rejectWithValue(response.message);
            }
            return true;
        } catch (error: any) {
            // Clear local session anyway
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            return rejectWithValue(error.response?.data?.message || 'Account deletion failed');
        }
    }
);

export const fetchNotifications = createAsyncThunk(
    'auth/fetchNotifications',
    async (_, { rejectWithValue }) => {
        try {
            const response = await notificationService.getNotifications();
            if (!response.success) {
                return rejectWithValue('Failed to fetch notifications');
            }
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
        }
    }
);

export const removeNotification = createAsyncThunk(
    'auth/removeNotification',
    async (notificationId: number, { rejectWithValue }) => {
        try {
            const response = await notificationService.removeNotification(notificationId);
            if (!response.success) {
                return rejectWithValue(response.message);
            }
            return notificationId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to remove notification');
        }
    }
);

export const clearAllNotifications = createAsyncThunk(
    'auth/clearAllNotifications',
    async (_, { rejectWithValue }) => {
        try {
            const response = await notificationService.clearAllNotifications();
            if (!response.success) {
                return rejectWithValue(response.message);
            }
            return true;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to clear notifications');
        }
    }
);

// Send OTP
export const sendOtp = createAsyncThunk(
    'auth/sendOtp',
    async (phone: string, { rejectWithValue }) => {
        try {
            const response = await authService.sendOtp(phone);
            if (response.success === false) {
                return rejectWithValue(response.message);
            }
            return response.message || 'OTP Sent';
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to send OTP';
            const status = error.response?.status;
            return rejectWithValue(status ? `${status}: ${errorMessage}` : errorMessage);
        }
    }
);
// Verify OTP
export const verifyOtp = createAsyncThunk(
    'auth/verify-otp',
    async ({ phone, otp }: { phone: string; otp: string }, { rejectWithValue }) => {
        try {
            const response = await authService.verifyOtp(phone, otp);
            
            console.log('Redux verifyOtp - Response:', response);

            // Check for explicit failure
            if (response.success === false) {
                return rejectWithValue(response.message || 'OTP verification failed');
            }

            // authService already correctly fetches the real token and saves to localStorage
            // Response structure: { success: true, data: { user, token } }
            if (response.data && response.data.token && response.data.user) {
                return { user: response.data.user, token: response.data.token };
            }

            console.error('Redux verifyOtp - No user/token provided by authService');
            return rejectWithValue('Authentication failed: Missing user or token data');
        } catch (error: any) {
            console.error('Redux verifyOtp - Error:', error);
            return rejectWithValue(error.response?.data?.message || 'OTP verification failed');
        }
    }
); 

// Slice
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setUser: (state, action: PayloadAction<User | null>) => {
            state.user = action.payload;
            state.isAuthenticated = !!action.payload;
        },
    },
    extraReducers: (builder) => {
        // Register
        builder.addCase(register.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(register.fulfilled, (state, action) => {
            state.isLoading = false;
            if (action.payload) {
                state.user = action.payload.user;
                state.isAuthenticated = true;
            }
        });
        builder.addCase(register.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Login
        builder.addCase(login.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(login.fulfilled, (state, action) => {
            state.isLoading = false;
            if (action.payload) {
                state.user = action.payload.user;
                state.isAuthenticated = true;
            }
        });
        builder.addCase(login.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Social Login
        builder.addCase(socialLogin.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(socialLogin.fulfilled, (state, action) => {
            state.isLoading = false;
            if (action.payload) {
                state.user = action.payload.user;
                state.isAuthenticated = true;
            }
        });
        builder.addCase(socialLogin.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Send OTP
        builder.addCase(sendOtp.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(sendOtp.fulfilled, (state) => {
            state.isLoading = false;
        });
        builder.addCase(sendOtp.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Verify OTP
        builder.addCase(verifyOtp.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(verifyOtp.fulfilled, (state, action) => {
            state.isLoading = false;
            if (action.payload) {
                state.user = action.payload.user;
                state.isAuthenticated = true;
            }
        });
        builder.addCase(verifyOtp.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Logout
        builder.addCase(logout.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(logout.fulfilled, (state) => {
            state.isLoading = false;
            state.user = null;
            state.isAuthenticated = false;
            state.notifications = [];
            state.notificationCount = 0;
        });
        builder.addCase(logout.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Fetch User Detail
        builder.addCase(fetchUserDetail.fulfilled, (state, action) => {
            state.user = action.payload;
        });

        // Update Profile
        builder.addCase(updateProfile.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(updateProfile.fulfilled, (state, action) => {
            state.isLoading = false;
            state.user = action.payload;
        });
        builder.addCase(updateProfile.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Delete Account
        builder.addCase(deleteAccount.fulfilled, (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.notifications = [];
            state.notificationCount = 0;
        });

        // Fetch Notifications
        builder.addCase(fetchNotifications.fulfilled, (state, action) => {
            state.notifications = action.payload.data;
            state.notificationCount = action.payload.total;
        });

        // Remove Notification
        builder.addCase(removeNotification.fulfilled, (state, action) => {
            state.notifications = state.notifications.filter(n => n.id !== action.payload);
            state.notificationCount = Math.max(0, state.notificationCount - 1);
        });

        // Clear All Notifications
        builder.addCase(clearAllNotifications.fulfilled, (state) => {
            state.notifications = [];
            state.notificationCount = 0;
        });
    },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
