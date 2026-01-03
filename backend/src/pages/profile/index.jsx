import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import Image from '../../components/AppImage';
import MyStories from './components/MyStories';
import { API_URL } from '../../utils/api';

const Profile = () => {
  const { user, updateProfile, switchUserType } = useAuth();
  const [searchParams] = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [loading, setLoading] = useState(true);
  const [autoOpenCreateStory, setAutoOpenCreateStory] = useState(false);

  // Check for query params to auto-open create story modal
  useEffect(() => {
    const tab = searchParams.get('tab');
    const action = searchParams.get('action');
    if (tab === 'stories' && action === 'create') {
      setAutoOpenCreateStory(true);
    }
  }, [searchParams]);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    avatar: '',
    dateOfBirth: '',
    nationality: '',
    passportNumber: '',
    emergencyContact: '',
    travelPreferences: [],
    companyName: '',
    businessType: '',
    businessLicense: '',
    serviceCategories: [],
    businessAddress: '',
    website: '',
    description: '',
    rating: 0,
    totalBookings: 0
  });

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleSave = () => {
    updateProfile(profileData);
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setUploadingPhoto(true);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('avatar', file);

      // Get token from isafari_user
      const savedUser = localStorage.getItem('isafari_user');
      const token = savedUser ? JSON.parse(savedUser).token : null;
      
      if (!token) {
        alert('Please login to upload photo');
        return;
      }
      
      const response = await fetch(`${API_URL}/users/upload-avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        // Update profile data with new avatar URL
        setProfileData(prev => ({
          ...prev,
          avatar: data.avatarUrl
        }));
        // Refresh profile data to get latest
        fetchProfileData();
        alert('Profile photo updated successfully!');
      } else {
        alert(data.message || 'Failed to upload photo');
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };


  // Fetch user profile data from backend
  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      // Get token from isafari_user
      const savedUser = localStorage.getItem('isafari_user');
      const token = savedUser ? JSON.parse(savedUser).token : null;
      
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.error('Failed to fetch profile');
        setLoading(false);
        return;
      }

      const data = await response.json();
      
      if (data.success && data.user) {
        const userData = data.user;
        setProfileData({
          firstName: userData.first_name || '',
          lastName: userData.last_name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          avatar: userData.profile_image || '',
          dateOfBirth: userData.date_of_birth || '',
          nationality: userData.nationality || '',
          passportNumber: userData.passport_number || '',
          emergencyContact: userData.emergency_contact || '',
          travelPreferences: userData.travel_preferences || [],
          companyName: userData.business_name || '',
          businessType: userData.business_type || '',
          businessLicense: userData.license_number || '',
          serviceCategories: userData.service_categories || [],
          businessAddress: userData.location || '',
          website: userData.website || '',
          description: userData.business_description || '',
          rating: userData.rating || 0,
          totalBookings: userData.total_bookings || 0
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get current user type from auth context
  const userType = user?.userType || 'traveler';

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <Icon name="Loader2" size={48} className="mx-auto mb-4 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading profile...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Header */}
          <div className="bg-card rounded-lg shadow-lg p-8 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <div className="relative">
                <Image
                  src={profileData.avatar}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover"
                />
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={uploadingPhoto}
                />
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground cursor-pointer hover:bg-primary/90 transition-colors"
                  title="Change profile photo"
                >
                  {uploadingPhoto ? (
                    <Icon name="Loader2" size={16} className="animate-spin" />
                  ) : (
                    <Icon name="Camera" size={16} />
                  )}
                </label>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-2">
                  <h1 className="text-2xl font-display font-medium text-foreground">
                    {profileData.firstName} {profileData.lastName}
                  </h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    userType === 'traveler' 
                      ? 'bg-primary/10 text-primary' 
                      : 'bg-secondary/10 text-secondary'
                  }`}>
                    {userType === 'traveler' ? '🧳 Traveler' : '🏢 Service Provider'}
                  </span>
                </div>
                <p className="text-muted-foreground mb-4">{profileData.email}</p>
                
                {userType === 'provider' && (
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Icon name="Star" size={16} className="text-yellow-500 mr-1" />
                      <span>{profileData.rating} rating</span>
                    </div>
                    <div className="flex items-center">
                      <Icon name="Users" size={16} className="mr-1" />
                      <span>{profileData.totalBookings} bookings</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant={isEditing ? "default" : "outline"}
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                >
                  <Icon name={isEditing ? "Save" : "Edit"} size={16} />
                  {isEditing ? 'Save Changes' : 'Edit Profile'}
                </Button>
              </div>
            </div>
          </div>

          {/* My Stories Section for Travelers */}
          {userType === 'traveler' && (
            <MyStories profileData={profileData} autoOpenCreate={autoOpenCreateStory} />
          )}

          {/* Service Provider Profile */}
          {userType !== 'traveler' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div className="bg-card rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Personal Information</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">First Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    ) : (
                      <p className="text-muted-foreground">{profileData.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Last Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    ) : (
                      <p className="text-muted-foreground">{profileData.lastName}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                  <p className="text-muted-foreground">{profileData.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  ) : (
                    <p className="text-muted-foreground">{profileData.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Role-specific Information */}
            <div className="bg-card rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                {userType === 'traveler' ? 'Travel Information' : 'Business Information'}
              </h2>
              
              {userType === 'traveler' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Date of Birth</label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={profileData.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    ) : (
                      <p className="text-muted-foreground">{profileData.dateOfBirth}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Nationality</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.nationality}
                        onChange={(e) => handleInputChange('nationality', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    ) : (
                      <p className="text-muted-foreground">{profileData.nationality}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Travel Preferences</label>
                    <div className="flex flex-wrap gap-2">
                      {profileData.travelPreferences.map((pref) => (
                        <span
                          key={pref}
                          className="px-2 py-1 bg-primary/10 text-primary text-sm rounded-full"
                        >
                          {pref}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Company Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.companyName}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    ) : (
                      <p className="text-muted-foreground">{profileData.companyName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Business Type</label>
                    <p className="text-muted-foreground">{profileData.businessType}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Service Categories</label>
                    <div className="flex flex-wrap gap-2">
                      {profileData.serviceCategories.map((category) => (
                        <span
                          key={category}
                          className="px-2 py-1 bg-secondary/10 text-secondary text-sm rounded-full"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Website</label>
                    <a href={profileData.website} className="text-primary hover:underline">
                      {profileData.website}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
          )}

          {/* Quick Actions */}
          {userType !== 'traveler' && (
          <div className="mt-8 bg-card rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {userType === 'traveler' ? (
                <>
                  <Link to="/journey-planner">
                    <Button variant="outline" fullWidth>
                      <Icon name="Calendar" size={16} />
                      Plan New Journey
                    </Button>
                  </Link>
                  <Link to="/dashboard">
                    <Button variant="outline" fullWidth>
                      <Icon name="BarChart3" size={16} />
                      View Dashboard
                    </Button>
                  </Link>
                  <Link to="/dashboard">
                    <Button variant="outline" fullWidth>
                      <Icon name="History" size={16} />
                      Booking History
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/dashboard">
                    <Button variant="outline" fullWidth>
                      <Icon name="Settings" size={16} />
                      Business Dashboard
                    </Button>
                  </Link>
                  <Link to="/dashboard">
                    <Button variant="outline" fullWidth>
                      <Icon name="TrendingUp" size={16} />
                      View Analytics
                    </Button>
                  </Link>
                  <Link to="/dashboard">
                    <Button variant="outline" fullWidth>
                      <Icon name="Users" size={16} />
                      Manage Bookings
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile;
