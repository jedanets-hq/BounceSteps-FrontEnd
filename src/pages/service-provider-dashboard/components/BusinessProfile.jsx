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
      const updatedData = { ...profileData, profileImage };
      await updateProfile(updatedData);
      setIsEditing(false);
      alert('✅ Profile updated successfully!');
    } catch (error) {
      console.error('Profile update error:', error);
      alert('❌ Failed to update profile. Please try again.');
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
      <div className="space-y-6">
        {/* Header with Profile Picture */}
        <div className="bg-gradient-to-r from-primary via-secondary to-accent rounded-xl p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="relative flex justify-center sm:justify-start">
                <img 
                  src={profileImage || user?.profileImage || `https://ui-avatars.com/api/?name=${user?.firstName || 'User'}+${user?.lastName || ''}&background=0D8ABC&color=fff&size=128`} 
                  alt="Profile" 
                  className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-lg object-cover"
                />
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

        {/* Section 1: Registration Information (Core Details) */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
              <Icon name="User" size={20} className="text-primary" />
            </div>
            <h4 className="font-semibold text-foreground text-lg">Registration Information</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">Full Name</label>
              <p className="text-foreground font-medium">{profileData.firstName} {profileData.lastName}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">Company/Business Name</label>
              <p className="text-foreground font-medium">{profileData.companyName || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">Email Address</label>
              <p className="text-foreground font-medium flex items-center">
                <Icon name="Mail" size={14} className="mr-2 text-primary" />
                {user?.email}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">Phone Number</label>
              <p className="text-foreground font-medium flex items-center">
                <Icon name="Phone" size={14} className="mr-2 text-primary" />
                {profileData.phone || user?.phone || 'Not provided'}
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Service Location & Categories */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mr-3">
              <Icon name="MapPin" size={20} className="text-accent" />
            </div>
            <h4 className="font-semibold text-foreground text-lg">Service Location & Categories</h4>
          </div>
          <div className="space-y-6">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-2">Service Location</label>
              {profileData.serviceLocation ? (
                <div className="flex items-start space-x-2">
                  <Icon name="MapPin" size={16} className="text-accent mt-1" />
                  <p className="text-foreground font-medium leading-relaxed">{profileData.serviceLocation}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">No service location specified</p>
              )}
              {profileData.locationData && Object.keys(profileData.locationData).length > 0 && (
                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {profileData.locationData.region && (
                    <div className="bg-muted/30 rounded-lg p-2">
                      <p className="text-xs text-muted-foreground">Region</p>
                      <p className="text-sm font-medium text-foreground">{profileData.locationData.region}</p>
                    </div>
                  )}
                  {profileData.locationData.district && (
                    <div className="bg-muted/30 rounded-lg p-2">
                      <p className="text-xs text-muted-foreground">District</p>
                      <p className="text-sm font-medium text-foreground">{profileData.locationData.district}</p>
                    </div>
                  )}
                  {profileData.locationData.ward && (
                    <div className="bg-muted/30 rounded-lg p-2">
                      <p className="text-xs text-muted-foreground">Ward</p>
                      <p className="text-sm font-medium text-foreground">{profileData.locationData.ward}</p>
                    </div>
                  )}
                  {profileData.locationData.street && (
                    <div className="bg-muted/30 rounded-lg p-2">
                      <p className="text-xs text-muted-foreground">Street</p>
                      <p className="text-sm font-medium text-foreground">{profileData.locationData.street}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-2">Service Categories</label>
              {profileData.serviceCategories && profileData.serviceCategories.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profileData.serviceCategories.map((category, index) => (
                    <span key={index} className="px-3 py-1.5 bg-secondary/10 text-secondary rounded-lg text-sm font-medium flex items-center">
                      <Icon name="Briefcase" size={14} className="mr-1" />
                      {category}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No service categories selected</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Business Information */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
              <Icon name="Building" size={20} className="text-primary" />
            </div>
            <h4 className="font-semibold text-foreground text-lg">Business Details</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">Business Type</label>
              <p className="text-foreground font-medium">{profileData.businessType || 'General Services'}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">Account Status</label>
              <p className="text-foreground font-medium flex items-center">
                <span className={`w-2 h-2 rounded-full mr-2 ${user?.isVerified ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                {user?.isVerified ? 'Verified' : 'Pending Verification'}
              </p>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">Business Description</label>
              <p className="text-foreground leading-relaxed">{profileData.description || 'No description provided. Add a description to help travelers understand your services better.'}</p>
            </div>
          </div>
        </div>

        {/* Section 4: Additional Contact (WhatsApp & Website) */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center mr-3">
              <Icon name="MessageCircle" size={20} className="text-secondary" />
            </div>
            <h4 className="font-semibold text-foreground text-lg">Additional Contact</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <Icon name="MessageCircle" size={18} className="text-green-500 mt-1" />
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">WhatsApp Number</label>
                <p className="text-foreground font-medium">{profileData.whatsapp || profileData.phone || 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Icon name="Globe" size={18} className="text-primary mt-1" />
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">Website/Social Media</label>
                <p className="text-foreground font-medium">{profileData.website || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl font-medium">Edit Business Profile</h3>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
          <Button variant="default" onClick={handleSave}>
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
            <img 
              src={profileImage || user?.profileImage || `https://ui-avatars.com/api/?name=${user?.firstName || 'User'}+${user?.lastName || ''}&background=0D8ABC&color=fff&size=128`} 
              alt="Profile" 
              className="w-28 h-28 rounded-full border-4 border-primary/20 object-cover"
            />
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

      {/* Service Location */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h4 className="font-medium text-foreground mb-4 flex items-center">
          <Icon name="MapPin" size={20} className="mr-2 text-accent" />
          Service Location (Tanzania)
        </h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Region (Mkoa) *</label>
            <input
              type="text"
              value={profileData.locationData?.region || ''}
              onChange={(e) => setProfileData({
                ...profileData,
                locationData: { ...profileData.locationData, region: e.target.value }
              })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              placeholder="e.g., Dar es Salaam"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">District (Wilaya) *</label>
            <input
              type="text"
              value={profileData.locationData?.district || ''}
              onChange={(e) => setProfileData({
                ...profileData,
                locationData: { ...profileData.locationData, district: e.target.value }
              })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              placeholder="e.g., Kinondoni"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Ward (Kata)</label>
            <input
              type="text"
              value={profileData.locationData?.ward || ''}
              onChange={(e) => setProfileData({
                ...profileData,
                locationData: { ...profileData.locationData, ward: e.target.value }
              })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              placeholder="e.g., Mikocheni"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Street (Mtaa)</label>
            <input
              type="text"
              value={profileData.locationData?.street || ''}
              onChange={(e) => setProfileData({
                ...profileData,
                locationData: { ...profileData.locationData, street: e.target.value }
              })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              placeholder="e.g., Mwai Kibaki Road"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            <Icon name="Info" size={14} className="inline mr-1" />
            Update your service location if your business has moved to a new area.
          </p>
        </div>
      </div>

      {/* Service Categories */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h4 className="font-medium text-foreground mb-4 flex items-center">
          <Icon name="Briefcase" size={20} className="mr-2 text-secondary" />
          Service Categories
        </h4>
        <div className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {['Accommodation', 'Transportation', 'Tours & Activities', 'Food & Dining', 'Shopping', 'Health & Wellness', 'Entertainment', 'Travel Insurance', 'Visa Services', 'Equipment Rental', 'Photography'].map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => {
                  const isSelected = profileData.serviceCategories.includes(category);
                  setProfileData({
                    ...profileData,
                    serviceCategories: isSelected
                      ? profileData.serviceCategories.filter(c => c !== category)
                      : [...profileData.serviceCategories, category]
                  });
                }}
                className={`p-3 text-sm rounded-lg border transition-all ${
                  profileData.serviceCategories.includes(category)
                    ? 'bg-secondary text-secondary-foreground border-secondary shadow-md'
                    : 'bg-background border-border hover:border-secondary hover:shadow-sm'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          {profileData.serviceCategories.length > 0 && (
            <div className="mt-3 text-sm text-muted-foreground">
              Selected: {profileData.serviceCategories.join(', ')}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            <Icon name="Info" size={14} className="inline mr-1" />
            Select all service categories that apply to your business. You can select multiple.
          </p>
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

      {/* Change Password Modal */}
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
    </div>
  );
};

export default BusinessProfile;
