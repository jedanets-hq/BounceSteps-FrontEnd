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
    description: user?.description || '',
    // Payment Methods - Global for all services
    paymentMethods: user?.paymentMethods || {
      bankTransfer: { enabled: false, bankName: '', accountName: '', accountNumber: '', swiftCode: '' }
    },
    // Contact Info - Global for all services
    contactInfo: user?.contactInfo || {
      email: { enabled: true, address: user?.email || '' },
      whatsapp: { enabled: false, number: user?.phone || '' }
    }
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
            description: freshUser.description || '',
            paymentMethods: freshUser.paymentMethods || {
              bankTransfer: { enabled: false, bankName: '', accountName: '', accountNumber: '', swiftCode: '' }
            },
            contactInfo: freshUser.contactInfo || {
              email: { enabled: true, address: freshUser.email || '' },
              whatsapp: { enabled: false, number: freshUser.phone || '' }
            }
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
        description: profileData.description,
        payment_methods: profileData.paymentMethods,
        contact_info: profileData.contactInfo
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
        description: profileData.description,
        paymentMethods: profileData.paymentMethods,
        contactInfo: profileData.contactInfo
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

          {/* Section 4: PAYMENT METHODS & CONTACT INFO */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center mb-6 pb-2 border-b border-border">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center mr-3">
                <Icon name="CreditCard" size={20} className="text-green-600" />
              </div>
              <h4 className="font-display text-lg font-bold tracking-tight uppercase">PAYMENT & CONTACT SETTINGS</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-6 bg-primary/5 p-3 rounded-lg border border-primary/20">
              <Icon name="Info" size={16} className="inline mr-2 text-primary" />
              These settings apply to ALL your services. Update them here once, and they'll be used across all service listings.
            </p>
            
            <div className="space-y-8">
              {/* Payment Methods */}
              <div>
                <h5 className="text-sm font-bold text-foreground mb-4 flex items-center">
                  <Icon name="CreditCard" size={16} className="mr-2 text-primary" />
                  PAYMENT METHODS
                </h5>
                <div className="space-y-4">
                  {/* Bank Transfer */}
                  <div className={`p-4 rounded-lg border ${profileData.paymentMethods?.bankTransfer?.enabled ? 'border-green-500 bg-green-50/50' : 'border-border bg-muted/20'}`}>
                    <div className="flex items-center mb-2">
                      <Icon name="Building" size={18} className="mr-2 text-primary" />
                      <span className="font-semibold text-foreground">Bank Transfer</span>
                      <span className={`ml-auto text-xs px-2 py-1 rounded ${profileData.paymentMethods?.bankTransfer?.enabled ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                        {profileData.paymentMethods?.bankTransfer?.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    {profileData.paymentMethods?.bankTransfer?.enabled && (
                      <div className="mt-3 space-y-2 text-sm">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-muted-foreground">Bank:</span>
                            <p className="font-medium">{profileData.paymentMethods.bankTransfer.bankName || 'Not set'}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Account Name:</span>
                            <p className="font-medium">{profileData.paymentMethods.bankTransfer.accountName || 'Not set'}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Account Number:</span>
                            <p className="font-medium">{profileData.paymentMethods.bankTransfer.accountNumber || 'Not set'}</p>
                          </div>
                          {profileData.paymentMethods.bankTransfer.swiftCode && (
                            <div>
                              <span className="text-muted-foreground">SWIFT Code:</span>
                              <p className="font-medium">{profileData.paymentMethods.bankTransfer.swiftCode}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="pt-4 border-t border-dashed border-border">
                <h5 className="text-sm font-bold text-foreground mb-4 flex items-center">
                  <Icon name="MessageCircle" size={16} className="mr-2 text-green-600" />
                  CONTACT INFORMATION
                </h5>
                <div className="space-y-4">
                  {/* Email */}
                  <div className={`p-4 rounded-lg border ${profileData.contactInfo?.email?.enabled ? 'border-green-500 bg-green-50/50' : 'border-border bg-muted/20'}`}>
                    <div className="flex items-center mb-2">
                      <Icon name="Mail" size={18} className="mr-2 text-primary" />
                      <span className="font-semibold text-foreground">Email Contact</span>
                      <span className={`ml-auto text-xs px-2 py-1 rounded ${profileData.contactInfo?.email?.enabled ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                        {profileData.contactInfo?.email?.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    {profileData.contactInfo?.email?.enabled && (
                      <p className="text-sm font-medium mt-2">{profileData.contactInfo.email.address || 'Not set'}</p>
                    )}
                  </div>

                  {/* WhatsApp */}
                  <div className={`p-4 rounded-lg border ${profileData.contactInfo?.whatsapp?.enabled ? 'border-green-500 bg-green-50/50' : 'border-border bg-muted/20'}`}>
                    <div className="flex items-center mb-2">
                      <Icon name="MessageCircle" size={18} className="mr-2 text-green-500" />
                      <span className="font-semibold text-foreground">WhatsApp Contact</span>
                      <span className={`ml-auto text-xs px-2 py-1 rounded ${profileData.contactInfo?.whatsapp?.enabled ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                        {profileData.contactInfo?.whatsapp?.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    {profileData.contactInfo?.whatsapp?.enabled && (
                      <p className="text-sm font-medium mt-2">{profileData.contactInfo.whatsapp.number || 'Not set'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: ADDITIONAL CONTACT */}
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
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
        <h4 className="font-medium text-foreground mb-4">Profile Picture</h4>
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-primary/20 overflow-hidden" style={{ minWidth: '5rem', minHeight: '5rem' }}>
              <img 
                src={profileImage || user?.profileImage || `https://ui-avatars.com/api/?name=${user?.firstName || 'User'}+${user?.lastName || ''}&background=0D8ABC&color=fff&size=128`} 
                alt="Profile" 
                className="w-full h-full object-cover"
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              />
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary/90 transition-colors"
            >
              <Icon name="Camera" size={14} />
            </button>
          </div>
          <div className="flex-1 w-full text-center sm:text-left">
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload}
              className="hidden"
            />
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto text-sm px-4 py-2"
            >
              <Icon name="Upload" size={14} />
              <span className="ml-2">Upload New Photo</span>
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

      {/* Payment Methods & Contact Info - GLOBAL SETTINGS */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="mb-6">
          <h4 className="font-medium text-foreground mb-2 flex items-center">
            <Icon name="CreditCard" size={20} className="mr-2 text-green-600" />
            Payment & Contact Settings
          </h4>
          <p className="text-sm text-muted-foreground bg-primary/5 p-3 rounded-lg border border-primary/20">
            <Icon name="Info" size={16} className="inline mr-2 text-primary" />
            Configure these settings once - they'll apply to ALL your services automatically.
          </p>
        </div>

        {/* Payment Methods Section */}
        <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-border">
          <h5 className="font-medium text-foreground mb-4 flex items-center">
            <Icon name="CreditCard" size={18} className="mr-2 text-primary" />
            Payment Methods
          </h5>
          <div className="space-y-4">
            {/* Bank Transfer */}
            <div className={`p-4 rounded-lg border transition-all ${profileData.paymentMethods?.bankTransfer?.enabled ? 'border-primary bg-primary/5' : 'border-border'}`}>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profileData.paymentMethods?.bankTransfer?.enabled || false}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      paymentMethods: {
                        ...profileData.paymentMethods,
                        bankTransfer: { 
                          ...(profileData.paymentMethods?.bankTransfer || {}), 
                          enabled: e.target.checked 
                        }
                      }
                    })}
                    className="w-4 h-4 text-primary border-border rounded focus:ring-primary mr-3"
                  />
                  <Icon name="Building" size={20} className="mr-2 text-primary" />
                  <span className="font-medium text-foreground">Bank Transfer</span>
                </label>
              </div>
              {profileData.paymentMethods?.bankTransfer?.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <input
                    type="text"
                    placeholder="Bank Name"
                    value={profileData.paymentMethods.bankTransfer.bankName || ''}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      paymentMethods: {
                        ...profileData.paymentMethods,
                        bankTransfer: { ...profileData.paymentMethods.bankTransfer, bankName: e.target.value }
                      }
                    })}
                    className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Account Name"
                    value={profileData.paymentMethods.bankTransfer.accountName || ''}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      paymentMethods: {
                        ...profileData.paymentMethods,
                        bankTransfer: { ...profileData.paymentMethods.bankTransfer, accountName: e.target.value }
                      }
                    })}
                    className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Account Number"
                    value={profileData.paymentMethods.bankTransfer.accountNumber || ''}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      paymentMethods: {
                        ...profileData.paymentMethods,
                        bankTransfer: { ...profileData.paymentMethods.bankTransfer, accountNumber: e.target.value }
                      }
                    })}
                    className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                  />
                  <input
                    type="text"
                    placeholder="SWIFT / BIC Code (Optional)"
                    value={profileData.paymentMethods.bankTransfer.swiftCode || ''}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      paymentMethods: {
                        ...profileData.paymentMethods,
                        bankTransfer: { ...profileData.paymentMethods.bankTransfer, swiftCode: e.target.value }
                      }
                    })}
                    className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="p-4 bg-muted/30 rounded-lg border border-border">
          <h5 className="font-medium text-foreground mb-4 flex items-center">
            <Icon name="MessageCircle" size={18} className="mr-2 text-green-600" />
            Contact Information
          </h5>
          <div className="space-y-4">
            {/* Email Contact */}
            <div className={`p-4 rounded-lg border transition-all ${profileData.contactInfo?.email?.enabled ? 'border-green-500 bg-green-50/50' : 'border-border'}`}>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profileData.contactInfo?.email?.enabled || false}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      contactInfo: {
                        ...profileData.contactInfo,
                        email: { 
                          ...(profileData.contactInfo?.email || {}), 
                          enabled: e.target.checked,
                          address: profileData.contactInfo?.email?.address || profileData.email
                        }
                      }
                    })}
                    className="w-4 h-4 text-green-600 border-border rounded focus:ring-green-500 mr-3"
                  />
                  <Icon name="Mail" size={20} className="mr-2 text-primary" />
                  <span className="font-medium text-foreground">Email</span>
                </label>
              </div>
              {profileData.contactInfo?.email?.enabled && (
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  value={profileData.contactInfo.email.address || ''}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    contactInfo: {
                      ...profileData.contactInfo,
                      email: { ...profileData.contactInfo.email, address: e.target.value }
                    }
                  })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm mt-3"
                />
              )}
            </div>

            {/* WhatsApp Contact */}
            <div className={`p-4 rounded-lg border transition-all ${profileData.contactInfo?.whatsapp?.enabled ? 'border-green-500 bg-green-50/50' : 'border-border'}`}>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profileData.contactInfo?.whatsapp?.enabled || false}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      contactInfo: {
                        ...profileData.contactInfo,
                        whatsapp: { 
                          ...(profileData.contactInfo?.whatsapp || {}), 
                          enabled: e.target.checked,
                          number: profileData.contactInfo?.whatsapp?.number || profileData.phone
                        }
                      }
                    })}
                    className="w-4 h-4 text-green-600 border-border rounded focus:ring-green-500 mr-3"
                  />
                  <Icon name="MessageCircle" size={20} className="mr-2 text-green-500" />
                  <span className="font-medium text-foreground">WhatsApp</span>
                </label>
              </div>
              {profileData.contactInfo?.whatsapp?.enabled && (
                <input
                  type="tel"
                  placeholder="+255 123 456 789"
                  value={profileData.contactInfo.whatsapp.number || ''}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    contactInfo: {
                      ...profileData.contactInfo,
                      whatsapp: { ...profileData.contactInfo.whatsapp, number: e.target.value }
                    }
                  })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm mt-3"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessProfile;
