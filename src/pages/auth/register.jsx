import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import LocationSelector from '../../components/LocationSelector';
import { serviceCategories as allServiceCategories } from '../../data/locations';

const Register = () => {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState('');
  const [searchParams] = useSearchParams();
  const [serviceLocation, setServiceLocation] = useState({ region: '', district: '', ward: '', street: '' });
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Pre-select user type if specified in URL
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam && (roleParam === 'traveler' || roleParam === 'provider')) {
      setUserType(roleParam);
      setStep(2); // Skip role selection step
    }
  }, [searchParams]);
  const [formData, setFormData] = useState({
    // Common fields
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    
    // Traveler specific
    dateOfBirth: '',
    nationality: '',
    passportNumber: '',
    emergencyContact: '',
    travelPreferences: [],
    
    // Service Provider specific
    companyName: '',
    businessType: '',
    businessLicense: '',
    serviceCategories: [],
    businessAddress: '',
    website: '',
    description: ''
  });

  const travelPreferences = [
    'Adventure', 'Luxury', 'Budget', 'Cultural', 'Nature', 'City', 'Beach', 'Mountain'
  ];

  const serviceCategories = [
    'Accommodation', 'Transportation', 'Tours & Activities', 'Food & Dining',
    'Shopping', 'Health & Wellness', 'Entertainment', 'Travel Insurance', 
    'Visa Services', 'Equipment Rental', 'Photography'
  ];

  const businessTypes = [
    'Hotel/Resort', 'Tour Operator', 'Transportation Service', 'Restaurant', 
    'Travel Agency', 'Activity Provider', 'Equipment Rental', 'Other'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleUserTypeSelect = (type) => {
    setUserType(type);
    setStep(2);
  };

  const navigate = useNavigate();
  const { register, loginWithGoogle } = useAuth();

  const handleGoogleRegister = async () => {
    const result = await loginWithGoogle();
    
    if (result.success) {
      alert('Google registration successful! Welcome to iSafari Global.');
      navigate('/');
    } else {
      alert('Google registration failed. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    
    // Validate service provider location and categories
    if (userType === 'provider') {
      if (!serviceLocation.region || !serviceLocation.district) {
        alert('Please select your service location (Region and District are required)');
        return;
      }
      if (selectedCategories.length === 0) {
        alert('Please select at least one service category');
        return;
      }
    }
    
    // Convert 'provider' to 'service_provider' for database
    const dbUserType = userType === 'provider' ? 'service_provider' : userType;
    
    // Add location and categories to formData for service providers
    const registrationData = {
      ...formData,
      ...(userType === 'provider' && {
        serviceLocation: `${serviceLocation.street}, ${serviceLocation.ward}, ${serviceLocation.district}, ${serviceLocation.region}, Tanzania`.replace(/^, |, , /g, ', ').replace(/^, /, ''),
        serviceCategories: selectedCategories,
        locationData: serviceLocation
      })
    };
    
    const result = await register(registrationData, dbUserType);
    
    if (result.success) {
      alert(`Registration successful! Welcome to iSafari Global!`);
      // Redirect to main home page after successful registration
      navigate('/');
    } else {
      // Show specific error message with better handling for duplicate email
      let errorMessage = result.error || 'Registration failed. Please try again.';
      
      // Handle duplicate email error specifically
      if (errorMessage.includes('email already exists') || errorMessage.includes('already registered')) {
        errorMessage = `This email (${formData.email}) is already registered. Please:\n\n• Use a different email address, or\n• Try logging in if you already have an account\n• Use "Forgot Password" if you can't remember your password`;
      }
      
      alert(errorMessage);
      
      // If it's a duplicate email error, focus on email field
      if (errorMessage.includes('email')) {
        const emailInput = document.querySelector('input[type="email"]');
        if (emailInput) {
          emailInput.focus();
          emailInput.select();
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-lg shadow-lg p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-display font-medium text-foreground mb-2">
                Join iSafari Global
              </h1>
              <p className="text-muted-foreground">
                Create your account and start your journey with us
              </p>
            </div>

            {/* Progress Indicator */}
            {step > 1 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Step {step} of 2</span>
                  <span className="text-sm text-primary font-medium">
                    {userType === 'traveler' ? 'Traveler Registration' : 'Service Provider Registration'}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full w-1/2"></div>
                </div>
              </div>
            )}

            {/* Step 1: Choose User Type */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-foreground text-center mb-6">
                  How would you like to join us?
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button
                    onClick={() => handleUserTypeSelect('traveler')}
                    className="p-6 border-2 border-border rounded-lg hover:border-primary transition-all text-left group"
                  >
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Icon name="User" size={24} className="text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">I'm a Traveler</h3>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Looking to explore amazing destinations and book unique travel experiences
                    </p>
                    <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center">
                        <Icon name="Check" size={14} className="text-primary mr-2" />
                        Book flights & accommodations
                      </li>
                      <li className="flex items-center">
                        <Icon name="Check" size={14} className="text-primary mr-2" />
                        Discover local experiences
                      </li>
                      <li className="flex items-center">
                        <Icon name="Check" size={14} className="text-primary mr-2" />
                        Get personalized recommendations
                      </li>
                    </ul>
                  </button>

                  <button
                    onClick={() => handleUserTypeSelect('provider')}
                    className="p-6 border-2 border-border rounded-lg hover:border-primary transition-all text-left group"
                  >
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                        <Icon name="Briefcase" size={24} className="text-secondary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">I'm a Service Provider</h3>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Offering travel services and want to connect with travelers worldwide
                    </p>
                    <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center">
                        <Icon name="Check" size={14} className="text-secondary mr-2" />
                        List your services
                      </li>
                      <li className="flex items-center">
                        <Icon name="Check" size={14} className="text-secondary mr-2" />
                        Reach global travelers
                      </li>
                      <li className="flex items-center">
                        <Icon name="Check" size={14} className="text-secondary mr-2" />
                        Grow your business
                      </li>
                    </ul>
                  </button>
                </div>

                <div className="text-center">
                  <p className="text-muted-foreground mb-4">Or continue with</p>
                  <Button variant="outline" onClick={handleGoogleRegister} className="w-full">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Sign up with Google
                  </Button>
                </div>

                <div className="text-center">
                  <p className="text-muted-foreground">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary hover:underline font-medium">
                      Sign in
                    </Link>
                  </p>
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground text-center">
                      Powered by <span className="font-semibold">JEDA NETWORKS</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Registration Form */}
            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Common Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Password *
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Traveler Specific Fields */}
                {userType === 'traveler' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                          className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Nationality
                        </label>
                        <input
                          type="text"
                          value={formData.nationality}
                          onChange={(e) => handleInputChange('nationality', e.target.value)}
                          className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Travel Preferences
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {travelPreferences.map((pref) => (
                          <button
                            key={pref}
                            type="button"
                            onClick={() => handleArrayToggle('travelPreferences', pref)}
                            className={`p-2 text-sm rounded-lg border transition-all ${
                              formData.travelPreferences.includes(pref)
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-background border-border hover:border-primary'
                            }`}
                          >
                            {pref}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Service Provider Specific Fields */}
                {userType === 'provider' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Company/Business Name *
                      </label>
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                        className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>

                    {/* Service Location */}
                    <div className="border border-border rounded-lg p-4 bg-muted/30">
                      <h4 className="font-medium text-foreground mb-4 flex items-center">
                        <Icon name="MapPin" size={18} className="mr-2" />
                        Service Location (Tanzania) *
                      </h4>
                      <LocationSelector
                        value={serviceLocation}
                        onChange={setServiceLocation}
                        required={true}
                        showWard={true}
                        showStreet={true}
                      />
                    </div>

                    {/* Service Categories */}
                    <div className="border border-border rounded-lg p-4 bg-muted/30">
                      <h4 className="font-medium text-foreground mb-4 flex items-center">
                        <Icon name="Briefcase" size={18} className="mr-2" />
                        Service Categories *
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {Object.keys(allServiceCategories).map((category) => (
                          <button
                            key={category}
                            type="button"
                            onClick={() => {
                              setSelectedCategories(prev =>
                                prev.includes(category)
                                  ? prev.filter(c => c !== category)
                                  : [...prev, category]
                              );
                            }}
                            className={`p-3 text-sm rounded-lg border transition-all flex items-center justify-center ${
                              selectedCategories.includes(category)
                                ? 'bg-secondary text-secondary-foreground border-secondary shadow-md'
                                : 'bg-background border-border hover:border-secondary hover:shadow-sm'
                            }`}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                      {selectedCategories.length > 0 && (
                        <div className="mt-3 text-sm text-muted-foreground">
                          Selected: {selectedCategories.join(', ')}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Business Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Tell us about your business and services..."
                      />
                    </div>
                  </>
                )}

                {/* Form Actions */}
                <div className="flex justify-between pt-6 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                  >
                    <Icon name="ChevronLeft" size={16} />
                    Back
                  </Button>
                  
                  <Button type="submit">
                    <Icon name="UserPlus" size={16} />
                    Create Account
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;
