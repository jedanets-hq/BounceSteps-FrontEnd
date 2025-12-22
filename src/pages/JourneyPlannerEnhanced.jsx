import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import Header from '../components/ui/Header';
import Button from '../components/ui/Button';
import Icon from '../components/AppIcon';
import LocationSelector from '../components/LocationSelector';
import ProviderCard from '../components/ProviderCard';
import ProviderProfileModal from '../components/ProviderProfileModal';
import { tanzaniaRegions, destinations } from '../data/tanzaniaData';
import { getAccommodationsByType, getTransportByRegion } from '../data/accommodationData';
import { API_URL } from '../utils/api';

const JourneyPlannerEnhanced = () => {
  const { user } = useAuth();
  const { addMultipleToCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [step, setStep] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState({
    region: location.state?.region || '',
    district: location.state?.district || '',
    ward: '',
    street: ''
  });
  const [providers, setProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [journeyData, setJourneyData] = useState({
    country: 'Tanzania',
    destination: location.state?.destination || '',
    startDate: '',
    endDate: '',
    checkInDate: '',
    checkOutDate: '',
    adults: 1,
    travelers: 1,
    accommodationType: '',
    priceRange: '',
    roomType: '',
    minRating: 3,
    facilities: [],
    selectedServices: location.state?.selectedServices || [],
    selectedProviders: [],
    activities: [],
    transportMode: '',
    specialRequests: ''
  });
  const [showSummary, setShowSummary] = useState(false);
  const [savedJourneys, setSavedJourneys] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [paymentDetails, setPaymentDetails] = useState({
    phoneNumber: '',
    bankName: '',
    accountNumber: '',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    email: ''
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  // Load saved journeys
  useEffect(() => {
    if (user?.id) {
      const saved = JSON.parse(localStorage.getItem(`journeys_${user.id}`) || '[]');
      setSavedJourneys(saved);
    }
  }, [user?.id]);

  // Tanzania Regions and Districts
  const tanzaniaData = {
    'Arusha': ['Arusha Urban', 'Arusha Rural', 'Karatu', 'Longido', 'Monduli', 'Ngorongoro'],
    'Dar es Salaam': ['Ilala', 'Kinondoni', 'Temeke', 'Ubungo', 'Kigamboni'],
    'Dodoma': ['Dodoma Urban', 'Dodoma Rural', 'Bahi', 'Chamwino', 'Chemba', 'Kondoa', 'Kongwa', 'Mpwapwa'],
    'Geita': ['Geita Urban', 'Geita Rural', 'Bukombe', 'Chato', 'Mbogwe', 'Nyang\'hwale'],
    'Iringa': ['Iringa Urban', 'Iringa Rural', 'Kilolo', 'Mafinga', 'Mufindi'],
    'Kagera': ['Bukoba Urban', 'Bukoba Rural', 'Biharamulo', 'Karagwe', 'Kyerwa', 'Missenyi', 'Muleba', 'Ngara'],
    'Katavi': ['Mpanda Urban', 'Mpanda Rural', 'Mlele', 'Tanganyika'],
    'Kigoma': ['Kigoma Urban', 'Kigoma Rural', 'Buhigwe', 'Kakonko', 'Kasulu', 'Kibondo', 'Uvinza'],
    'Kilimanjaro': ['Moshi Urban', 'Moshi Rural', 'Hai', 'Mwanga', 'Rombo', 'Same', 'Siha'],
    'Lindi': ['Lindi Urban', 'Lindi Rural', 'Kilwa', 'Liwale', 'Nachingwea', 'Ruangwa'],
    'Manyara': ['Babati Urban', 'Babati Rural', 'Hanang', 'Kiteto', 'Mbulu', 'Simanjiro'],
    'Mara': ['Musoma Urban', 'Musoma Rural', 'Bunda', 'Butiama', 'Rorya', 'Serengeti', 'Tarime'],
    'Mbeya': ['Mbeya Urban', 'Mbeya Rural', 'Chunya', 'Kyela', 'Mbarali', 'Rungwe'],
    'Morogoro': ['Morogoro Urban', 'Morogoro Rural', 'Gairo', 'Kilombero', 'Kilosa', 'Malinyi', 'Mvomero', 'Ulanga'],
    'Mtwara': ['Mtwara Urban', 'Mtwara Rural', 'Masasi', 'Nanyumbu', 'Newala', 'Tandahimba'],
    'Mwanza': ['Ilemela', 'Nyamagana', 'Kwimba', 'Magu', 'Misungwi', 'Sengerema', 'Ukerewe'],
    'Njombe': ['Njombe Urban', 'Njombe Rural', 'Ludewa', 'Makambako', 'Makete', 'Wanging\'ombe'],
    'Pwani': ['Kibaha Urban', 'Kibaha Rural', 'Bagamoyo', 'Kisarawe', 'Mafia', 'Mkuranga', 'Rufiji'],
    'Rukwa': ['Sumbawanga Urban', 'Sumbawanga Rural', 'Kalambo', 'Nkasi'],
    'Ruvuma': ['Songea Urban', 'Songea Rural', 'Mbinga', 'Namtumbo', 'Nyasa', 'Tunduru'],
    'Shinyanga': ['Shinyanga Urban', 'Shinyanga Rural', 'Kahama Urban', 'Kahama Rural', 'Kishapu', 'Msalala', 'Ushetu'],
    'Simiyu': ['Bariadi', 'Busega', 'Itilima', 'Maswa', 'Meatu'],
    'Singida': ['Singida Urban', 'Singida Rural', 'Ikungi', 'Iramba', 'Manyoni', 'Mkalama'],
    'Songwe': ['Mbozi', 'Momba', 'Songwe', 'Tunduma'],
    'Tabora': ['Tabora Urban', 'Tabora Rural', 'Igunga', 'Kaliua', 'Nzega', 'Sikonge', 'Urambo', 'Uyui'],
    'Tanga': ['Tanga Urban', 'Tanga Rural', 'Handeni', 'Kilindi', 'Korogwe', 'Lushoto', 'Mkinga', 'Muheza', 'Pangani'],
    'Zanzibar North': ['Kaskazini A', 'Kaskazini B'],
    'Zanzibar South': ['Kusini', 'Kusini Unguja'],
    'Zanzibar Urban': ['Mjini Magharibi']
  };

  const travelPurposes = [
    { id: 'vacation', name: 'Vacation / Holiday', icon: 'Palmtree' },
    { id: 'business', name: 'Business Trip', icon: 'Briefcase' },
    { id: 'honeymoon', name: 'Honeymoon', icon: 'Heart' },
    { id: 'family', name: 'Family Reunion', icon: 'Users' },
    { id: 'adventure', name: 'Adventure', icon: 'Mountain' },
    { id: 'cultural', name: 'Cultural Tour', icon: 'Landmark' }
  ];

  const transportTypes = [
    { id: 'flight', name: 'Flight', icon: 'Plane', price: 200 },
    { id: 'bus', name: 'Bus', icon: 'Bus', price: 30 },
    { id: 'rental-car', name: 'Rental Car', icon: 'Car', price: 80 },
    { id: 'private-driver', name: 'Private Driver', icon: 'Users', price: 150 },
    { id: 'train', name: 'Train', icon: 'Train', price: 50 }
  ];

  const accommodationTypes = [
    { id: 'hotel', name: 'Hotel', icon: 'Hotel' },
    { id: 'guesthouse', name: 'Guesthouse', icon: 'Home' },
    { id: 'apartment', name: 'Apartment', icon: 'Building' },
    { id: 'resort', name: 'Resort', icon: 'Star' },
    { id: 'airbnb', name: 'Airbnb', icon: 'Key' },
    { id: 'lodge', name: 'Safari Lodge', icon: 'TreePine' }
  ];

  const priceRanges = [
    { id: 'budget', name: 'Budget', price: 30, icon: 'DollarSign' },
    { id: 'mid-range', name: 'Mid-Range', price: 100, icon: 'Coins' },
    { id: 'luxury', name: 'Luxury', price: 250, icon: 'Gem' }
  ];

  const facilities = [
    { id: 'wifi', name: 'Wi-Fi', icon: 'Wifi' },
    { id: 'pool', name: 'Swimming Pool', icon: 'Waves' },
    { id: 'breakfast', name: 'Breakfast Included', icon: 'Coffee' },
    { id: 'gym', name: 'Gym', icon: 'Dumbbell' },
    { id: 'parking', name: 'Parking', icon: 'Car' },
    { id: 'spa', name: 'Spa', icon: 'Sparkles' },
    { id: 'restaurant', name: 'Restaurant', icon: 'UtensilsCrossed' },
    { id: 'ac', name: 'Air Conditioning', icon: 'Wind' }
  ];

  const roomTypes = [
    { id: 'single', name: 'Single Room', icon: 'User' },
    { id: 'double', name: 'Double Room', icon: 'Users' },
    { id: 'family', name: 'Family Room', icon: 'Home' },
    { id: 'deluxe', name: 'Deluxe', icon: 'Star' },
    { id: 'suite', name: 'Suite', icon: 'Crown' }
  ];

  const tourOptions = [
    { id: 'safari', name: 'Safari Tour', price: 300, icon: 'Binoculars' },
    { id: 'city-walk', name: 'City Walking Tour', price: 50, icon: 'MapPin' },
    { id: 'boat-trip', name: 'Boat Trip', price: 120, icon: 'Ship' },
    { id: 'cultural', name: 'Cultural Experience', price: 75, icon: 'Users' },
    { id: 'hiking', name: 'Mountain Hiking', price: 150, icon: 'Mountain' },
    { id: 'diving', name: 'Scuba Diving', price: 200, icon: 'Waves' }
  ];

  const paymentMethods = [
    { id: 'mpesa', name: 'M-Pesa (Vodacom)', icon: 'Smartphone', color: 'bg-red-500', type: 'mobile' },
    { id: 'tigopesa', name: 'Tigo Pesa', icon: 'Smartphone', color: 'bg-blue-500', type: 'mobile' },
    { id: 'airtel', name: 'Airtel Money', icon: 'Smartphone', color: 'bg-red-600', type: 'mobile' },
    { id: 'halopesa', name: 'Halo Pesa', icon: 'Smartphone', color: 'bg-orange-500', type: 'mobile' },
    { id: 'visa', name: 'Visa Card', icon: 'CreditCard', color: 'bg-blue-600', type: 'card' },
    { id: 'mastercard', name: 'Mastercard', icon: 'CreditCard', color: 'bg-orange-600', type: 'card' },
    { id: 'amex', name: 'American Express', icon: 'CreditCard', color: 'bg-blue-700', type: 'card' },
    { id: 'paypal', name: 'PayPal', icon: 'Wallet', color: 'bg-blue-500', type: 'online' },
    { id: 'bank', name: 'Bank Transfer', icon: 'Building2', color: 'bg-green-600', type: 'bank' }
  ];

  const calculateDays = () => {
    if (!journeyData.startDate || !journeyData.endDate) return 0;
    const start = new Date(journeyData.startDate);
    const end = new Date(journeyData.endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const calculateTotalBudget = () => {
    const days = calculateDays();
    if (days === 0) return 0;

    const travelers = journeyData.travelers || 1;
    const transport = transportTypes.find(t => t.id === journeyData.transportType)?.price || 0;
    const accommodation = priceRanges.find(p => p.id === journeyData.priceRange)?.price || 100;
    const tours = (journeyData.tours && journeyData.tours.length > 0) ? journeyData.tours.reduce((sum, tourId) => {
      const tour = tourOptions.find(t => t.id === tourId);
      return sum + (tour ? tour.price : 0);
    }, 0) : 0;

    const accommodationCost = accommodation * days * travelers;
    const transportCost = transport * days;
    const toursCost = tours * travelers;
    const mealsCost = 30 * days * travelers;
    const miscCost = 50 * days;

    return accommodationCost + transportCost + toursCost + mealsCost + miscCost;
  };

  const toggleFacility = (facilityId) => {
    setJourneyData(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facilityId)
        ? prev.facilities.filter(id => id !== facilityId)
        : [...prev.facilities, facilityId]
    }));
  };

  const toggleTour = (tourId) => {
    setJourneyData(prev => ({
      ...prev,
      tours: prev.tours.includes(tourId)
        ? prev.tours.filter(id => id !== tourId)
        : [...prev.tours, tourId]
    }));
  };

  const saveJourney = () => {
    const journey = {
      ...journeyData,
      totalBudget: calculateTotalBudget(),
      days: calculateDays(),
      createdAt: new Date().toISOString(),
      id: Date.now()
    };

    const updated = [...savedJourneys, journey];
    setSavedJourneys(updated);
    localStorage.setItem(`journeys_${user.id}`, JSON.stringify(updated));
    alert('Journey saved successfully!');
  };

  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      alert('Please select a payment method');
      return;
    }

    const method = paymentMethods.find(m => m.id === selectedPaymentMethod);

    // Validate payment details based on type
    if (method.type === 'bank') {
      if (!paymentDetails.bankName || !paymentDetails.accountNumber) {
        alert('Please enter bank details');
        return;
      }
    } else if (method.type === 'mobile') {
      if (!paymentDetails.phoneNumber) {
        alert('Please enter phone number');
        return;
      }
    } else if (method.type === 'card') {
      if (!paymentDetails.cardNumber || !paymentDetails.cardName || !paymentDetails.expiryDate || !paymentDetails.cvv) {
        alert('Please enter all card details');
        return;
      }
    } else if (method.type === 'online') {
      if (!paymentDetails.email) {
        alert('Please enter email address');
        return;
      }
    }

    const totalAmount = calculateTotalBudget();
    const paymentData = {
      user_id: user.id,
      journey_data: journeyData,
      payment_method: selectedPaymentMethod,
      amount: totalAmount,
      payment_details: paymentDetails,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    try {
      const response = await fetch(`${API_URL}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });

      const data = await response.json();

      if (data.success) {
        alert(`Payment initiated successfully! Please complete payment via ${paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}`);
        setShowPaymentModal(false);
        navigate('/traveler-dashboard', { state: { tab: 'bookings' } });
      } else {
        alert('Payment failed: ' + data.message);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to process payment. Please try again.');
    }
  };

  const deleteJourney = (id) => {
    const updated = savedJourneys.filter(j => j.id !== id);
    setSavedJourneys(updated);
    localStorage.setItem(`journeys_${user.id}`, JSON.stringify(updated));
  };

  const nextStep = () => {
    if (step < 5) {
      setStep(step + 1);
      // Fetch providers when moving to step 4
      if (step === 3) {
        fetchProviders();
      }
    }
  };

  // Auto-fetch providers when location changes and we're on step 4
  useEffect(() => {
    if (step === 4 && (selectedLocation.region || selectedLocation.district)) {
      console.log('🔄 Auto-fetching providers due to location change:', selectedLocation);
      fetchProviders();
    }
  }, [selectedLocation.region, selectedLocation.district, selectedLocation.ward, step]);

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const fetchProviders = async () => {
    try {
      setLoadingProviders(true);
      const params = new URLSearchParams();
      
      console.log('🔍 Frontend: Searching providers with location:', selectedLocation);
      
      if (selectedLocation.region) params.append('region', selectedLocation.region);
      if (selectedLocation.district) params.append('district', selectedLocation.district);
      if (selectedLocation.ward) params.append('ward', selectedLocation.ward);
      
      // Add selected service categories as filter
      if (journeyData.selectedServices.length > 0) {
        journeyData.selectedServices.forEach(category => {
          params.append('categories', category);
        });
      }
      
      // First try to fetch services to get providers with actual services
      const servicesParams = new URLSearchParams();
      if (selectedLocation.region) servicesParams.append('location', selectedLocation.region);
      if (selectedLocation.district) servicesParams.append('location', selectedLocation.district);
      servicesParams.append('limit', '50');
      
      // Fetch services first
      const servicesResponse = await fetch(`${API_URL}/services?${servicesParams.toString()}`);
      const servicesData = await servicesResponse.json();
      
      console.log('📦 Frontend: Services response:', servicesData);
      
      // Extract unique providers from services
      if (servicesData.success && servicesData.services && servicesData.services.length > 0) {
        const providerMap = new Map();
        
        servicesData.services.forEach(service => {
          if (service.provider_id && !providerMap.has(service.provider_id)) {
            providerMap.set(service.provider_id, {
              id: service.provider_id,
              business_name: service.business_name || 'Service Provider',
              business_type: service.category || 'General',
              location: service.location || service.region,
              region: service.region,
              district: service.district,
              is_verified: service.provider_verified || false,
              rating: service.provider_rating || 0,
              service_categories: [service.category],
              services_count: 1
            });
          } else if (service.provider_id) {
            const existing = providerMap.get(service.provider_id);
            existing.services_count++;
            if (!existing.service_categories.includes(service.category)) {
              existing.service_categories.push(service.category);
            }
          }
        });
        
        const providersFromServices = Array.from(providerMap.values());
        console.log('✅ Frontend: Providers from services:', providersFromServices.length);
        
        if (providersFromServices.length > 0) {
          setProviders(providersFromServices);
          return;
        }
      }
      
      // Fallback to providers search if no services found
      const searchUrl = `/api/providers/search?${params.toString()}`;
      console.log('🌐 Frontend: Fallback to providers API:', searchUrl);
      
      const response = await fetch(searchUrl);
      const data = await response.json();
      
      console.log('📊 Frontend: Providers API Response:', data);
      
      if (data.success) {
        setProviders(data.providers || []);
        console.log('✅ Frontend: Providers set:', data.providers?.length || 0);
        
        // Show message if fallback search was used
        if (data.fallbackSearch) {
          console.log('ℹ️ Frontend: Using fallback search - showing all providers');
        }
      } else {
        console.error('❌ Frontend: API returned error:', data.message);
        setProviders([]);
      }
    } catch (error) {
      console.error('❌ Frontend: Error fetching providers:', error);
      setProviders([]);
    } finally {
      setLoadingProviders(false);
    }
  };

  const handleViewProvider = (provider) => {
    setSelectedProvider(provider);
    setShowProviderModal(true);
  };

  const handleSelectProvider = (provider) => {
    setJourneyData(prev => {
      const isSelected = prev.selectedProviders?.find(p => p.id === provider.id);
      if (isSelected) {
        return {
          ...prev,
          selectedProviders: prev.selectedProviders.filter(p => p.id !== provider.id)
        };
      } else {
        return {
          ...prev,
          selectedProviders: [...(prev.selectedProviders || []), provider]
        };
      }
    });
  };

  const handleAddServicesFromProvider = (services, provider) => {
    // Add selected services to journey data
    setJourneyData(prev => {
      const existingServices = prev.selectedServiceDetails || [];
      const newServices = services.map(service => ({
        ...service,
        provider_name: provider.business_name,
        provider_id: provider.id,
        provider_location: provider.location
      }));
      
      return {
        ...prev,
        selectedServiceDetails: [...existingServices, ...newServices],
        // Also add provider if not already selected
        selectedProviders: prev.selectedProviders?.find(p => p.id === provider.id)
          ? prev.selectedProviders
          : [...(prev.selectedProviders || []), provider]
      };
    });
    
    // Close modal and move to summary
    setShowProviderModal(false);
    setStep(5);
  };

  const viewSummary = () => {
    setShowSummary(true);
    setStep(5);
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {[
          { num: 1, name: 'Location' },
          { num: 2, name: 'Travel Details' },
          { num: 3, name: 'Services' },
          { num: 4, name: 'Providers' },
          { num: 5, name: 'Summary' }
        ].map((s, idx) => (
          <React.Fragment key={s.num}>
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step >= s.num ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {s.num}
              </div>
              <span className="text-xs mt-2">{s.name}</span>
            </div>
            {idx < 4 && (
              <div className={`flex-1 h-1 mx-2 ${step > s.num ? 'bg-primary' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-4">Select Location (Tanzania)</h2>
      
      <div className="bg-card border border-border rounded-lg p-6">
        <LocationSelector
          value={selectedLocation}
          onChange={(loc) => {
            setSelectedLocation(loc);
            setJourneyData({
              ...journeyData,
              destination: `${loc.district}, ${loc.region}`
            });
          }}
          required={true}
          showWard={true}
          showStreet={true}
        />
      </div>

      <div className="flex justify-end space-x-4 pt-6">
        <Button 
          onClick={nextStep} 
          disabled={!selectedLocation.region || !selectedLocation.district}
        >
          Next <Icon name="ArrowRight" size={16} />
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-4">Travel Details</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Check-in Date *</label>
          <input
            type="date"
            value={journeyData.checkInDate}
            onChange={(e) => setJourneyData({...journeyData, checkInDate: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Check-out Date *</label>
          <input
            type="date"
            value={journeyData.checkOutDate}
            onChange={(e) => setJourneyData({...journeyData, checkOutDate: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Number of People *</label>
          <input
            type="number"
            min="1"
            value={journeyData.adults}
            onChange={(e) => setJourneyData({...journeyData, adults: parseInt(e.target.value)})}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Total number of travelers"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-3">Purpose of Travel <span className="text-muted-foreground text-xs">(Optional)</span></label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {travelPurposes.map(purpose => (
            <button
              key={purpose.id}
              onClick={() => setJourneyData({...journeyData, travelPurpose: purpose.id})}
              className={`p-3 border rounded-lg flex items-center space-x-2 ${
                journeyData.travelPurpose === purpose.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:bg-muted'
              }`}
            >
              <Icon name={purpose.icon} size={20} />
              <span className="text-sm">{purpose.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={prevStep}>
          <Icon name="ArrowLeft" size={16} /> Back
        </Button>
        <Button onClick={nextStep} disabled={!journeyData.checkInDate || !journeyData.checkOutDate}>
          Next <Icon name="ArrowRight" size={16} />
        </Button>
      </div>
    </div>
  );

  // Real service categories matching database
  const serviceCategories = [
    { id: 'Accommodation', name: 'Accommodation', icon: 'Hotel', description: 'Hotels, Lodges, Guesthouses' },
    { id: 'Transportation', name: 'Transportation', icon: 'Car', description: 'Car Rental, Drivers, Buses' },
    { id: 'Tours & Activities', name: 'Tours & Activities', icon: 'Compass', description: 'Safari, City Tours, Adventures' },
    { id: 'Food & Dining', name: 'Food & Dining', icon: 'Utensils', description: 'Restaurants, Cafes, Local Cuisine' },
    { id: 'Shopping', name: 'Shopping', icon: 'ShoppingBag', description: 'Markets, Malls, Souvenirs' },
    { id: 'Health & Wellness', name: 'Health & Wellness', icon: 'Heart', description: 'Hospitals, Spas, Fitness' },
    { id: 'Entertainment', name: 'Entertainment', icon: 'Music', description: 'Nightlife, Museums, Events' }
  ];

  const toggleService = (serviceId) => {
    setJourneyData(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(serviceId)
        ? prev.selectedServices.filter(id => id !== serviceId)
        : [...prev.selectedServices, serviceId]
    }));
  };

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-4">Select Services</h2>
      <p className="text-muted-foreground">Choose the services you need for your journey</p>
      
      <div>
        <label className="block text-sm font-medium mb-3">Available Services</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {serviceCategories.map(service => (
            <button
              key={service.id}
              onClick={() => toggleService(service.id)}
              className={`p-4 border rounded-lg text-left transition-all ${
                journeyData.selectedServices.includes(service.id)
                  ? 'border-primary bg-primary/10 shadow-md'
                  : 'border-border hover:bg-muted hover:border-primary/50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon name={service.icon} size={24} className="text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{service.name}</div>
                    <div className="text-sm text-muted-foreground">{service.description}</div>
                  </div>
                </div>
                {journeyData.selectedServices.includes(service.id) && (
                  <Icon name="CheckCircle" size={24} className="text-primary" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {journeyData.selectedServices.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <p className="text-sm font-medium text-foreground mb-2">
            Selected Services ({journeyData.selectedServices.length}):
          </p>
          <div className="flex flex-wrap gap-2">
            {journeyData.selectedServices.map(serviceId => {
              const service = serviceCategories.find(s => s.id === serviceId);
              return (
                <span key={serviceId} className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm">
                  {service?.name}
                </span>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={prevStep}>
          <Icon name="ArrowLeft" size={16} /> Back
        </Button>
        <Button onClick={nextStep}>
          Next <Icon name="ArrowRight" size={16} />
        </Button>
      </div>
    </div>
  );

  const handleSelectProviders = (providers) => {
    setJourneyData(prev => ({
      ...prev,
      selectedProviders: providers
    }));
  };

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Select Service Providers</h2>
          <p className="text-muted-foreground">
            Providers in {selectedLocation.region}
            {selectedLocation.district && ` - ${selectedLocation.district}`}
            {selectedLocation.ward && ` - ${selectedLocation.ward}`}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchProviders}>
          <Icon name="RefreshCw" size={16} />
          Refresh
        </Button>
      </div>

      {loadingProviders ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading service providers...</p>
        </div>
      ) : providers.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {providers.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                onViewProfile={handleViewProvider}
                onSelect={handleSelectProvider}
                isSelected={journeyData.selectedProviders?.some(p => p.id === provider.id)}
              />
            ))}
          </div>

          {journeyData.selectedProviders && journeyData.selectedProviders.length > 0 && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-2">
                Selected Providers ({journeyData.selectedProviders.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {journeyData.selectedProviders.map((provider, idx) => (
                  <span
                    key={`selected-provider-${provider.id}-${idx}`}
                    className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm flex items-center"
                  >
                    {provider.business_name}
                    <button
                      onClick={() => handleSelectProvider(provider)}
                      className="ml-2 hover:bg-primary-foreground/20 rounded-full p-0.5"
                    >
                      <Icon name="X" size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <Icon name="Briefcase" size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Providers Found</h3>
          <p className="text-muted-foreground mb-4">
            No service providers available in {selectedLocation.district || selectedLocation.region || 'this location'} yet.
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={prevStep}>
              <Icon name="ArrowLeft" size={16} />
              Change Location
            </Button>
            <Button variant="default" onClick={() => navigate('/destination-discovery')}>
              <Icon name="Search" size={16} />
              Browse All Services
            </Button>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={prevStep}>
          <Icon name="ArrowLeft" size={16} /> Back
        </Button>
        <Button 
          onClick={viewSummary} 
          disabled={!journeyData.selectedProviders || journeyData.selectedProviders.length === 0}
        >
          View Summary <Icon name="FileText" size={16} />
        </Button>
      </div>

      {/* Provider Profile Modal */}
      {showProviderModal && selectedProvider && (
        <ProviderProfileModal
          provider={selectedProvider}
          onClose={() => setShowProviderModal(false)}
          onSelectService={handleAddServicesFromProvider}
        />
      )}
    </div>
  );

  const renderStep5 = () => {
    const days = calculateDays();
    const travelers = journeyData.travelers || 1;
    
    // Calculate cost from selected services
    const servicesCost = journeyData.selectedServiceDetails?.reduce((total, service) => {
      return total + (parseFloat(service.price) || 0);
    }, 0) || 0;
    
    // Calculate cost from selected providers (if any)
    const providersCost = journeyData.selectedProviders?.reduce((total, provider) => {
      return total + (parseFloat(provider.price) || 0);
    }, 0) || 0;
    
    const totalBudget = (servicesCost + providersCost) * travelers;

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold mb-4">Trip Summary</h2>
        
        <div className="bg-gradient-to-br from-primary to-secondary text-white rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Your Journey to {journeyData.region || journeyData.destination}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm opacity-90">Duration</div>
              <div className="text-2xl font-bold">{days || 0} Days</div>
            </div>
            <div>
              <div className="text-sm opacity-90">Total Budget</div>
              <div className="text-2xl font-bold">TZS {(totalBudget || 0).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm opacity-90">Travelers</div>
              <div className="text-lg font-semibold">{travelers} {travelers === 1 ? 'Person' : 'People'}</div>
            </div>
            <div>
              <div className="text-sm opacity-90">Per Person</div>
              <div className="text-lg font-semibold">TZS {Math.round((totalBudget || 0) / travelers).toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border rounded-lg p-6">
            <h4 className="font-semibold mb-3 flex items-center">
              <Icon name="MapPin" size={20} className="mr-2 text-primary" />
              Location Details (Tanzania)
            </h4>
            <div className="space-y-2 text-sm">
              <div><strong>Region (Mkoa):</strong> {selectedLocation.region}</div>
              <div><strong>District (Wilaya):</strong> {selectedLocation.district}</div>
              {selectedLocation.ward && <div><strong>Ward (Kata):</strong> {selectedLocation.ward}</div>}
              {selectedLocation.street && <div><strong>Street (Mtaa):</strong> {selectedLocation.street}</div>}
              <div><strong>Destination:</strong> {journeyData.destination}</div>
            </div>
          </div>

          <div className="bg-card border rounded-lg p-6">
            <h4 className="font-semibold mb-3 flex items-center">
              <Icon name="Calendar" size={20} className="mr-2 text-primary" />
              Travel Dates
            </h4>
            <div className="space-y-2 text-sm">
              <div><strong>Start Date:</strong> {journeyData.startDate ? new Date(journeyData.startDate).toLocaleDateString() : 'Not set'}</div>
              <div><strong>End Date:</strong> {journeyData.endDate ? new Date(journeyData.endDate).toLocaleDateString() : 'Not set'}</div>
              {journeyData.travelPurpose && <div><strong>Purpose:</strong> {travelPurposes.find(p => p.id === journeyData.travelPurpose)?.name}</div>}
              {journeyData.transportType && <div><strong>Transport:</strong> {transportTypes.find(t => t.id === journeyData.transportType)?.name}</div>}
            </div>
          </div>

          <div className="bg-card border rounded-lg p-6">
            <h4 className="font-semibold mb-3 flex items-center">
              <Icon name="Hotel" size={20} className="mr-2 text-primary" />
              Accommodation
            </h4>
            <div className="space-y-2 text-sm">
              <div><strong>Type:</strong> {accommodationTypes.find(a => a.id === journeyData.accommodationType)?.name}</div>
              <div><strong>Price Range:</strong> {priceRanges.find(p => p.id === journeyData.priceRange)?.name}</div>
              <div><strong>Room:</strong> {roomTypes.find(r => r.id === journeyData.roomType)?.name}</div>
              <div><strong>Rating:</strong> {journeyData.minRating}+ stars</div>
              {journeyData.facilities && journeyData.facilities.length > 0 && (
                <div><strong>Facilities:</strong> {journeyData.facilities.length} selected</div>
              )}
            </div>
          </div>

          <div className="bg-card border rounded-lg p-6">
            <h4 className="font-semibold mb-3 flex items-center">
              <Icon name="Briefcase" size={20} className="mr-2 text-primary" />
              Selected Services ({journeyData.selectedServiceDetails?.length || 0})
            </h4>
            <div className="space-y-3 text-sm">
              {journeyData.selectedServiceDetails && journeyData.selectedServiceDetails.length > 0 ? (
                journeyData.selectedServiceDetails.map((service, idx) => (
                  <div key={`service-${service.id}-${idx}`} className="border-l-2 border-primary pl-3 py-1">
                    <div className="font-medium text-foreground">{service.title}</div>
                    <div className="text-xs text-muted-foreground">
                      Provider: {service.provider_name}
                    </div>
                    <div className="text-xs font-semibold text-primary mt-1">
                      TZS {parseFloat(service.price || 0).toLocaleString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground">No services selected</div>
              )}
            </div>
          </div>
        </div>

        {/* Selected Service Providers */}
        {journeyData.selectedProviders && journeyData.selectedProviders.length > 0 && (
          <div className="bg-card border rounded-lg p-6">
            <h4 className="font-semibold mb-4 flex items-center">
              <Icon name="Users" size={20} className="mr-2 text-primary" />
              Selected Service Providers ({journeyData.selectedProviders.length})
            </h4>
            <div className="space-y-4">
              {journeyData.selectedProviders?.map((provider, idx) => (
                <div key={`provider-${provider.id}-${idx}`} className="flex items-start justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{provider.business_name || provider.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {Array.isArray(provider.service_categories) 
                        ? provider.service_categories.join(', ') 
                        : provider.service_category || ''}
                    </div>
                    {provider.description && (
                      <div className="text-sm mt-1 line-clamp-2">{provider.description}</div>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Icon name="MapPin" size={12} />
                      {provider.location_data?.district || provider.district || ''}, {provider.location_data?.region || provider.region || ''}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="font-semibold text-primary">
                      TZS {parseFloat(provider.price || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">per day</div>
                  </div>
                </div>
              ))}
              <div className="border-t pt-4 flex justify-between items-center">
                <span className="font-medium">Total Cost ({days} days):</span>
                <span className="text-xl font-bold text-primary">
                  TZS {totalBudget.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={prevStep}>
            <Icon name="ArrowLeft" size={16} /> Back
          </Button>
          <div className="space-x-3">
            <Button variant="outline" onClick={saveJourney}>
              <Icon name="Save" size={16} /> Save Plan
            </Button>
            <Button onClick={() => {
              // Prepare cart items from selected service details
              const cartItems = journeyData.selectedServiceDetails?.map(service => ({
                id: `service_${service.id}_${Date.now()}`,
                service_id: service.id, // Real service ID from database
                name: service.title,
                category: service.category,
                description: service.description,
                price: parseFloat(service.price || 0),
                quantity: days,
                region: service.provider_location?.region || selectedLocation.region,
                district: service.provider_location?.district || selectedLocation.district,
                image: service.images?.[0] || service.image_url,
                provider_id: service.provider_id,
                provider_name: service.provider_name,
                journey_details: {
                  startDate: journeyData.startDate,
                  endDate: journeyData.endDate,
                  travelers: travelers,
                  destination: journeyData.destination
                }
              })) || [];

              // Add all items to cart
              if (cartItems.length > 0) {
                addMultipleToCart(cartItems);
                // Navigate to cart
                navigate('/traveler-dashboard', { 
                  state: { 
                    tab: 'cart'
                  } 
                });
              } else {
                alert('Please select services from providers first!');
              }
            }}>
              <Icon name="ArrowRight" size={16} /> Continue to Cart & Payment
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold text-foreground mb-2">
              Plan Your Journey
            </h1>
            <p className="text-lg text-muted-foreground">
              Create your perfect travel plan step by step
            </p>
          </div>

          {renderStepIndicator()}

          <div className="max-w-4xl mx-auto">
            <div className="bg-card border rounded-lg p-8">
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
              {step === 4 && renderStep4()}
              {step === 5 && renderStep5()}
            </div>
          </div>

          {/* Saved Journeys */}
          {savedJourneys.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-semibold mb-6">Your Trip</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedJourneys.map((journey, idx) => (
                  <div key={`journey-${journey.id}-${idx}`} className="bg-card border rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{journey.destination}</h3>
                        <p className="text-sm text-muted-foreground">{journey.region}, {journey.district}</p>
                      </div>
                      <button
                        onClick={() => deleteJourney(journey.id)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <Icon name="Trash2" size={18} />
                      </button>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="font-medium">{journey.days} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Budget:</span>
                        <span className="font-medium">Tshs {journey.totalBudget?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">People:</span>
                        <span className="font-medium">{journey.adults}</span>
                      </div>
                    </div>
                    <Button fullWidth className="mt-4" size="sm">
                      <Icon name="Eye" size={16} /> View Details
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Complete Payment</h2>
                <button onClick={() => setShowPaymentModal(false)} className="text-muted-foreground hover:text-foreground">
                  <Icon name="X" size={24} />
                </button>
              </div>

              {/* Payment Summary */}
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="text-3xl font-bold text-primary">Tshs {calculateTotalBudget().toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{calculateDays()} Days</p>
                    <p className="text-sm text-muted-foreground">{journeyData.travelers} Traveler(s)</p>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">Select Payment Method</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {paymentMethods.map(method => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      className={`flex items-center gap-3 p-4 border-2 rounded-lg transition-all ${
                        selectedPaymentMethod === method.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className={`${method.color} text-white p-2 rounded-lg`}>
                        <Icon name={method.icon} size={24} />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{method.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {method.type === 'bank' ? 'Bank Transfer' : 
                           method.type === 'mobile' ? 'Mobile Money' :
                           method.type === 'card' ? 'Credit/Debit Card' : 'Online Payment'}
                        </p>
                      </div>
                      {selectedPaymentMethod === method.id && (
                        <Icon name="CheckCircle" size={20} className="ml-auto text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Details Form */}
              {selectedPaymentMethod && (() => {
                const method = paymentMethods.find(m => m.id === selectedPaymentMethod);
                
                return (
                  <div className="mb-6 space-y-4">
                    <h3 className="font-medium">Payment Details</h3>
                    
                    {method.type === 'bank' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium mb-2">Bank Name</label>
                          <input
                            type="text"
                            value={paymentDetails.bankName || ''}
                            onChange={(e) => setPaymentDetails({...paymentDetails, bankName: e.target.value})}
                            placeholder="Enter bank name"
                            className="w-full px-4 py-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Account Number</label>
                          <input
                            type="text"
                            value={paymentDetails.accountNumber || ''}
                            onChange={(e) => setPaymentDetails({...paymentDetails, accountNumber: e.target.value})}
                            placeholder="Enter account number"
                            className="w-full px-4 py-2 border rounded-lg"
                          />
                        </div>
                      </>
                    )}

                    {method.type === 'mobile' && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Phone Number</label>
                        <input
                          type="tel"
                          value={paymentDetails.phoneNumber || ''}
                          onChange={(e) => setPaymentDetails({...paymentDetails, phoneNumber: e.target.value})}
                          placeholder="255XXXXXXXXX or 0XXXXXXXXX"
                          className="w-full px-4 py-2 border rounded-lg"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Enter your {method.name} number
                        </p>
                      </div>
                    )}

                    {method.type === 'card' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium mb-2">Cardholder Name</label>
                          <input
                            type="text"
                            value={paymentDetails.cardName || ''}
                            onChange={(e) => setPaymentDetails({...paymentDetails, cardName: e.target.value})}
                            placeholder="Name on card"
                            className="w-full px-4 py-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Card Number</label>
                          <input
                            type="text"
                            value={paymentDetails.cardNumber || ''}
                            onChange={(e) => setPaymentDetails({...paymentDetails, cardNumber: e.target.value})}
                            placeholder="1234 5678 9012 3456"
                            maxLength="19"
                            className="w-full px-4 py-2 border rounded-lg"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Expiry Date</label>
                            <input
                              type="text"
                              value={paymentDetails.expiryDate || ''}
                              onChange={(e) => setPaymentDetails({...paymentDetails, expiryDate: e.target.value})}
                              placeholder="MM/YY"
                              maxLength="5"
                              className="w-full px-4 py-2 border rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">CVV</label>
                            <input
                              type="text"
                              value={paymentDetails.cvv || ''}
                              onChange={(e) => setPaymentDetails({...paymentDetails, cvv: e.target.value})}
                              placeholder="123"
                              maxLength="4"
                              className="w-full px-4 py-2 border rounded-lg"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {method.type === 'online' && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Email Address</label>
                        <input
                          type="email"
                          value={paymentDetails.email || ''}
                          onChange={(e) => setPaymentDetails({...paymentDetails, email: e.target.value})}
                          placeholder="your.email@example.com"
                          className="w-full px-4 py-2 border rounded-lg"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          You will be redirected to {method.name} to complete payment
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowPaymentModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handlePayment} className="flex-1" disabled={!selectedPaymentMethod}>
                  <Icon name="CreditCard" size={16} />
                  Confirm Payment
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JourneyPlannerEnhanced;
