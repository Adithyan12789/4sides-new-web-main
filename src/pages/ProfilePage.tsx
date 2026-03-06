import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Eye,
  EyeOff,
  Plus,
  Camera,
  ChevronDown,
  Upload,
  X,
  Edit2,
  Baby
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { logout, updateProfile, changePassword, setUser } from '@/store/slices/authSlice';
import { useProfile } from '@/contexts/ProfileContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isLoading } = useAppSelector((state) => state.auth);
  const { setActiveProfile } = useProfile();
  const [activeTab, setActiveTab] = useState<'update' | 'manage' | 'password'>('update');
  const [showPassword, setShowPassword] = useState({ old: false, new: false, confirm: false });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manage Profile Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddProfileModalOpen, setIsAddProfileModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<any>(null); // Store the profile being edited
  const [editProfileName, setEditProfileName] = useState('');
  const [isChildProfile, setIsChildProfile] = useState(false);
  const [editProfileImage, setEditProfileImage] = useState<string | null>(null);
  const [editProfileImageFile, setEditProfileImageFile] = useState<File | null>(null);
  const editProfileFileInputRef = useRef<HTMLInputElement>(null);

  // Add Profile States
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileIsChild, setNewProfileIsChild] = useState(false);
  const [newProfileImage, setNewProfileImage] = useState<string | null>(null);
  const [newProfileImageFile, setNewProfileImageFile] = useState<File | null>(null);
  const newProfileFileInputRef = useRef<HTMLInputElement>(null);

  // Profiles list state
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);

  // Form states
  const [profileData, setProfileData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    phone: user?.mobile || user?.phone || '', // Backend uses 'mobile' field
    gender: 'male',
    dob: '',
  });

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || '',
        phone: user.mobile || user.phone || '', // Backend uses 'mobile' field
        gender: 'male',
        dob: '',
      });
      // Set profile image if user has one
      if (user.file_url) {
        setProfileImage(user.file_url);
      }
    }
  }, [user]);

  // Fetch profiles list
  useEffect(() => {
    if (activeTab === 'manage') {
      fetchProfiles();
    }
  }, [activeTab]);

  const fetchProfiles = async () => {
    try {
      setLoadingProfiles(true);
      const response = await api.get('/user-profile-list', {
        params: {
          per_page: 10,
          page: 1
        }
      });
      if (response.data.success || response.data.status) {
        setProfiles(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
      // If endpoint doesn't exist, just show empty list
      setProfiles([]);
    } finally {
      setLoadingProfiles(false);
    }
  };

  const handleEditProfile = (profile: any) => {
    setEditingProfile(profile);
    setEditProfileName(profile.name || '');
    setIsChildProfile(profile.is_child_profile === 1);
    setEditProfileImage(profile.avatar || null);
    setEditProfileImageFile(null);
    setIsEditModalOpen(true);
  };

  const handleSelectProfile = (profile: any) => {
    // Set the active profile in context
    setActiveProfile({
      id: profile.id,
      name: profile.name,
      avatar: profile.avatar,
      is_child_profile: profile.is_child_profile
    });
    
    toast.success(`Switched to ${profile.name}'s profile`);
    
    // Navigate to home page to see filtered content
    navigate('/');
  };

  const handleEditProfileImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setEditProfileImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveEditProfileImage = () => {
    setEditProfileImage(null);
    setEditProfileImageFile(null);
    if (editProfileFileInputRef.current) {
      editProfileFileInputRef.current.value = '';
    }
  };

  const handleNewProfileImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setNewProfileImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveNewProfileImage = () => {
    setNewProfileImage(null);
    setNewProfileImageFile(null);
    if (newProfileFileInputRef.current) {
      newProfileFileInputRef.current.value = '';
    }
  };

  const handleSaveProfileEdit = async () => {
    if (!editProfileName.trim()) {
      toast.error('Please enter a profile name');
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('name', editProfileName.trim());
      formData.append('is_child_profile', isChildProfile ? '1' : '0');
      
      // If editing existing profile, include the profile ID
      if (editingProfile?.id) {
        formData.append('id', editingProfile.id.toString());
      }

      // Add profile image if selected
      if (editProfileImageFile) {
        formData.append('avatar', editProfileImageFile);
      }

      const response = await api.post('/save-userprofile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success || response.data.status) {
        toast.success('Profile updated successfully');
        setIsEditModalOpen(false);
        setEditingProfile(null);
        setEditProfileImage(null);
        setEditProfileImageFile(null);
        
        // Refresh profiles list
        fetchProfiles();
      } else {
        // Show the actual error message from backend
        const errorMsg = response.data.message || response.data.error || 'Failed to update profile';
        toast.error(errorMsg);
      }
    } catch (error: any) {
      // Handle error response from backend
      const status = error?.response?.status;
      
      // Check if it's a device limit error (406)
      if (status === 406) {
        // This is a backend issue - device limit check shouldn't apply to profile updates
        // Provide helpful guidance to the user
        toast.error('Unable to update profile. Please try logging out from other devices in Account Settings and try again.', {
          duration: 6000,
        });
        console.error('Device limit error during profile update - backend incorrectly checking device limits:', error?.response?.data);
      } else {
        const errorMsg = error?.response?.data?.message || 
                         error?.response?.data?.error || 
                         error?.message || 
                         'Failed to update profile';
        toast.error(errorMsg);
      }
      console.error('Profile update error:', error?.response?.data || error);
    } finally {
      setUploading(false);
    }
  };

  const handleAddNewProfile = async () => {
    if (!newProfileName.trim()) {
      toast.error('Please enter a profile name');
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('name', newProfileName);
      formData.append('is_child_profile', newProfileIsChild ? '1' : '0');

      // Add profile image if selected
      if (newProfileImageFile) {
        formData.append('avatar', newProfileImageFile);
      }

      const response = await api.post('/save-userprofile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success || response.data.status) {
        toast.success('Profile created successfully');
        setIsAddProfileModalOpen(false);

        // Reset form
        setNewProfileName('');
        setNewProfileIsChild(false);
        setNewProfileImage(null);
        setNewProfileImageFile(null);

        // Refresh profiles list
        fetchProfiles();
      } else {
        // Show the actual error message from backend
        const errorMsg = response.data.message || response.data.error || 'Failed to create profile';
        toast.error(errorMsg);
      }
    } catch (error: any) {
      // Handle error response from backend
      const status = error?.response?.status;
      
      // Check if it's a device limit error (406)
      if (status === 406) {
        // This is a backend issue - device limit check shouldn't apply to profile creation
        // Provide helpful guidance to the user
        toast.error('Unable to create profile. Please try logging out from other devices in Account Settings and try again.', {
          duration: 6000,
        });
        console.error('Device limit error during profile creation - backend incorrectly checking device limits:', error?.response?.data);
      } else {
        const errorMsg = error?.response?.data?.message || 
                         error?.response?.data?.error || 
                         error?.message || 
                         'Failed to create profile';
        toast.error(errorMsg);
      }
      console.error('Profile creation error:', error?.response?.data || error);
    } finally {
      setUploading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      toast.success('Logged out successfully');
      navigate('/auth');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Logout failed');
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setUploading(true);

      // If there's an image file, upload it with FormData
      if (imageFile) {
        const formData = new FormData();
        formData.append('first_name', profileData.firstName);
        formData.append('last_name', profileData.lastName);
        formData.append('email', profileData.email);
        formData.append('mobile', profileData.phone);
        formData.append('file_url', imageFile); // Backend expects 'file_url'

        const response = await api.post('/update-profile', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data.success || response.data.status) {
          // Update localStorage with new user data
          if (response.data.data) {
            localStorage.setItem('user', JSON.stringify(response.data.data));
            // Trigger a page reload to update the user state
            dispatch(setUser(response.data.data));
          }
          toast.success('Profile updated successfully');
        }
      } else {
        // No image, use regular update
        await dispatch(updateProfile({
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          email: profileData.email,
          mobile: profileData.phone,
        })).unwrap();
        toast.success('Profile updated successfully');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to update profile');
    } finally {
      setUploading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      // Backend expects 'old_password' and 'new_password'
      await dispatch(changePassword({
        old_password: passwordData.oldPassword,
        new_password: passwordData.newPassword,
      })).unwrap();
      toast.success('Password changed successfully');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to change password');
    }
  };

  const renderUpdateProfile = () => (
    <div className="bg-[#1A1A1A]/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 md:p-12 animate-in fade-in slide-in-from-right duration-500">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Profile Picture Section */}
        <div className="flex flex-col items-center gap-6">
          <div className="relative group">
            {/* Profile Image Container */}
            <div className="relative w-40 h-40 md:w-48 md:h-48">
              {/* Animated Border */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#EAB308] via-yellow-400 to-[#EAB308] opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-spin-slow" style={{ padding: '3px' }}>
                <div className="w-full h-full rounded-full bg-[#0F0F0F]" />
              </div>

              {/* Image */}
              <div className="absolute inset-[3px] rounded-full overflow-hidden border-2 border-[#EAB308]/30 group-hover:border-[#EAB308] transition-all duration-300 bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F]">
                <img
                  src={profileImage || `https://ui-avatars.com/api/?name=${profileData.firstName}+${profileData.lastName}&background=EAB308&color=000&size=400`}
                  className="w-full h-full object-cover"
                  alt="Profile"
                />

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-white mx-auto mb-2" />
                    <p className="text-white text-sm font-medium">Change Photo</p>
                  </div>
                </div>
              </div>

              {/* Camera Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-2 w-12 h-12 bg-gradient-to-br from-[#EAB308] to-yellow-600 rounded-full flex items-center justify-center text-black border-4 border-[#0F0F0F] hover:scale-110 transition-transform duration-300 shadow-lg shadow-[#EAB308]/50 z-10"
              >
                <Camera className="w-5 h-5" />
              </button>

              {/* Remove Button (only show if image is selected) */}
              {imageFile && (
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white border-2 border-[#0F0F0F] hover:bg-red-600 transition-colors duration-300 shadow-lg z-10"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          {/* Upload Instructions */}
          <div className="text-center space-y-1">
            <p className="text-white/60 text-xs">Allowed: JPG, PNG, GIF</p>
            <p className="text-white/40 text-xs">Max size: 5MB</p>
          </div>
        </div>

        {/* Form Section */}
        <div className="flex-1 space-y-6">
          <h3 className="text-white font-semibold text-lg mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-gray-400" />
            Profile Details
          </h3>

          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="relative group">
                <User className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-yellow-500 transition-colors" />
                <Input
                  placeholder="First Name"
                  className="bg-transparent border-0 border-b border-white/10 rounded-none pl-8 h-12 focus-visible:ring-0 focus-visible:border-yellow-500 text-white placeholder:text-gray-600 transition-all"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                />
              </div>
              <div className="relative group">
                <User className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-yellow-500 transition-colors" />
                <Input
                  placeholder="Last Name"
                  className="bg-transparent border-0 border-b border-white/10 rounded-none pl-8 h-12 focus-visible:ring-0 focus-visible:border-yellow-500 text-white placeholder:text-gray-600 transition-all"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="relative group">
              <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-yellow-500 transition-colors" />
              <Input
                placeholder="Email Address"
                className="bg-transparent border-0 border-b border-white/10 rounded-none pl-8 h-12 focus-visible:ring-0 focus-visible:border-yellow-500 text-white placeholder:text-gray-600 transition-all"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              />
            </div>

            <div className="flex gap-4">
              <div className="flex items-center gap-2 px-3 border-b border-white/10 h-12 text-gray-400">
                <img src="https://flagcdn.com/w20/in.png" className="w-5" alt="IN" />
                <span className="text-white">+91</span>
                <ChevronDown className="w-4 h-4" />
              </div>
              <div className="relative group flex-1">
                <Phone className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-yellow-500 transition-colors" />
                <Input
                  placeholder="Phone Number"
                  className="bg-transparent border-0 border-b border-white/10 rounded-none pl-8 h-12 focus-visible:ring-0 focus-visible:border-yellow-500 text-white placeholder:text-gray-600 transition-all"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-6">
                <User className="w-5 h-5 text-gray-500" />
                <div className="flex gap-6">
                  {['Male', 'Female', 'Other'].map((gender) => (
                    <label key={gender} className="flex items-center gap-2 cursor-pointer group">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${profileData.gender === gender.toLowerCase() ? 'border-yellow-500' : 'border-gray-600 group-hover:border-gray-400'}`}>
                        {profileData.gender === gender.toLowerCase() && <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />}
                      </div>
                      <input
                        type="radio"
                        className="hidden"
                        name="gender"
                        checked={profileData.gender === gender.toLowerCase()}
                        onChange={() => setProfileData({ ...profileData, gender: gender.toLowerCase() })}
                      />
                      <span className="text-sm text-gray-400 group-hover:text-white transition-colors">{gender}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative group pt-4">
              <Calendar className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-yellow-500 transition-colors" />
              <Input
                type="date"
                className="bg-transparent border-0 border-b border-white/10 rounded-none pl-8 h-12 focus-visible:ring-0 focus-visible:border-yellow-500 text-white placeholder:text-gray-600 transition-all"
                value={profileData.dob}
                onChange={(e) => setProfileData({ ...profileData, dob: e.target.value })}
              />
            </div>

            <div className="flex justify-end pt-8">
              <Button
                onClick={handleUpdateProfile}
                disabled={isLoading || uploading}
                className="bg-gradient-to-r from-[#EAB308] to-yellow-600 hover:from-yellow-600 hover:to-[#EAB308] text-black font-bold min-w-[140px] h-12 rounded-xl shadow-lg shadow-yellow-500/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Uploading...
                  </span>
                ) : isLoading ? (
                  'Updating...'
                ) : (
                  'Update Profile'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderManageProfiles = () => (
    <div className="bg-[#1A1A1A]/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 md:p-12 animate-in fade-in slide-in-from-right duration-500">
      <h3 className="text-white font-semibold text-lg mb-8">Manage Profiles</h3>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profiles List */}
        {loadingProfiles ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-[#EAB308] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : profiles.length > 0 ? (
          <div className="space-y-4">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="relative group bg-gradient-to-br from-[#1A1A1A]/80 to-[#0F0F0F]/80 rounded-2xl p-6 border border-white/5 hover:border-[#EAB308]/20 transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Profile Image */}
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-[#EAB308]/50 to-[#FACC15]/50 flex items-center justify-center shadow-lg ring-2 ring-white/5">
                      {profile.avatar ? (
                        <img
                          src={profile.avatar}
                          alt={profile.name || 'Profile'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={profile.avatar ? 'hidden' : ''}>
                        <User className="w-10 h-10 text-white" />
                      </div>
                    </div>
                    {profile.is_child_profile === 1 && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-[#1A1A1A]">
                        <Baby className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Profile Details */}
                  <div className="flex-1 text-center sm:text-left">
                    <h4 className="text-lg font-bold text-white mb-2">
                      {profile.name}
                    </h4>
                    <div className="flex gap-2 mt-2 justify-center sm:justify-start">
                      <span className="px-2 py-1 bg-white/5 rounded-lg text-xs text-white/60">
                        {profile.is_child_profile === 1 ? 'Child Profile' : 'Adult Profile'}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleSelectProfile(profile)}
                      className="group/btn flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/10 transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                      <User className="w-4 h-4" />
                      <span>Use Profile</span>
                    </button>
                    <button
                      onClick={() => handleEditProfile(profile)}
                      className="group/btn flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#EAB308] to-yellow-600 hover:from-yellow-600 hover:to-[#EAB308] text-black font-bold rounded-xl shadow-lg shadow-[#EAB308]/30 transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
              <User className="w-10 h-10 text-white/20" />
            </div>
            <h3 className="text-white text-xl font-bold mb-2">No Profiles Yet</h3>
            <p className="text-white/40 max-w-md mx-auto">
              Create your first profile to get started
            </p>
          </div>
        )}

        {/* Add More Profile Card */}
        <button
          onClick={() => setIsAddProfileModalOpen(true)}
          className="group w-full bg-gradient-to-br from-[#1A1A1A]/50 to-[#0F0F0F]/50 rounded-3xl p-12 border-2 border-dashed border-white/10 hover:border-[#EAB308]/50 transition-all duration-300 hover:bg-white/5"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center group-hover:border-[#EAB308]/50 group-hover:bg-[#EAB308]/10 group-hover:scale-110 transition-all duration-300">
              <Plus className="w-10 h-10 text-white/40 group-hover:text-[#EAB308] transition-colors" />
            </div>
            <div>
              <p className="text-white font-bold text-lg mb-1">Add New Profile</p>
              <p className="text-white/40 text-sm">Create additional profile for family members</p>
            </div>
          </div>
        </button>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-2xl bg-[#1A1A1A] rounded-3xl border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300">
            {/* Close Button */}
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all duration-300 z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Content */}
            <div className="p-8 md:p-12">
              <h3 className="text-2xl font-bold text-white mb-8">Edit Profile</h3>

              <div className="space-y-6">
                {/* Profile Image Upload */}
                <div className="flex flex-col items-center gap-4 mb-6">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-[#EAB308]/50 to-[#FACC15]/50 flex items-center justify-center shadow-lg ring-2 ring-white/10 group-hover:ring-[#EAB308]/50 transition-all">
                      {editProfileImage ? (
                        <img
                          src={editProfileImage}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-16 h-16 text-white" />
                      )}
                      
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-full">
                        <div className="text-center">
                          <Upload className="w-6 h-6 text-white mx-auto mb-1" />
                          <p className="text-white text-xs font-medium">Change Photo</p>
                        </div>
                      </div>
                    </div>

                    {/* Camera Button */}
                    <button
                      onClick={() => editProfileFileInputRef.current?.click()}
                      type="button"
                      className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-br from-[#EAB308] to-yellow-600 rounded-full flex items-center justify-center text-black border-4 border-[#1A1A1A] hover:scale-110 transition-transform duration-300 shadow-lg shadow-[#EAB308]/50"
                    >
                      <Camera className="w-5 h-5" />
                    </button>

                    {/* Remove Button */}
                    {editProfileImageFile && (
                      <button
                        onClick={handleRemoveEditProfileImage}
                        type="button"
                        className="absolute top-0 right-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white border-2 border-[#1A1A1A] hover:bg-red-600 transition-colors duration-300 shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}

                    {/* Hidden File Input */}
                    <input
                      ref={editProfileFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleEditProfileImageSelect}
                      className="hidden"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-white/60 text-xs">Allowed: JPG, PNG, GIF</p>
                    <p className="text-white/40 text-xs">Max size: 5MB</p>
                  </div>
                </div>

                {/* Profile Name Field */}
                <div className="space-y-2">
                  <label className="text-white/70 text-sm font-medium">Profile Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-[#EAB308] transition-colors" />
                    <Input
                      placeholder="Enter profile name"
                      className="bg-white/5 border-white/10 h-12 rounded-xl pl-12 focus-visible:ring-1 focus-visible:ring-[#EAB308]/50 text-white placeholder:text-white/40"
                      value={editProfileName}
                      onChange={(e) => setEditProfileName(e.target.value)}
                    />
                  </div>
                </div>

                {/* Children Profile Toggle */}
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#EAB308]/10 flex items-center justify-center">
                      <Baby className="w-5 h-5 text-[#EAB308]" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Children Profile</p>
                      <p className="text-white/40 text-xs">Enable kid-friendly content only</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsChildProfile(!isChildProfile)}
                    className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${isChildProfile ? 'bg-[#EAB308]' : 'bg-white/20'
                      }`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform duration-300 ${isChildProfile ? 'translate-x-7' : 'translate-x-0'
                        }`}
                    />
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 h-12 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-bold transition-all"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveProfileEdit}
                    disabled={uploading}
                    className="flex-1 h-12 bg-gradient-to-r from-[#EAB308] to-yellow-600 hover:from-yellow-600 hover:to-[#EAB308] text-black font-bold rounded-xl shadow-lg shadow-[#EAB308]/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                  >
                    {uploading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        Saving...
                      </span>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Profile Modal */}
      {isAddProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-2xl bg-[#1A1A1A] rounded-3xl border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300">
            {/* Close Button */}
            <button
              onClick={() => setIsAddProfileModalOpen(false)}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all duration-300 z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Content */}
            <div className="p-8 md:p-12">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-[#EAB308]/10 flex items-center justify-center">
                  <Plus className="w-6 h-6 text-[#EAB308]" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Add New Profile</h3>
                  <p className="text-white/50 text-sm">Create a profile for family member</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Profile Image Upload */}
                <div className="flex flex-col items-center gap-4 mb-6">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-[#EAB308]/50 to-[#FACC15]/50 flex items-center justify-center shadow-lg ring-2 ring-white/10 group-hover:ring-[#EAB308]/50 transition-all">
                      {newProfileImage ? (
                        <img
                          src={newProfileImage}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-16 h-16 text-white" />
                      )}
                      
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-full">
                        <div className="text-center">
                          <Upload className="w-6 h-6 text-white mx-auto mb-1" />
                          <p className="text-white text-xs font-medium">Add Photo</p>
                        </div>
                      </div>
                    </div>

                    {/* Camera Button */}
                    <button
                      onClick={() => newProfileFileInputRef.current?.click()}
                      type="button"
                      className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-br from-[#EAB308] to-yellow-600 rounded-full flex items-center justify-center text-black border-4 border-[#1A1A1A] hover:scale-110 transition-transform duration-300 shadow-lg shadow-[#EAB308]/50"
                    >
                      <Camera className="w-5 h-5" />
                    </button>

                    {/* Remove Button */}
                    {newProfileImageFile && (
                      <button
                        onClick={handleRemoveNewProfileImage}
                        type="button"
                        className="absolute top-0 right-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white border-2 border-[#1A1A1A] hover:bg-red-600 transition-colors duration-300 shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}

                    {/* Hidden File Input */}
                    <input
                      ref={newProfileFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleNewProfileImageSelect}
                      className="hidden"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-white/60 text-xs">Allowed: JPG, PNG, GIF</p>
                    <p className="text-white/40 text-xs">Max size: 5MB</p>
                  </div>
                </div>

                {/* Profile Name */}
                <div className="space-y-2">
                  <label className="text-white/70 text-sm font-medium">Profile Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-[#EAB308] transition-colors" />
                    <Input
                      placeholder="Enter profile name"
                      className="bg-white/5 border-white/10 h-12 rounded-xl pl-12 focus-visible:ring-1 focus-visible:ring-[#EAB308]/50 text-white placeholder:text-white/40"
                      value={newProfileName}
                      onChange={(e) => setNewProfileName(e.target.value)}
                    />
                  </div>
                </div>

                {/* Children Profile Toggle */}
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#EAB308]/10 flex items-center justify-center">
                      <Baby className="w-5 h-5 text-[#EAB308]" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Children Profile</p>
                      <p className="text-white/40 text-xs">Enable kid-friendly content only</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setNewProfileIsChild(!newProfileIsChild)}
                    className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${newProfileIsChild ? 'bg-[#EAB308]' : 'bg-white/20'
                      }`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform duration-300 ${newProfileIsChild ? 'translate-x-7' : 'translate-x-0'
                        }`}
                    />
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    onClick={() => setIsAddProfileModalOpen(false)}
                    className="flex-1 h-12 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-bold transition-all"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddNewProfile}
                    disabled={uploading}
                    className="flex-1 h-12 bg-gradient-to-r from-[#EAB308] to-yellow-600 hover:from-yellow-600 hover:to-[#EAB308] text-black font-bold rounded-xl shadow-lg shadow-[#EAB308]/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                  >
                    {uploading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        Creating...
                      </span>
                    ) : (
                      'Create Profile'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderChangePassword = () => (
    <div className="bg-[#1A1A1A]/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 md:p-12 animate-in fade-in slide-in-from-right duration-500">
      <h3 className="text-white font-semibold text-lg mb-8">Update your Password</h3>
      <div className="max-w-2xl space-y-6">
        <div className="relative group">
          <Input
            type={showPassword.old ? 'text' : 'password'}
            placeholder="Old Password"
            className="bg-[#0F0F0F] border-white/5 h-16 rounded-2xl px-6 focus-visible:ring-1 focus-visible:ring-yellow-500/50 text-white placeholder:text-gray-600"
            value={passwordData.oldPassword}
            onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
          />
          <button
            onClick={() => setShowPassword({ ...showPassword, old: !showPassword.old })}
            className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
          >
            {showPassword.old ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <div className="relative group">
          <Input
            type={showPassword.new ? 'text' : 'password'}
            placeholder="New Password"
            className="bg-[#0F0F0F] border-white/5 h-16 rounded-2xl px-6 focus-visible:ring-1 focus-visible:ring-yellow-500/50 text-white placeholder:text-gray-600"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
          />
          <button
            onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
            className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
          >
            {showPassword.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <div className="relative group">
          <Input
            type={showPassword.confirm ? 'text' : 'password'}
            placeholder="Confirm Password"
            className="bg-[#0F0F0F] border-white/5 h-16 rounded-2xl px-6 focus-visible:ring-1 focus-visible:ring-yellow-500/50 text-white placeholder:text-gray-600"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
          />
          <button
            onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
            className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
          >
            {showPassword.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            onClick={handleChangePassword}
            disabled={isLoading}
            className="bg-gradient-to-r from-[#EAB308] to-yellow-600 hover:from-yellow-600 hover:to-[#EAB308] text-black font-bold min-w-[140px] h-12 rounded-xl shadow-lg shadow-yellow-500/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Updating...
              </span>
            ) : (
              'Update Password'
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-32 pb-20 px-4 md:px-8 xl:px-12">
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">Edit Profile</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-[350px] shrink-0 space-y-4">
            <button
              onClick={() => setActiveTab('update')}
              className={`w-full h-[60px] rounded-2xl font-bold text-lg transition-all duration-300 ${activeTab === 'update' ? 'bg-yellow-500 text-black shadow-xl shadow-yellow-500/20' : 'bg-[#1A1A1A] text-white/70 hover:bg-white/5 hover:text-white'}`}
            >
              Update Profile
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`w-full h-[60px] rounded-2xl font-bold text-lg transition-all duration-300 ${activeTab === 'manage' ? 'bg-yellow-500 text-black shadow-xl shadow-yellow-500/20' : 'bg-[#1A1A1A] text-white/70 hover:bg-white/5 hover:text-white'}`}
            >
              Manage Profiles
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`w-full h-[60px] rounded-2xl font-bold text-lg transition-all duration-300 ${activeTab === 'password' ? 'bg-yellow-500 text-black shadow-xl shadow-yellow-500/20' : 'bg-[#1A1A1A] text-white/70 hover:bg-white/5 hover:text-white'}`}
            >
              Change Password
            </button>

            <div className="pt-8">
              <button
                onClick={handleLogout}
                className="w-full h-[60px] rounded-2xl font-bold text-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all duration-300 hover:scale-[1.02] active:scale-95"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === 'update' && renderUpdateProfile()}
            {activeTab === 'manage' && renderManageProfiles()}
            {activeTab === 'password' && renderChangePassword()}
          </div>
        </div>
      </div>
    </div>
  );
}
