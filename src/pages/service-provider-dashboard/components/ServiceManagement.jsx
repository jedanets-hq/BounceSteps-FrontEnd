import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import LocationSelector from '../../../components/LocationSelector';
import { API_URL } from '../../../utils/api';

const ServiceManagement = () => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [showAddService, setShowAddService] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [location, setLocation] = useState({ region: '', district: '', ward: '', street: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Standard categories matching frontend (journey-planner, destination-discovery)
  const serviceCategories = [
    'Accommodation',
    'Transportation',
    'Tours & Activities',
    'Food & Dining',
    'Shopping',
    'Health & Wellness',
    'Entertainment'
  ];

  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    duration: '',
    capacity: '',
    includes: '',
    excludes: '',
    requirements: '',
    images: [],
    // Payment Methods
    paymentMethods: {
      visa: { enabled: false, cardHolder: '', lastFourDigits: '' },
      paypal: { enabled: false, email: '' },
      googlePay: { enabled: false, email: '' },
      mobileMoney: { enabled: false, provider: '', phone: '' }
    },
    // Contact Information
    contactInfo: {
      email: { enabled: false, address: '' },
      whatsapp: { enabled: false, number: '' }
    }
  });
  
  const [imageUrl, setImageUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [myServices, setMyServices] = useState([]);
  const [viewingImages, setViewingImages] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [providerProfile, setProviderProfile] = useState(null);

  // Fetch user's services and profile from database
  useEffect(() => {
    if (user?.id) {
      fetchMyServices();
      fetchProviderProfile();
    }
  }, [user]);

  const fetchProviderProfile = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      const token = userData.token;

      if (!token) {
        console.log('No token found');
        return;
      }

      const response = await fetch(`${API_URL}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Invalid response content type');
        return;
      }
      
      const text = await response.text();
      if (!text) {
        console.error('Empty response from server');
        return;
      }
      
      const data = JSON.parse(text);
      console.log('Profile data:', data);
      
      if (data.success && data.user) {
        if (data.user.provider) {
          setProviderProfile(data.user.provider);
          // Set location and categories from profile
          if (data.user.provider.location_data) {
            setLocation(data.user.provider.location_data);
          }
        } else {
          // For service providers without complete profile, create a basic one
          // This allows them to add services - backend will auto-create provider profile
          const userData = JSON.parse(localStorage.getItem('isafari_user') || '{}');
          setProviderProfile({
            id: null,
            business_name: (userData.firstName || '') + ' ' + (userData.lastName || ''),
            service_categories: ['General'],
            location: 'Tanzania',
            location_data: {}
          });
          console.log('📝 Created basic provider profile for service creation');
        }
      }
    } catch (error) {
      console.error('Error fetching provider profile:', error);
    }
  };

  const fetchMyServices = async () => {
    try {
      // Get auth token from localStorage
      const userData = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      const token = userData.token;

      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch(`${API_URL}/services/provider/my-services`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setMyServices(data.services || []);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrl.trim()) {
      alert('Please enter a valid image URL');
      return;
    }

    if (serviceForm.images.length >= 6) {
      alert('Maximum 6 images allowed');
      return;
    }

    const newImage = {
      preview: imageUrl,
      name: 'URL Image',
      size: 0,
      isUrl: true
    };

    setServiceForm(prev => ({
      ...prev,
      images: [...prev.images, newImage]
    }));

    setImageUrl('');
    setShowUrlInput(false);
  };

  const resetForm = () => {
    setServiceForm({
      name: '',
      description: '',
      price: '',
      duration: '',
      capacity: '',
      includes: '',
      excludes: '',
      requirements: '',
      images: [],
      paymentMethods: {
        visa: { enabled: false, cardHolder: '', lastFourDigits: '' },
        paypal: { enabled: false, email: '' },
        googlePay: { enabled: false, email: '' },
        mobileMoney: { enabled: false, provider: '', phone: '' }
      },
      contactInfo: {
        email: { enabled: false, address: '' },
        whatsapp: { enabled: false, number: '' }
      }
    });
    setLocation({ region: '', district: '', ward: '', street: '' });
    setEditingServiceId(null);
  };

  const handleSaveService = async () => {
    if (!serviceForm.name || !serviceForm.price) {
      alert('Please fill all required fields (Name, Price)');
      return;
    }

    if (serviceForm.images.length === 0) {
      alert('Please upload at least one image for your service');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare image URLs
      const imageUrls = serviceForm.images.map(img => img.preview);
      
      // Use location from provider profile or default
      const locationString = providerProfile?.location || providerProfile?.service_location || 'Tanzania';
      
      // Use category from form or provider profile (first category if multiple) or default
      const category = serviceForm.category || providerProfile?.service_categories?.[0] || 'Tours & Activities';
      
      // Validate category
      if (!category || category === '') {
        alert('Please select a service category');
        setIsSubmitting(false);
        return;
      }
      
      // Validate contact info - at least one contact method required
      const hasContact = serviceForm.contactInfo.email.enabled || serviceForm.contactInfo.whatsapp.enabled;
      if (!hasContact) {
        alert('Please provide at least one contact method (Email or WhatsApp)');
        setIsSubmitting(false);
        return;
      }

      // Validate contact details if enabled
      if (serviceForm.contactInfo.email.enabled && !serviceForm.contactInfo.email.address) {
        alert('Please enter your email address');
        setIsSubmitting(false);
        return;
      }
      if (serviceForm.contactInfo.whatsapp.enabled && !serviceForm.contactInfo.whatsapp.number) {
        alert('Please enter your WhatsApp number');
        setIsSubmitting(false);
        return;
      }

      const serviceData = {
        title: serviceForm.name,
        description: serviceForm.description || 'No description provided',
        category: category,
        price: parseFloat(serviceForm.price),
        duration: parseInt(serviceForm.duration) || null,
        maxParticipants: parseInt(serviceForm.capacity) || null,
        location: locationString,
        images: imageUrls,
        amenities: serviceForm.includes ? serviceForm.includes.split(',').map(item => item.trim()) : [],
        paymentMethods: serviceForm.paymentMethods,
        contactInfo: serviceForm.contactInfo
      };

      console.log('Sending service data:', serviceData);

      // Get auth token from localStorage
      const userData = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      const token = userData.token;

      if (!token) {
        alert('Authentication required. Please login again.');
        return;
      }

      // Determine if we're editing or creating
      const url = editingServiceId ? `/api/services/${editingServiceId}` : '/api/services';
      const method = editingServiceId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(serviceData)
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();
      console.log('Server response:', data);

      if (data.success) {
        alert(editingServiceId ? 'Service updated successfully!' : 'Service added successfully!');
        
        // Refresh services list
        fetchMyServices();
        setShowAddService(false);
        setEditingServiceId(null);
        
        // Reset form
        resetForm();
      } else {
        alert('Failed to add service: ' + data.message);
      }
    } catch (error) {
      console.error('Error adding service:', error);
      alert('Failed to add service: ' + error.message + '. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleServiceStatus = async (serviceId, currentStatus) => {
    try {
      console.log('🔄 Toggling service status:', { serviceId, currentStatus });
      
      // Get auth token from localStorage
      const userData = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      const token = userData.token;

      if (!token) {
        alert('Authentication required. Please login again.');
        return;
      }

      const newStatus = !currentStatus;
      console.log('📤 Sending request to activate/deactivate:', { serviceId, newStatus });

      const response = await fetch(`${API_URL}/services/${serviceId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: newStatus })
      });

      console.log('📡 Response status:', response.status);
      const data = await response.json();
      console.log('📦 Response data:', data);
      
      if (data.success) {
        // Update local state
        setMyServices(services => 
          services.map(service => 
            service.id === serviceId 
              ? { ...service, is_active: newStatus }
              : service
          )
        );
        console.log('✅ Service status updated successfully');
        alert(`Service ${newStatus ? 'activated' : 'paused'} successfully!\n\n${newStatus ? 'Travelers can now see and book this service.' : 'Service is now hidden from travelers.'}`);
      } else {
        console.error('❌ Failed to update:', data.message);
        alert('Failed to update service status: ' + data.message);
      }
    } catch (error) {
      console.error('❌ Error toggling service status:', error);
      alert('Failed to update service status. Please try again.');
    }
  };

  const handleEditService = (service) => {
    // Set editing mode
    setEditingServiceId(service.id);
    
    // Populate form with service data
    setServiceForm({
      name: service.title,
      description: service.description || '',
      price: service.price || '',
      duration: service.duration || '',
      capacity: service.max_participants || '',
      includes: service.amenities ? service.amenities.join(', ') : '',
      excludes: '',
      requirements: '',
      images: service.images && service.images.length > 0 
        ? service.images.map(img => ({preview: img, isUrl: true})) 
        : []
    });
    
    // Parse location to get street, ward, district, and region
    if (service.location) {
      const parts = service.location.split(',').map(p => p.trim());
      // Format: street, ward, district, region, Tanzania
      setLocation({
        street: parts[0] || '',
        ward: parts[1] || '',
        district: parts[2] || '',
        region: parts[3] || ''
      });
    }
    setShowAddService(true);
  };

  const deleteService = async (serviceId) => {
    console.log('Attempting to delete service ID:', serviceId);
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        // Get auth token from localStorage
        const userData = JSON.parse(localStorage.getItem('isafari_user') || '{}');
        const token = userData.token;

        if (!token) {
          alert('Authentication required. Please login again.');
          return;
        }

        const response = await fetch(`${API_URL}/services/${serviceId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        
        if (data.success) {
          fetchMyServices();
          alert('Service deleted successfully!');
        } else {
          alert('Failed to delete service: ' + data.message);
        }
      } catch (error) {
        console.error('Error deleting service:', error);
        alert('Failed to delete service. Please try again.');
      }
    }
  };

  if (showAddService) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-medium">Add New Service</h3>
          <Button variant="outline" onClick={() => setShowAddService(false)}>
            <Icon name="X" size={16} />
            Cancel
          </Button>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          {/* Profile Info Display */}
          {providerProfile && (
            <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-border">
              <h4 className="font-medium text-foreground mb-3 flex items-center">
                <Icon name="Info" size={18} className="mr-2 text-primary" />
                Your Business Profile
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Location:</span>
                  <p className="font-medium text-foreground">{providerProfile.location || 'Not set'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Categories:</span>
                  <p className="font-medium text-foreground">
                    {providerProfile.service_categories?.join(', ') || 'Not set'}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Services will automatically use your business location and categories
              </p>
            </div>
          )}

          {/* Service Details */}
          <div className="mb-6">
            <h4 className="font-medium text-foreground mb-4">Service Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Service Name *</label>
                <input
                  type="text"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({...serviceForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  placeholder="Enter service name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Category *</label>
                <select
                  value={serviceForm.category}
                  onChange={(e) => setServiceForm({...serviceForm, category: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                >
                  <option value="">Select a category</option>
                  {serviceCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Price (TZS) *</label>
                <input
                  type="number"
                  value={serviceForm.price}
                  onChange={(e) => setServiceForm({...serviceForm, price: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Duration</label>
                <input
                  type="text"
                  value={serviceForm.duration}
                  onChange={(e) => setServiceForm({...serviceForm, duration: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  placeholder="e.g., 3 days, 2 hours"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Capacity</label>
                <input
                  type="number"
                  value={serviceForm.capacity}
                  onChange={(e) => setServiceForm({...serviceForm, capacity: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  placeholder="Max people"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-foreground mb-2">Description</label>
              <textarea
                value={serviceForm.description}
                onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                placeholder="Describe your service..."
              />
            </div>

            {/* Service Images Upload */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Service Images * 
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  ({serviceForm.images.length}/6 images)
                </span>
              </label>
              <p className="text-xs text-muted-foreground mb-4">
                Upload high-quality images to showcase your service. First image will be the main display image.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {serviceForm.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.preview}
                      alt={`Service image ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-border"
                      onError={(e) => {
                        e.target.src = '/api/placeholder/400/300';
                        e.target.classList.add('opacity-50');
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newImages = serviceForm.images.filter((_, i) => i !== index);
                        setServiceForm({...serviceForm, images: newImages});
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                    >
                      <Icon name="X" size={12} />
                    </button>
                    <div className="absolute bottom-1 left-1 flex gap-1">
                      {index === 0 && (
                        <div className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded">
                          Main
                        </div>
                      )}
                      {image.isUrl && (
                        <div className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
                          <Icon name="Link" size={10} />
                          URL
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                <input
                  id="serviceImageUpload"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    const remainingSlots = 6 - serviceForm.images.length;
                    const filesToProcess = files.slice(0, remainingSlots);
                    
                    filesToProcess.forEach((file) => {
                      if (file.size > 5 * 1024 * 1024) {
                        alert(`${file.name} is too large. Maximum size is 5MB.`);
                        return;
                      }
                      
                      if (!file.type.startsWith('image/')) {
                        alert(`${file.name} is not a valid image file.`);
                        return;
                      }
                      
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        const newImage = {
                          file: file,
                          preview: e.target.result,
                          name: file.name,
                          size: file.size
                        };
                        
                        setServiceForm(prev => ({
                          ...prev,
                          images: [...prev.images, newImage]
                        }));
                      };
                      reader.readAsDataURL(file);
                    });
                    
                    e.target.value = '';
                  }}
                />
                
                {serviceForm.images.length < 6 && !showUrlInput && (
                  <label
                    htmlFor="serviceImageUpload"
                    className="w-full h-24 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer"
                  >
                    <Icon name="Upload" size={20} />
                    <span className="text-xs mt-1">Upload from Device</span>
                  </label>
                )}

                {serviceForm.images.length < 6 && !showUrlInput && (
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(true)}
                    className="w-full h-24 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer"
                  >
                    <Icon name="Link" size={20} />
                    <span className="text-xs mt-1">Add Image URL</span>
                  </button>
                )}
              </div>

              {showUrlInput && (
                <div className="mt-4 p-4 border border-border rounded-lg bg-muted/30">
                  <label className="block text-sm font-medium text-foreground mb-2">Image URL</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddImageUrl();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={handleAddImageUrl}
                      size="sm"
                    >
                      <Icon name="Plus" size={16} />
                      Add
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowUrlInput(false);
                        setImageUrl('');
                      }}
                      size="sm"
                    >
                      <Icon name="X" size={16} />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Enter a direct link to an image (JPG, PNG, WebP)
                  </p>
                </div>
              )}
              
              <div className="text-xs text-muted-foreground mt-4">
                • Upload up to 6 high-quality images
                • Upload from your device or add image URLs
                • Recommended size: 1200x800px or higher
                • Supported formats: JPG, PNG, WebP
                • Maximum file size: 5MB per image (device uploads)
                • First image will be used as the main display image
              </div>
            </div>
          </div>

          {/* Payment Methods Section */}
          <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-border">
            <h4 className="font-medium text-foreground mb-4 flex items-center">
              <Icon name="CreditCard" size={18} className="mr-2 text-primary" />
              Payment Methods
              <span className="ml-2 text-xs font-normal text-muted-foreground">(Select methods you accept)</span>
            </h4>
            <p className="text-xs text-muted-foreground mb-4">
              Choose which payment methods travelers can use to pay for this service. Only enabled methods with complete details will be shown to travelers.
            </p>
            
            <div className="space-y-4">
              {/* Visa/Credit Card */}
              <div className={`p-4 rounded-lg border transition-all ${serviceForm.paymentMethods.visa.enabled ? 'border-primary bg-primary/5' : 'border-border'}`}>
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={serviceForm.paymentMethods.visa.enabled}
                      onChange={(e) => setServiceForm({
                        ...serviceForm,
                        paymentMethods: {
                          ...serviceForm.paymentMethods,
                          visa: { ...serviceForm.paymentMethods.visa, enabled: e.target.checked }
                        }
                      })}
                      className="w-4 h-4 text-primary border-border rounded focus:ring-primary mr-3"
                    />
                    <Icon name="CreditCard" size={20} className="mr-2 text-blue-600" />
                    <span className="font-medium text-foreground">Visa/Credit Card</span>
                  </label>
                </div>
                {serviceForm.paymentMethods.visa.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    <input
                      type="text"
                      placeholder="Card Holder Name"
                      value={serviceForm.paymentMethods.visa.cardHolder}
                      onChange={(e) => setServiceForm({
                        ...serviceForm,
                        paymentMethods: {
                          ...serviceForm.paymentMethods,
                          visa: { ...serviceForm.paymentMethods.visa, cardHolder: e.target.value }
                        }
                      })}
                      className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Last 4 digits (for verification)"
                      maxLength={4}
                      value={serviceForm.paymentMethods.visa.lastFourDigits}
                      onChange={(e) => setServiceForm({
                        ...serviceForm,
                        paymentMethods: {
                          ...serviceForm.paymentMethods,
                          visa: { ...serviceForm.paymentMethods.visa, lastFourDigits: e.target.value.replace(/\D/g, '') }
                        }
                      })}
                      className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                    />
                  </div>
                )}
              </div>

              {/* PayPal */}
              <div className={`p-4 rounded-lg border transition-all ${serviceForm.paymentMethods.paypal.enabled ? 'border-primary bg-primary/5' : 'border-border'}`}>
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={serviceForm.paymentMethods.paypal.enabled}
                      onChange={(e) => setServiceForm({
                        ...serviceForm,
                        paymentMethods: {
                          ...serviceForm.paymentMethods,
                          paypal: { ...serviceForm.paymentMethods.paypal, enabled: e.target.checked }
                        }
                      })}
                      className="w-4 h-4 text-primary border-border rounded focus:ring-primary mr-3"
                    />
                    <div className="w-5 h-5 mr-2 bg-blue-700 rounded flex items-center justify-center text-white text-xs font-bold">P</div>
                    <span className="font-medium text-foreground">PayPal</span>
                  </label>
                </div>
                {serviceForm.paymentMethods.paypal.enabled && (
                  <input
                    type="email"
                    placeholder="PayPal Email Address"
                    value={serviceForm.paymentMethods.paypal.email}
                    onChange={(e) => setServiceForm({
                      ...serviceForm,
                      paymentMethods: {
                        ...serviceForm.paymentMethods,
                        paypal: { ...serviceForm.paymentMethods.paypal, email: e.target.value }
                      }
                    })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm mt-3"
                  />
                )}
              </div>

              {/* Google Pay */}
              <div className={`p-4 rounded-lg border transition-all ${serviceForm.paymentMethods.googlePay.enabled ? 'border-primary bg-primary/5' : 'border-border'}`}>
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={serviceForm.paymentMethods.googlePay.enabled}
                      onChange={(e) => setServiceForm({
                        ...serviceForm,
                        paymentMethods: {
                          ...serviceForm.paymentMethods,
                          googlePay: { ...serviceForm.paymentMethods.googlePay, enabled: e.target.checked }
                        }
                      })}
                      className="w-4 h-4 text-primary border-border rounded focus:ring-primary mr-3"
                    />
                    <div className="w-5 h-5 mr-2 bg-gradient-to-r from-blue-500 via-red-500 to-yellow-500 rounded flex items-center justify-center text-white text-xs font-bold">G</div>
                    <span className="font-medium text-foreground">Google Pay</span>
                  </label>
                </div>
                {serviceForm.paymentMethods.googlePay.enabled && (
                  <input
                    type="email"
                    placeholder="Google Pay Email"
                    value={serviceForm.paymentMethods.googlePay.email}
                    onChange={(e) => setServiceForm({
                      ...serviceForm,
                      paymentMethods: {
                        ...serviceForm.paymentMethods,
                        googlePay: { ...serviceForm.paymentMethods.googlePay, email: e.target.value }
                      }
                    })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm mt-3"
                  />
                )}
              </div>

              {/* Mobile Money (Escrow) */}
              <div className={`p-4 rounded-lg border transition-all ${serviceForm.paymentMethods.mobileMoney.enabled ? 'border-primary bg-primary/5' : 'border-border'}`}>
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={serviceForm.paymentMethods.mobileMoney.enabled}
                      onChange={(e) => setServiceForm({
                        ...serviceForm,
                        paymentMethods: {
                          ...serviceForm.paymentMethods,
                          mobileMoney: { ...serviceForm.paymentMethods.mobileMoney, enabled: e.target.checked }
                        }
                      })}
                      className="w-4 h-4 text-primary border-border rounded focus:ring-primary mr-3"
                    />
                    <Icon name="Smartphone" size={20} className="mr-2 text-green-600" />
                    <span className="font-medium text-foreground">Mobile Money (Escrow)</span>
                    <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">Coming Soon</span>
                  </label>
                </div>
                {serviceForm.paymentMethods.mobileMoney.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    <select
                      value={serviceForm.paymentMethods.mobileMoney.provider}
                      onChange={(e) => setServiceForm({
                        ...serviceForm,
                        paymentMethods: {
                          ...serviceForm.paymentMethods,
                          mobileMoney: { ...serviceForm.paymentMethods.mobileMoney, provider: e.target.value }
                        }
                      })}
                      className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                    >
                      <option value="">Select Provider</option>
                      <option value="M-Pesa">M-Pesa</option>
                      <option value="Tigo Pesa">Tigo Pesa</option>
                      <option value="Airtel Money">Airtel Money</option>
                      <option value="Halo Pesa">Halo Pesa</option>
                    </select>
                    <input
                      type="tel"
                      placeholder="Phone Number (+255...)"
                      value={serviceForm.paymentMethods.mobileMoney.phone}
                      onChange={(e) => setServiceForm({
                        ...serviceForm,
                        paymentMethods: {
                          ...serviceForm.paymentMethods,
                          mobileMoney: { ...serviceForm.paymentMethods.mobileMoney, phone: e.target.value }
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
          <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-border">
            <h4 className="font-medium text-foreground mb-4 flex items-center">
              <Icon name="MessageCircle" size={18} className="mr-2 text-green-600" />
              Contact Information *
              <span className="ml-2 text-xs font-normal text-muted-foreground">(At least one required)</span>
            </h4>
            <p className="text-xs text-muted-foreground mb-4">
              Provide contact details so travelers can reach you directly. These will be displayed on your service listing.
            </p>
            
            <div className="space-y-4">
              {/* Email Contact */}
              <div className={`p-4 rounded-lg border transition-all ${serviceForm.contactInfo.email.enabled ? 'border-green-500 bg-green-50/50' : 'border-border'}`}>
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={serviceForm.contactInfo.email.enabled}
                      onChange={(e) => setServiceForm({
                        ...serviceForm,
                        contactInfo: {
                          ...serviceForm.contactInfo,
                          email: { ...serviceForm.contactInfo.email, enabled: e.target.checked }
                        }
                      })}
                      className="w-4 h-4 text-green-600 border-border rounded focus:ring-green-500 mr-3"
                    />
                    <Icon name="Mail" size={20} className="mr-2 text-blue-600" />
                    <span className="font-medium text-foreground">Email</span>
                  </label>
                </div>
                {serviceForm.contactInfo.email.enabled && (
                  <input
                    type="email"
                    placeholder="your.email@example.com"
                    value={serviceForm.contactInfo.email.address}
                    onChange={(e) => setServiceForm({
                      ...serviceForm,
                      contactInfo: {
                        ...serviceForm.contactInfo,
                        email: { ...serviceForm.contactInfo.email, address: e.target.value }
                      }
                    })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm mt-3"
                    required={serviceForm.contactInfo.email.enabled}
                  />
                )}
              </div>

              {/* WhatsApp Contact */}
              <div className={`p-4 rounded-lg border transition-all ${serviceForm.contactInfo.whatsapp.enabled ? 'border-green-500 bg-green-50/50' : 'border-border'}`}>
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={serviceForm.contactInfo.whatsapp.enabled}
                      onChange={(e) => setServiceForm({
                        ...serviceForm,
                        contactInfo: {
                          ...serviceForm.contactInfo,
                          whatsapp: { ...serviceForm.contactInfo.whatsapp, enabled: e.target.checked }
                        }
                      })}
                      className="w-4 h-4 text-green-600 border-border rounded focus:ring-green-500 mr-3"
                    />
                    <Icon name="MessageCircle" size={20} className="mr-2 text-green-500" />
                    <span className="font-medium text-foreground">WhatsApp</span>
                  </label>
                </div>
                {serviceForm.contactInfo.whatsapp.enabled && (
                  <input
                    type="tel"
                    placeholder="+255 123 456 789"
                    value={serviceForm.contactInfo.whatsapp.number}
                    onChange={(e) => setServiceForm({
                      ...serviceForm,
                      contactInfo: {
                        ...serviceForm.contactInfo,
                        whatsapp: { ...serviceForm.contactInfo.whatsapp, number: e.target.value }
                      }
                    })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm mt-3"
                    required={serviceForm.contactInfo.whatsapp.enabled}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowAddService(false);
            }}>
              Cancel
            </Button>
            <Button variant="default" onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSaveService();
            }} disabled={isSubmitting}>
              <Icon name={editingServiceId ? "Save" : "Plus"} size={16} />
              {isSubmitting ? 'Saving...' : (editingServiceId ? 'Save Changes' : 'Add Service')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Image Viewer Modal */}
      {viewingImages && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setViewingImages(null)}>
          <div className="relative max-w-4xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button 
              onClick={() => setViewingImages(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <Icon name="X" size={32} />
            </button>
            
            {/* Image */}
            <div className="relative bg-white rounded-lg overflow-hidden">
              <img 
                src={viewingImages[currentImageIndex]} 
                alt={`Image ${currentImageIndex + 1}`}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              
              {/* Navigation */}
              {viewingImages.length > 1 && (
                <>
                  <button 
                    onClick={() => setCurrentImageIndex((prev) => (prev - 1 + viewingImages.length) % viewingImages.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
                  >
                    <Icon name="ChevronLeft" size={24} />
                  </button>
                  <button 
                    onClick={() => setCurrentImageIndex((prev) => (prev + 1) % viewingImages.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
                  >
                    <Icon name="ChevronRight" size={24} />
                  </button>
                  
                  {/* Image Counter */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
                    {currentImageIndex + 1} / {viewingImages.length}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl font-medium">My Services ({myServices.length})</h3>
        <Button variant="default" onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowAddService(true);
        }}>
          <Icon name="Plus" size={16} />
          Add New Service
        </Button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {myServices.map(service => (
          <div key={service.id} className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            {/* Service Image */}
            <div 
              className="relative h-48 bg-gradient-to-br from-primary/10 to-primary/5 cursor-pointer group"
              onClick={(e) => {
                e.stopPropagation();
                if (service.images && service.images.length > 0) {
                  setViewingImages(service.images);
                  setCurrentImageIndex(0);
                }
              }}
            >
              {service.images && service.images.length > 0 ? (
                <>
                  <img 
                    src={service.images[0]} 
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg flex items-center gap-2">
                      <Icon name="Eye" size={16} />
                      <span className="text-sm font-medium">View Images</span>
                    </div>
                  </div>
                </>
              ) : null}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10" style={{display: (service.images && service.images.length > 0) ? 'none' : 'flex'}}>
                <Icon name="Package" size={48} className="text-primary/40" />
              </div>
              {/* Image Count Badge */}
              {service.images && service.images.length > 1 && (
                <div className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                  <Icon name="Image" size={12} />
                  {service.images.length}
                </div>
              )}
              {/* Status Badge */}
              <div className="absolute top-2 right-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                  service.is_active 
                    ? 'bg-success/90 text-white' 
                    : 'bg-muted/90 text-muted-foreground'
                }`}>
                  {service.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              {/* Category Badge */}
              <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium">
                {service.category}
              </div>
            </div>

            {/* Service Details */}
            <div className="p-4">
              <div className="mb-3">
                <h4 className="font-semibold text-foreground text-lg mb-1">{service.title}</h4>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Icon name="MapPin" size={14} />
                  {service.location}
                </p>
              </div>

              {service.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {service.description}
                </p>
              )}

              {/* Stats */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                <div>
                  <div className="text-xl font-bold text-primary">
                    Tshs {parseFloat(service.price || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">per day</div>
                </div>
                <div className="flex items-center gap-3">
                  {service.average_rating && parseFloat(service.average_rating) > 0 ? (
                    <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded">
                      <Icon name="Star" size={14} className="text-yellow-500" fill="currentColor" />
                      <span className="text-sm font-medium">{parseFloat(service.average_rating).toFixed(1)}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">No ratings</span>
                  )}
                  <div className="text-sm text-muted-foreground">
                    {service.total_bookings || 0} bookings
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleServiceStatus(service.id, service.is_active);
                  }}
                >
                  <Icon name={service.is_active ? 'Pause' : 'Play'} size={14} />
                  {service.is_active ? 'Pause' : 'Activate'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleEditService(service);
                  }}
                >
                  <Icon name="Edit" size={14} />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    deleteService(service.id);
                  }}
                  className="text-red-600 hover:text-red-700 hover:border-red-300"
                >
                  <Icon name="Trash2" size={14} />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {myServices.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Package" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium text-foreground mb-2">No services yet</h3>
          <p className="text-muted-foreground mb-4">Start by adding your first service to attract customers</p>
          <Button variant="default" onClick={() => setShowAddService(true)}>
            <Icon name="Plus" size={16} />
            Add Your First Service
          </Button>
        </div>
      )}
    </div>
  );
};

export default ServiceManagement;
