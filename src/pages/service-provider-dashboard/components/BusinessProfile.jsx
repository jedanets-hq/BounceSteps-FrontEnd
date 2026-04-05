import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../contexts/AuthContext';
import { API_URL } from '../../../utils/api';

const BusinessProfile = () => {
  const { user, updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileImage, setProfileImage] = useState(user?.profileImage || null);
  const fileInputRef = useRef(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    // All fields editable
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    companyName: user?.companyName || user?.businessName || '',
    businessType: user?.businessType || '',
    serviceLocation: user?.serviceLocation || '',
    serviceCategories: user?.serviceCategories || [],
    locationData: user?.locationData || {
      region: '',
      district: '',
      ward: '',
      street: ''
    },
    description: user?.description || ''
  });

  // Fetch fresh profile data from backend
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Debug user object
  useEffect(() => {
    console.log('🔍 Current user object:', user);
    console.log('📋 User fields available:', Object.keys(user || {}));
    if (user) {
      console.log('📞 Phone:', user.phone);
      console.log('🏢 Company:', user.companyName || user.businessName);
      console.log('📍 Location:', user.serviceLocation);
      console.log('🗺️ Location Data:', user.locationData);
      console.log('🏷️ Categories:', user.serviceCategories);
      console.log('📝 Description:', user.description);
    }
  }, [user]);

  // Fetch fresh profile data from backend on mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoadingProfile(true);
        const userData = JSON.parse(localStorage.getItem('isafari_user') || '{}');
        const token = userData.token;

        if (!token) return;

        const response = await fetch(`${API_URL}/users/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        console.log('📥 Fresh profile data from backend:', data);

        if (data.success && data.user) {
          const freshUser = data.user;
          setProfileData({
            firstName: freshUser.firstName || '',
            lastName: freshUser.lastName || '',
            email: freshUser.email || '',
            phone: freshUser.phone || '',
            companyName: freshUser.companyName || freshUser.businessName || '',
            businessType: freshUser.businessType || '',
            serviceLocation: freshUser.serviceLocation || '',
            serviceCategories: freshUser.serviceCategories || [],
            locationData: freshUser.locationData || {
              region: '',
              district: '',
              ward: '',
              street: ''
            },
            description: freshUser.description || ''
          });
          console.log('✅ Profile data updated from backend');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    if (user?.id) {
      fetchProfileData();
    }
  }, [user?.id]);

  // Update profileData when user changes (fallback)
  useEffect(() => {
    if (user && !isLoadingProfile) {
      setProfileData(prev => ({
        ...prev,
        firstName: prev.firstName || user?.firstName || '',
        lastName: prev.lastName || user?.lastName || '',
        email: prev.email || user?.email || '',
        phone: prev.phone || user?.phone || '',
        companyName: prev.companyName || user?.companyName || user?.businessName || '',
        businessType: prev.businessType || user?.businessType || '',
        serviceLocation: prev.serviceLocation || user?.serviceLocation || '',
        serviceCategories: prev.serviceCategories?.length > 0 ? prev.serviceCategories : (user?.serviceCategories || []),
        locationData: prev.locationData?.region ? prev.locationData : (user?.locationData || {
          region: '',
          district: '',
          ward: '',
          street: ''
        }),
        description: prev.description || user?.description || ''
      }));
    }
  }, [user, isLoadingProfile]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size should be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      console.log('📝 Saving profile with data:', profileData);
      
      // Validate required fields
      if (!profileData.firstName || !profileData.lastName) {
        alert('❌ First name and last name are required');
        return;
      }
      
      // Get token from localStorage
      const userData = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      const token = userData.token;
      
      if (!token) {
        alert('❌ Authentication required. Please login again.');
        logout();
        return;
      }
      
      // Prepare user data (for users table) - backend expects snake_case
      const userUpdateData = { 
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        phone: profileData.phone,
        avatar_url: profileImage
      };
      
      console.log('📤 Updating user data:', userUpdateData);
      
      // Update user profile directly with fetch to ensure proper error handling
      const userResponse = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userUpdateData)
      });
      
      const userResult = await userResponse.json();
      
      if (!userResult.success) {
        console.error('❌ User update failed:', userResult);
        alert('❌ Failed to update profile: ' + (userResult.message || userResult.error || 'Unknown error'));
        return;
      }
      
      console.log('✅ User profile updated successfully');
      
      // Prepare provider data (for service_providers table)
      // NOTE: service_location and service_categories are FIXED from registration
      const providerData = {
        business_name: profileData.companyName,
        business_type: profileData.businessType,
        description: profileData.description
      };
      
      console.log('📤 Updating provider data (location & categories remain fixed):', providerData);
      
      // Update provider profile
      const providerResponse = await fetch(`${API_URL}/users/business-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(providerData)
      });
      
      const providerResult = await providerResponse.json();
      
      if (!providerResult.success) {
        console.error('❌ Provider update failed:', providerResult);
        alert('❌ Failed to update business profile: ' + (providerResult.message || 'Unknown error'));
        return;
      }
      
      console.log('✅ Business profile updated successfully');
      
      // Update localStorage with new data
      const currentUser = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      const updatedUser = {
        ...currentUser,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        profileImage: profileImage,
        avatar_url: profileImage,
        companyName: profileData.companyName,
        businessName: profileData.companyName,
        businessType: profileData.businessType,
        serviceLocation: profileData.serviceLocation,
        serviceCategories: profileData.serviceCategories,
        locationData: profileData.locationData,
        description: profileData.description
      };
      localStorage.setItem('isafari_user', JSON.stringify(updatedUser));
      
      // Trigger custom event to update AuthContext (works in same tab)
      window.dispatchEvent(new CustomEvent('user-updated'));
      
      setIsEditing(false);
      alert('✅ Profile updated successfully!');
      
      // Refresh profile data from backend to ensure consistency
      const profileResponse = await fetch(`${API_URL}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const freshProfileData = await profileResponse.json();
      if (freshProfileData.success && freshProfileData.user) {
        const freshUser = {
          ...updatedUser,
          ...freshProfileData.user,
          profileImage: profileImage || freshProfileData.user.avatar_url
        };
        localStorage.setItem('isafari_user', JSON.stringify(freshUser));
        window.dispatchEvent(new CustomEvent('user-updated'));
      }
    } catch (error) {
      console.error('❌ Profile update error:', error);
      alert('❌ Failed to update profile. Please try again. Error: ' + error.message);
    }
  };

  const handleChangePassword = async () => {
    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        alert('New passwords do not match!');
        return;
      }

      if (passwordData.newPassword.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
      }

      setIsSavingPassword(true);
      
      const userData = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      const token = userData.token;

      if (!token) {
        alert('Please login again');
        return;
      }

      const response = await fetch(`${API_URL}/users/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setIsChangingPassword(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        alert('Password changed successfully!');
      } else {
        alert('Failed to change password: ' + data.message);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('An error occurred while changing password.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  if (!isEditing) {
    return (
      <>
        <div className="space-y-6">
          {/* Header with Profile Picture */}
          <div className="bg-gradient-to-r from-primary via-secondary to-accent rounded-xl p-6 text-white">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="relative flex justify-center sm:justify-start">
                  <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-lg overflow-hidden" style={{ minWidth: '5rem', minHeight: '5rem' }}>
                    <img 
                      src={profileImage || user?.profileImage || `https://ui-avatars.com/api/?name=${user?.firstName || 'User'}+${user?.lastName || ''}&background=0D8ABC&color=fff&size=128`} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    />
                  </div>
                  <div className="absolute bottom-0 right-0 w-5 h-5 sm:w-7 sm:h-7 bg-green-500 rounded-full border-2 sm:border-3 border-white"></div>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="font-display text-xl sm:text-2xl font-bold mb-1">{user?.firstName || 'Provider'} {user?.lastName || ''}</h3>
                  <p className="text-white/90 capitalize mb-2">{user?.userType || 'Service Provider'}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm space-y-1 sm:space-y-0">
                    <span className="flex items-center justify-center sm:justify-start">
                      <Icon name="Mail" size={14} className="mr-1" />
                      <span className="truncate">{user?.email}</span>
                    </span>
                    <span className="flex items-center justify-center sm:justify-start">
                      <Icon name="Hash" size={14} className="mr-1" />
                      ID: {user?.id}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col space-y-2 w-full sm:w-auto">
                <Button variant="default" size="sm" className="bg-white text-primary hover:bg-white/90 w-full sm:w-auto" onClick={() => setIsEditing(true)}>
                  <Icon name="Edit" size={14} />
                  <span className="ml-2">Edit Profile</span>
                </Button>
                <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/20 hover:bg-white/20 w-full sm:w-auto" onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsChangingPassword(true);
                }}>
                  <Icon name="Lock" size={14} />
                  <span className="ml-2">Change Password</span>
                </Button>
                <Button variant="destructive" size="sm" className="bg-red-500 text-white hover:bg-red-600 w-full sm:w-auto" onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (confirm('Are you sure you want to sign out?')) {
                    logout();
                  }
                }}>
                  <Icon name="LogOut" size={14} />
                  <span className="ml-2">Sign Out</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Section 1: USER INFORMATION */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center mb-6 pb-2 border-b border-border">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                <Icon name="User" size={20} className="text-primary" />
              </div>
              <h4 className="font-display text-lg font-bold tracking-tight uppercase">USER INFORMATION</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Jina</label>
                <p className="text-foreground font-semibold text-base">{profileData.firstName} {profileData.lastName}</p>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Biashara</label>
                <p className="text-foreground font-semibold text-base">{profileData.companyName || 'Not provided'}</p>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Email</label>
                <p className="text-foreground font-semibold text-base flex items-center truncate">
                  <Icon name="Mail" size={14} className="mr-2 text-primary shrink-0" />
                  {user?.email}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Simu</label>
                <p className="text-foreground font-semibold text-base flex items-center">
                  <Icon name="Phone" size={14} className="mr-2 text-primary shrink-0" />
                  {profileData.phone || user?.phone || 'Not provided'}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: SERVICE LOCATION & Categories */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center mb-6 pb-2 border-b border-border">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mr-3">
                <Icon name="MapPin" size={20} className="text-accent" />
              </div>
              <h4 className="font-display text-lg font-bold tracking-tight uppercase">SERVICE LOCATION & Categories</h4>
            </div>
            
            <div className="space-y-8">
              {/* Location Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Region</label>
                  <p className="text-foreground font-semibold text-base">{profileData.locationData?.region || 'Not provided'}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">District</label>
                  <p className="text-foreground font-semibold text-base">{profileData.locationData?.district || 'Not provided'}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Ward</label>
                  <p className="text-foreground font-semibold text-base">{profileData.locationData?.ward || 'Not provided'}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Street</label>
                  <p className="text-foreground font-semibold text-base">{profileData.locationData?.street || 'Not provided'}</p>
                </div>
              </div>

              {/* Full Location Summary */}
              {profileData.serviceLocation && (
                <div className="p-3 bg-muted/30 rounded-lg border border-border inline-flex items-center">
                  <Icon name="MapPin" size={14} className="text-accent mr-2" />
                  <span className="text-sm text-foreground italic">{profileData.serviceLocation}</span>
                </div>
              )}

              {/* Categories */}
              <div className="space-y-4 pt-4 border-t border-dashed border-border">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest block">SERVICE CATEGORIES</label>
                {profileData.serviceCategories && profileData.serviceCategories.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profileData.serviceCategories.map((category, index) => (
                      <span key={index} className="px-3 py-1.5 bg-secondary/10 text-secondary border border-secondary/20 rounded-lg text-sm font-bold flex items-center">
                        <Icon name="Briefcase" size={14} className="mr-1" />
                        {category}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No categories selected</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: BUSINESS DETAILS */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center mb-6 pb-2 border-b border-border">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                <Icon name="Building" size={20} className="text-primary" />
              </div>
              <h4 className="font-display text-lg font-bold tracking-tight uppercase">BUSINESS DETAILS</h4>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Business Type</label>
                  <p className="text-foreground font-semibold text-base">{profileData.businessType || 'General Services'}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Account Status</label>
                  <p className="text-foreground font-semibold text-base flex items-center">
                    <span className={`w-2.5 h-2.5 rounded-full mr-2 ${user?.isVerified ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]'}`}></span>
                    {user?.isVerified ? 'Verified' : 'Pending Verification'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2 pt-4 border-t border-dashed border-border">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest block">Business Description</label>
                <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                  <p className="text-foreground leading-relaxed italic text-sm">
                    {profileData.description || 'No description provided. Add a description to help travelers understand your services better.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: ADDITIONAL CONTACT */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center mb-6 pb-2 border-b border-border">
              <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center mr-3">
                <Icon name="MessageCircle" size={20} className="text-secondary" />
              </div>
              <h4 className="font-display text-lg font-bold tracking-tight uppercase">ADDITIONAL CONTACT</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-8 gap-y-6">
              <div className="flex items-center space-x-4 p-3 bg-muted/20 rounded-xl border border-border/40">
                <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center shrink-0">
                  <Icon name="MessageCircle" size={20} className="text-green-500" />
                </div>
                <div className="space-y-0.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">WhatsApp Number</label>
                  <p className="text-foreground font-bold text-base">{profileData.whatsapp || profileData.phone || 'Not provided'}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-3 bg-muted/20 rounded-xl border border-border/40">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <Icon name="Globe" size={20} className="text-primary" />
                </div>
                <div className="space-y-0.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Website/Social Media</label>
                  <p className="text-foreground font-bold text-base">{profileData.website || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Modal - Outside of view mode div */}
        {isChangingPassword && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-xl max-w-md w-full">
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Change Password</h2>
                  <button onClick={() => setIsChangingPassword(false)} className="p-2 hover:bg-muted rounded-lg">
                    <Icon name="X" size={20} />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setIsChangingPassword(false)}>
                    Cancel
                  </Button>
                  <Button className="flex-1" onClick={handleChangePassword} disabled={isSavingPassword}>
                    {isSavingPassword ? <Icon name="Loader2" size={16} className="animate-spin mr-2" /> : null}
                    Change Password
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h3 className="font-display text-xl font-medium">Edit Business Profile</h3>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1 sm:flex-none">
            Cancel
          </Button>
          <Button variant="default" onClick={handleSave} className="flex-1 sm:flex-none">
            <Icon name="Save" size={16} />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Profile Picture Upload */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h4 className="font-medium text-foreground mb-4">Profile Picture</h4>
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-28 h-28 rounded-full border-4 border-primary/20 overflow-hidden" style={{ minWidth: '7rem', minHeight: '7rem' }}>
              <img 
                src={profileImage || user?.profileImage || `https://ui-avatars.com/api/?name=${user?.firstName || 'User'}+${user?.lastName || ''}&background=0D8ABC&color=fff&size=128`} 
                alt="Profile" 
                className="w-full h-full object-cover"
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              />
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary/90 transition-colors"
            >
              <Icon name="Camera" size={16} />
            </button>
          </div>
          <div>
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload}
              className="hidden"
            />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Icon name="Upload" size={16} />
              Upload New Photo
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              JPG, PNG or GIF (max 2MB)
            </p>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h4 className="font-medium text-foreground mb-4 flex items-center">
          <Icon name="User" size={20} className="mr-2 text-primary" />
          Personal Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">First Name *</label>
            <input
              type="text"
              value={profileData.firstName}
              onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              placeholder="First name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Last Name *</label>
            <input
              type="text"
              value={profileData.lastName}
              onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              placeholder="Last name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email Address *</label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({...profileData, email: e.target.value})}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              placeholder="email@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Phone Number *</label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              placeholder="+255 123 456 789"
              required
            />
          </div>
        </div>
      </div>

      {/* Company/Business Information */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h4 className="font-medium text-foreground mb-4 flex items-center">
          <Icon name="Building" size={20} className="mr-2 text-primary" />
          Company/Business Information
        </h4>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Company/Business Name *</label>
          <input
            type="text"
            value={profileData.companyName}
            onChange={(e) => setProfileData({...profileData, companyName: e.target.value})}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
            placeholder="Your business name"
            required
          />
        </div>
      </div>

      {/* Business Description */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h4 className="font-medium text-foreground mb-4 flex items-center">
          <Icon name="FileText" size={20} className="mr-2 text-primary" />
          Business Description
        </h4>
        <div>
          <textarea
            value={profileData.description}
            onChange={(e) => setProfileData({...profileData, description: e.target.value})}
            rows={5}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
            placeholder="Describe your business and services..."
          />
          <p className="text-xs text-muted-foreground mt-2">
            Tell potential customers about your business, services, and what makes you unique.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BusinessProfile;
