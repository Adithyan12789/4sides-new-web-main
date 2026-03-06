import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, Monitor, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { authService } from '@/services/authService';
import { subscriptionService } from '@/services/subscriptionService';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { fetchUserDetail, logout } from '@/store/slices/authSlice';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface Device {
  id: number;
  device_name: string;
  device_id: string;
  last_used: string;
  platform: string;
}

export default function AccountSettingsPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [isEditingMobile, setIsEditingMobile] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [devices, setDevices] = useState<Device[]>([]);
  const [currentDevice, setCurrentDevice] = useState<Device | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLogoutAllConfirm, setShowLogoutAllConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/auth');
      return;
    }
    
    // Fetch latest user details from backend
    dispatch(fetchUserDetail());
    
    // Check subscription status from backend
    checkSubscription();
    
    // Fetch devices from backend
    fetchDevices();
    
    // Set current device info
    setCurrentDeviceInfo();
  }, [navigate, dispatch]);

  const setCurrentDeviceInfo = () => {
    // Get browser and OS information
    const userAgent = navigator.userAgent;
    let browserName = 'Unknown Browser';
    let osName = 'Unknown OS';
    
    // Detect browser
    if (userAgent.indexOf('Firefox') > -1) {
      browserName = 'Firefox';
    } else if (userAgent.indexOf('Chrome') > -1) {
      browserName = 'Chrome';
    } else if (userAgent.indexOf('Safari') > -1) {
      browserName = 'Safari';
    } else if (userAgent.indexOf('Edge') > -1) {
      browserName = 'Edge';
    } else if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) {
      browserName = 'Opera';
    }
    
    // Detect OS
    if (userAgent.indexOf('Win') > -1) {
      osName = 'Windows';
    } else if (userAgent.indexOf('Mac') > -1) {
      osName = 'macOS';
    } else if (userAgent.indexOf('Linux') > -1) {
      osName = 'Linux';
    } else if (userAgent.indexOf('Android') > -1) {
      osName = 'Android';
    } else if (userAgent.indexOf('iOS') > -1 || userAgent.indexOf('iPhone') > -1 || userAgent.indexOf('iPad') > -1) {
      osName = 'iOS';
    }
    
    const deviceId = localStorage.getItem('device_id') || 'unknown';
    
    setCurrentDevice({
      id: 0,
      device_name: `${browserName} on ${osName}`,
      device_id: deviceId,
      last_used: new Date().toISOString(),
      platform: 'web'
    });
  };

  useEffect(() => {
    // Sync mobile number from user data fetched from backend
    if (user) {
      setMobileNumber(user.mobile || user.phone || '');
    }
  }, [user]);

  const checkSubscription = async () => {
    try {
      const response = await subscriptionService.checkUserSubscription();
      setHasActiveSubscription(response.hasActiveSubscription);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const fetchDevices = async () => {
    try {
      const response = await authService.getUserDevices();
      
      if (response.success && response.data.length > 0) {
        // Filter out current device from the list
        const currentDeviceId = localStorage.getItem('device_id');
        const otherDevices = response.data.filter((device: Device) => 
          device.device_id !== currentDeviceId
        );
        setDevices(otherDevices);
      } else {
        // If no devices from API, show empty list
        setDevices([]);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
      // Show empty list on error
      setDevices([]);
    }
  };

  const handleUpdateMobile = async () => {
    try {
      await api.post('/update-profile', {
        mobile: mobileNumber
      });
      
      toast.success('Mobile number updated successfully');
      setIsEditingMobile(false);
      dispatch(fetchUserDetail());
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update mobile number');
    }
  };

  const handleDeviceLogout = async (deviceId: string, isCurrentDevice: boolean = false) => {
    try {
      await authService.deviceLogout(deviceId);
      toast.success('Device logged out successfully');
      
      // If logging out current device, redirect to login
      if (isCurrentDevice) {
        await dispatch(logout()).unwrap();
        navigate('/auth');
      } else {
        // Refresh devices list
        fetchDevices();
      }
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || 
                       error?.response?.data?.error || 
                       'Failed to logout device';
      toast.error(errorMsg);
      console.error('Device logout error:', error);
    }
  };

  const handleLogoutAllDevices = async () => {
    try {
      setIsLoggingOut(true);
      await authService.logOutAll();
      toast.success('All devices logged out successfully');
      setShowLogoutAllConfirm(false);
      
      // Redirect to login
      await dispatch(logout()).unwrap();
      navigate('/auth');
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || 
                       error?.response?.data?.error || 
                       'Failed to logout all devices';
      toast.error(errorMsg);
      console.error('Logout all devices error:', error);
      setIsLoggingOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await api.delete('/delete-account');
      
      toast.success('Account deleted successfully');
      await dispatch(logout()).unwrap();
      navigate('/auth');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete account');
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] pt-24 pb-20">
      {/* Background Grain */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

      <div className="relative z-10 max-w-[1000px] mx-auto px-6 sm:px-12 lg:px-20">
        {/* Header */}
        <div className="mb-12 animate-slide-up">
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight text-center mb-2">
            Account Setting
          </h1>
        </div>

        {/* Subscription Status Alert */}
        <div className="mb-8 animate-slide-up">
          {!hasActiveSubscription ? (
            <div className="glass rounded-2xl p-6 border border-yellow-500/30 bg-yellow-500/5">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-white font-semibold mb-1">
                    You do not have an active subscription.
                  </p>
                  <p className="text-white/60 text-sm">Please consider upgrading.</p>
                </div>
                <button
                  onClick={() => navigate('/subscription')}
                  className="px-4 py-2 bg-[#EAB308] text-black font-bold rounded-lg hover:bg-[#FACC15] transition-colors text-sm"
                >
                  Upgrade
                </button>
              </div>
            </div>
          ) : (
            <div className="glass rounded-2xl p-6 border border-green-500/30 bg-green-500/5">
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold">
                    You have an active subscription.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Register Mobile Number */}
        <div className="mb-8 animate-slide-up">
          <h2 className="text-xl font-bold text-white mb-4">Register Mobile Number:</h2>
          <div className="glass rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#EAB308]/10 flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-[#EAB308]" />
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-1">Mobile:</p>
                  {isEditingMobile ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="tel"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        className="px-3 py-1.5 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#EAB308]"
                        placeholder="Enter mobile number"
                      />
                      <button
                        onClick={handleUpdateMobile}
                        className="px-3 py-1.5 bg-[#EAB308] text-black font-semibold rounded-lg hover:bg-[#FACC15] transition-colors text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingMobile(false);
                          setMobileNumber(user?.mobile || user?.phone || '');
                        }}
                        className="px-3 py-1.5 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <p className="text-white font-semibold text-lg">
                      {mobileNumber || 'Not set'}
                    </p>
                  )}
                </div>
              </div>
              {!isEditingMobile && (
                <button
                  onClick={() => setIsEditingMobile(true)}
                  className="p-2 rounded-lg bg-[#EAB308]/10 text-[#EAB308] hover:bg-[#EAB308]/20 transition-colors"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Your Device */}
        <div className="mb-8 animate-slide-up">
          <h2 className="text-xl font-bold text-white mb-4">Your Device</h2>
          <div className="glass rounded-2xl p-6 border border-white/10">
            {currentDevice ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Monitor className="w-6 h-6 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white font-semibold text-lg">
                        {currentDevice.device_name}
                      </p>
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-bold rounded-full border border-green-500/30">
                        Current Device
                      </span>
                    </div>
                    <p className="text-white/60 text-sm mb-1">
                      Device ID: {currentDevice.device_id}
                    </p>
                    <p className="text-white/40 text-xs">
                      Active now
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeviceLogout(currentDevice.device_id, true)}
                  className="px-4 py-2 bg-red-500/10 text-red-400 font-semibold rounded-lg hover:bg-red-500/20 transition-colors border border-red-500/30 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <p className="text-white/60 text-sm">Loading device information...</p>
            )}
          </div>
        </div>

        {/* Other Devices */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Other Devices</h2>
            {devices.length > 0 && (
              <button
                onClick={() => setShowLogoutAllConfirm(true)}
                className="px-4 py-2 bg-red-500/10 text-red-400 font-semibold rounded-lg hover:bg-red-500/20 transition-colors border border-red-500/30 text-sm flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Logout All Devices
              </button>
            )}
          </div>
          {devices.length > 0 ? (
            <div className="space-y-3">
              {devices.map((device) => (
                <div
                  key={device.id}
                  className="glass rounded-2xl p-6 border border-white/10"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-[#EAB308]/10 flex items-center justify-center">
                        <Monitor className="w-6 h-6 text-[#EAB308]" />
                      </div>
                      <div>
                        <p className="text-white font-semibold text-lg mb-1">
                          {device.device_name}
                        </p>
                        <p className="text-white/60 text-sm">
                          Last used: {formatDate(device.last_used)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeviceLogout(device.device_id, false)}
                      className="px-4 py-2 bg-red-500/10 text-red-400 font-semibold rounded-lg hover:bg-red-500/20 transition-colors border border-red-500/30 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass rounded-2xl p-6 border border-white/10">
              <p className="text-white/60 text-sm text-center">
                No other devices logged in
              </p>
            </div>
          )}
        </div>

        {/* Delete Account */}
        <div className="flex justify-end animate-slide-up">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-6 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all duration-300 hover:scale-105 flex items-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            Delete Account
          </button>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="glass rounded-3xl p-8 max-w-md w-full border border-red-500/30 animate-scale-in">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Delete Account?</h3>
                  <p className="text-white/60 text-sm">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-white/80 mb-6">
                Are you sure you want to delete your account? All your data, subscriptions, and purchase history will be permanently removed.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="flex-1 px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="flex-1 px-6 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Logout All Devices Confirmation Modal */}
        {showLogoutAllConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="glass rounded-3xl p-8 max-w-md w-full border border-red-500/30 animate-scale-in">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Logout All Devices?</h3>
                  <p className="text-white/60 text-sm">Including this device</p>
                </div>
              </div>
              
              <p className="text-white/80 mb-6">
                Are you sure you want to logout from all devices? You will need to login again on all devices including this one.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutAllConfirm(false)}
                  disabled={isLoggingOut}
                  className="flex-1 px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogoutAllDevices}
                  disabled={isLoggingOut}
                  className="flex-1 px-6 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoggingOut ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Logging out...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
                      Logout All
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
