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
import MultiTripModal from '../components/MultiTripModal';
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
  
  // Multi-trip state
  const [isMultiTripEnabled, setIsMultiTripEnabled] = useState(false);
  const [showMultiTripModal, setShowMultiTripModal] = useState(false);
  const [multiTripCount, setMultiTripCount] = useState(2);
  const [multiTripDestinations, setMultiTripDestinations] = useState([]);
  const [currentDestinationIndex, setCurrentDestinationIndex] = useState(0);
  
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
    const startDate = journeyData.checkInDate || journeyData.startDate;
    const endDate = journeyData.checkOutDate || journeyData.endDate;
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
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

  // Save multi-trip journey to backend
  const saveMultiTripJourney = async () => {
    if (!isMultiTripEnabled || multiTripDestinations.length < 2) {
      return null;
    }

    try {
      const token = JSON.parse(localStorage.getItem('isafari_user') || '{}').token;
      if (!token) {
        console.log('No auth token for multi-trip save');
        return null;
      }

      const journeyData = {
        journeyName: `Multi-Trip to ${multiTripDestinations[0]?.region || 'Tanzania'}`,
        destinations: multiTripDestinations.map(dest => ({
          country: 'Tanzania',
          region: dest.region,
          district: dest.district,
          sublocation: dest.ward || dest.district
        })),
        startDate: journeyData.checkInDate || journeyData.startDate,
        endDate: journeyData.checkOutDate || journeyData.endDate,
        travelers: journeyData.adults || journeyData.travelers || 1,
        budget: calculateTotalBudget()
      };

      const response = await fetch(`${API_URL}/multi-trip/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(journeyData)
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Multi-trip journey saved to database:', data.journey);
        return data.journey;
      } else {
        console.error('❌ Failed to save multi-trip:', data.message);
        return null;
      }
    } catch (error) {
      console.error('❌ Error saving multi-trip journey:', error);
      return null;
    }
  };

  const saveJourney = async () => {
    // If multi-trip is enabled, save to backend
    if (isMultiTripEnabled) {
      const savedJourney = await saveMultiTripJourney();
      if (savedJourney) {
        alert('Multi-trip journey saved successfully!');
        return;
      }
    }

    // Fallback to localStorage for single trips
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

  // Multi-trip handlers
  const handleEnableMultiTrip = (count) => {
    setMultiTripCount(count);
    setIsMultiTripEnabled(true);
    // Initialize empty destinations
    const emptyDestinations = Array.from({ length: count }, (_, i) => ({
      id: i,
      region: '',
      district: '',
      ward: '',
      street: '',
      isStartingPoint: i === 0,
      isEndingPoint: i === count - 1
    }));
    setMultiTripDestinations(emptyDestinations);
    setCurrentDestinationIndex(0);
  };

  const handleDisableMultiTrip = () => {
    setIsMultiTripEnabled(false);
    setMultiTripCount(2);
    setMultiTripDestinations([]);
    setCurrentDestinationIndex(0);
  };

  const handleMultiTripDestinationChange = (destIndex, locationData) => {
    setMultiTripDestinations(prev => {
      const updated = [...prev];
      updated[destIndex] = { 
        ...updated[destIndex], 
        region: locationData.region || '',
        district: locationData.district || '',
        ward: locationData.ward || '',
        street: locationData.street || ''
      };
      return updated;
    });
  };

  const areAllDestinationsComplete = () => {
    if (!isMultiTripEnabled) return true;
    return multiTripDestinations.every(dest => dest.region && dest.district);
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
      console.log('🔍 SMART FILTERING: Starting provider search...');
      console.log('📍 Raw Location from selector:', selectedLocation);
      console.log('🏷️ Selected Services:', journeyData.selectedServices);
      
      // Helper function for case-insensitive comparison
      const normalize = (str) => (str || '').toLowerCase().trim();
      
      // Fetch ALL services first
      const servicesResponse = await fetch(`${API_URL}/services?limit=500`);
      const servicesData = await servicesResponse.json();
      
      if (!servicesData.success || !servicesData.services || servicesData.services.length === 0) {
        console.log('⚠️ No services found in database');
        setProviders([]);
        setLoadingProviders(false);
        return;
      }
      
      let filteredServices = servicesData.services;
      console.log('📦 Total services before filtering:', filteredServices.length);
      
      // SMART HIERARCHICAL LOCATION FILTERING (Case-Insensitive)
      // NOTE: Frontend uses {region, district, ward, street} but DB uses {region, district, area}
      // So we need to map: ward → area in our search
      if (selectedLocation.region || selectedLocation.district || selectedLocation.ward) {
        const searchRegion = normalize(selectedLocation.region);
        const searchDistrict = normalize(selectedLocation.district);
        const searchArea = normalize(selectedLocation.ward); // ward maps to area in DB!
        
        console.log('🔍 Search criteria normalized:');
        console.log(`   Region: "${searchRegion}"`);
        console.log(`   District: "${searchDistrict}"`);
        console.log(`   Area/Ward: "${searchArea}"`);
        
        filteredServices = filteredServices.filter(service => {
          const serviceRegion = normalize(service.region);
          const serviceDistrict = normalize(service.district);
          const serviceArea = normalize(service.area);
          
          // Services without region cannot be matched
          if (!serviceRegion) {
            console.log(`   ⚠️ Service "${service.title}" has no region - excluded`);
            return false;
          }
          
          // Rule 1: Region MUST match (case-insensitive)
          if (searchRegion && serviceRegion !== searchRegion) {
            return false;
          }
          
          // Rule 2: District matching (hierarchical)
          // IMPORTANT: If user selected from LocationSelector, district might actually be an area!
          // Try to match against both district and area fields
          if (searchDistrict) {
            const districtMatchesDistrict = serviceDistrict === searchDistrict;
            const districtMatchesArea = serviceArea === searchDistrict; // District might be area!
            const isRegionLevelService = !serviceDistrict && !serviceArea;
            
            if (!districtMatchesDistrict && !districtMatchesArea && !isRegionLevelService) {
              return false;
            }
          }
          
          // Rule 3: Area/Ward matching (hierarchical)
          // Map frontend's "ward" to database's "area"
          if (searchArea) {
            const areaMatch = serviceArea === searchArea;
            const districtLevelService = !serviceArea && (serviceDistrict === searchDistrict || serviceDistrict === searchArea);
            const regionLevelService = !serviceArea && !serviceDistrict;
            
            if (!areaMatch && !districtLevelService && !regionLevelService) {
              return false;
            }
          }
          
          console.log(`   ✅ MATCHED: "${service.title}" (${serviceRegion} → ${serviceDistrict || 'N/A'} → ${serviceArea || 'N/A'})`);
          return true;
        });
        
        console.log(`📍 After location filter:`, filteredServices.length, 'services');
        console.log(`   Searched: Region="${selectedLocation.region}", District="${selectedLocation.district || 'ANY'}", Ward="${selectedLocation.ward || 'ANY'}"`);
      }
      
      // SMART SERVICE CATEGORY FILTERING (Case-Insensitive)
      if (journeyData.selectedServices && journeyData.selectedServices.length > 0) {
        const selectedCategoriesNormalized = journeyData.selectedServices.map(normalize);
        
        filteredServices = filteredServices.filter(service => {
          const serviceCategory = normalize(service.category);
          return selectedCategoriesNormalized.includes(serviceCategory);
        });
        
        console.log(`🏷️ After category filter (${journeyData.selectedServices.join(', ')}):`, filteredServices.length);
      }
      
      // If no services found, log helpful debug info
      if (filteredServices.length === 0) {
        console.log('❌ No services match criteria. Debug info:');
        console.log('   - Total services in DB:', servicesData.services.length);
        console.log('   - Filters applied: Region =', selectedLocation.region, ', District =', selectedLocation.district, ', Categories =', journeyData.selectedServices);
        
        // Show available services in the region
        const servicesInRegion = servicesData.services.filter(s => 
          normalize(s.region) === normalize(selectedLocation.region)
        );
        console.log(`   - Services in ${selectedLocation.region}:`, servicesInRegion.length);
        if (servicesInRegion.length > 0) {
          const availableCategories = [...new Set(servicesInRegion.map(s => s.category))];
          console.log('   - Available categories in region:', availableCategories.join(', '));
        }
        
        setProviders([]);
        setLoadingProviders(false);
        return;
      }
      
      // Group by provider
      const providerMap = new Map();
      filteredServices.forEach(service => {
        const providerId = service.provider_id;
        if (!providerId) return;
        
        if (!providerMap.has(providerId)) {
          providerMap.set(providerId, {
            id: providerId,
            business_name: service.business_name || 'Service Provider',
            business_type: service.category || 'General',
            location: service.location || `${service.district || ''}, ${service.region || ''}`.trim(),
            region: service.region,
            district: service.district,
            ward: service.area,
            is_verified: service.provider_verified || service.is_verified || false,
            is_premium: service.provider_premium || false,
            rating: service.average_rating || 0,
            total_reviews: service.review_count || 0,
            service_categories: [service.category],
            services: [service],
            services_count: 1,
            description: service.provider_description || service.description,
            price: service.price
          });
        } else {
          const provider = providerMap.get(providerId);
          if (!provider.service_categories.includes(service.category)) {
            provider.service_categories.push(service.category);
          }
          provider.services.push(service);
          provider.services_count++;
        }
      });
      
      const matchingProviders = Array.from(providerMap.values());
      console.log('✅ Providers matching criteria:', matchingProviders.length);
      console.log('✅ Provider details:', matchingProviders.map(p => ({
        name: p.business_name,
        location: `${p.district || ''}, ${p.region || ''}`,
        categories: p.service_categories,
        servicesCount: p.services_count
      })));
      
      setProviders(matchingProviders);
      
    } catch (error) {
      console.error('❌ Error fetching providers:', error);
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
    // Add selected services to journey data with destination info for multi-trip
    setJourneyData(prev => {
      const existingServices = prev.selectedServiceDetails || [];
      
      // Get current destination for multi-trip - use the destination that matches provider's location
      let currentDestIndex = 0;
      if (isMultiTripEnabled && multiTripDestinations.length > 0) {
        // Find which destination this provider belongs to based on region/district
        const providerRegion = (provider.region || '').toLowerCase();
        const providerDistrict = (provider.district || '').toLowerCase();
        
        const matchingDestIndex = multiTripDestinations.findIndex(dest => {
          const destRegion = (dest.region || '').toLowerCase();
          const destDistrict = (dest.district || '').toLowerCase();
          return destRegion === providerRegion || destDistrict === providerDistrict;
        });
        
        currentDestIndex = matchingDestIndex >= 0 ? matchingDestIndex : currentDestinationIndex;
      }
      
      const currentDest = isMultiTripEnabled && multiTripDestinations[currentDestIndex] 
        ? multiTripDestinations[currentDestIndex] 
        : selectedLocation;
      
      const newServices = services.map(service => ({
        ...service,
        provider_name: provider.business_name,
        provider_id: provider.id,
        provider_location: provider.location,
        // Add destination info for multi-trip filtering
        region: service.region || provider.region || currentDest.region,
        district: service.district || provider.district || currentDest.district,
        destinationIndex: currentDestIndex
      }));
      
      return {
        ...prev,
        selectedServiceDetails: [...existingServices, ...newServices],
        // Also add provider if not already selected
        selectedProviders: prev.selectedProviders?.find(p => p.id === provider.id)
          ? prev.selectedProviders
          : [...(prev.selectedProviders || []), {
              ...provider,
              region: provider.region || currentDest.region,
              district: provider.district || currentDest.district,
              destinationIndex: currentDestIndex
            }]
      };
    });
    
    // Close modal but STAY on providers page (step 4) - don't go to summary automatically
    setShowProviderModal(false);
    // Removed: setStep(5); - Let traveler click "View Summary" when ready
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold mb-4">Select Location (Tanzania)</h2>
        
        {/* Multi-Trip Toggle Button */}
        <button
          onClick={() => {
            if (isMultiTripEnabled) {
              handleDisableMultiTrip();
            } else {
              setShowMultiTripModal(true);
            }
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
            isMultiTripEnabled 
              ? 'border-primary bg-primary/10 text-primary' 
              : 'border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
          }`}
        >
          <Icon name="Route" size={18} />
          <span className="text-sm font-medium">
            {isMultiTripEnabled ? `${multiTripCount} Destinations` : 'Multiple Destinations'}
          </span>
          {isMultiTripEnabled && (
            <Icon name="X" size={14} className="ml-1" />
          )}
        </button>
      </div>

      {/* Multi-Trip Info Banner */}
      {isMultiTripEnabled && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center gap-2 text-primary mb-2">
            <Icon name="Route" size={20} />
            <span className="font-medium">Multi-Destination Trip</span>
          </div>
          <p className="text-sm text-muted-foreground">
            You're planning a trip with {multiTripCount} destinations. Fill in each location below.
          </p>
        </div>
      )}
      
      {/* Single Location or Multi-Trip Locations */}
      {isMultiTripEnabled ? (
        <div className="space-y-6">
          {multiTripDestinations.map((dest, index) => (
            <div key={dest.id} className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  dest.isStartingPoint ? 'bg-green-100 text-green-600' :
                  dest.isEndingPoint ? 'bg-red-100 text-red-600' :
                  'bg-primary/10 text-primary'
                }`}>
                  <Icon 
                    name={dest.isStartingPoint ? 'Play' : dest.isEndingPoint ? 'Flag' : 'MapPin'} 
                    size={16} 
                  />
                </div>
                <span className="font-medium">
                  {dest.isStartingPoint ? 'Starting Point' : 
                   dest.isEndingPoint ? 'Final Destination' : 
                   `Stop ${index}`}
                </span>
              </div>
              <LocationSelector
                value={{
                  region: dest.region,
                  district: dest.district,
                  ward: dest.ward,
                  street: dest.street
                }}
                onChange={(loc) => handleMultiTripDestinationChange(index, loc)}
                required={true}
                showWard={true}
                showStreet={true}
              />
            </div>
          ))}
        </div>
      ) : (
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
      )}

      <div className="flex justify-end space-x-4 pt-6">
        <Button 
          onClick={nextStep} 
          disabled={isMultiTripEnabled ? !areAllDestinationsComplete() : (!selectedLocation.region || !selectedLocation.district)}
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

          {/* Show selected services indicator */}
          {journeyData.selectedServiceDetails && journeyData.selectedServiceDetails.length > 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2 flex items-center">
                <Icon name="CheckCircle" size={18} className="mr-2" />
                Services Added ({journeyData.selectedServiceDetails.length})
              </h4>
              <div className="space-y-2">
                {journeyData.selectedServiceDetails.map((service, idx) => (
                  <div key={`added-service-${service.id}-${idx}`} className="flex items-center justify-between text-sm">
                    <span className="text-green-700 dark:text-green-300">
                      {service.title} - {service.provider_name}
                    </span>
                    <span className="font-medium text-green-800 dark:text-green-200">
                      TZS {parseFloat(service.price || 0).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                Click "View Summary" to see your complete trip plan
              </p>
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

    // Helper function to get destination title
    const getDestinationTitle = (dest, index) => {
      const locationName = [dest.district, dest.region].filter(Boolean).join(', ') || 'Not set';
      if (dest.isStartingPoint) return `🟢 Trip ${index + 1} - Starting Point: ${locationName}`;
      if (dest.isEndingPoint) return `🔴 Trip ${index + 1} - Final Destination: ${locationName}`;
      return `📍 Trip ${index + 1} - Stop ${index}: ${locationName}`;
    };

    // Helper function to get services for a specific destination
    const getServicesForDestination = (dest, destIndex) => {
      if (!journeyData.selectedServiceDetails) return [];
      return journeyData.selectedServiceDetails.filter(service => {
        // First check by destinationIndex if available
        if (service.destinationIndex !== undefined) {
          return service.destinationIndex === destIndex;
        }
        // Fallback to location matching
        const serviceRegion = (service.region || service.provider_location?.region || '').toLowerCase();
        const serviceDistrict = (service.district || service.provider_location?.district || '').toLowerCase();
        const destRegion = (dest.region || '').toLowerCase();
        const destDistrict = (dest.district || '').toLowerCase();
        return serviceRegion === destRegion || serviceDistrict === destDistrict;
      });
    };

    // Helper function to get providers for a specific destination
    const getProvidersForDestination = (dest, destIndex) => {
      if (!journeyData.selectedProviders) return [];
      return journeyData.selectedProviders.filter(provider => {
        // First check by destinationIndex if available
        if (provider.destinationIndex !== undefined) {
          return provider.destinationIndex === destIndex;
        }
        // Fallback to location matching
        const providerRegion = (provider.region || provider.location_data?.region || '').toLowerCase();
        const providerDistrict = (provider.district || provider.location_data?.district || '').toLowerCase();
        const destRegion = (dest.region || '').toLowerCase();
        const destDistrict = (dest.district || '').toLowerCase();
        return providerRegion === destRegion || providerDistrict === destDistrict;
      });
    };

    // For multi-trip, render each destination separately
    const renderMultiTripSummary = () => (
      <div className="space-y-8">
        {multiTripDestinations.map((dest, index) => {
          const destServices = getServicesForDestination(dest, index);
          const destProviders = getProvidersForDestination(dest, index);
          const destServicesCost = destServices.reduce((total, s) => total + (parseFloat(s.price) || 0), 0);
          
          return (
            <div key={`trip-${index}`} className="border-2 border-primary/30 rounded-xl overflow-hidden">
              {/* Trip Header */}
              <div className="bg-gradient-to-br from-primary to-secondary text-white p-6">
                <h3 className="text-xl font-semibold mb-4">
                  {getDestinationTitle(dest, index)}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm opacity-90">Duration</div>
                    <div className="text-2xl font-bold">{days || 0} Days</div>
                  </div>
                  <div>
                    <div className="text-sm opacity-90">Total Budget</div>
                    <div className="text-2xl font-bold">TZS {destServicesCost.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm opacity-90">Travelers</div>
                    <div className="text-lg font-semibold">{travelers} {travelers === 1 ? 'Person' : 'People'}</div>
                  </div>
                  <div>
                    <div className="text-sm opacity-90">Per Person</div>
                    <div className="text-lg font-semibold">TZS {Math.round(destServicesCost / travelers).toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Trip Details Grid */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Location Details */}
                  <div className="bg-card border rounded-lg p-6">
                    <h4 className="font-semibold mb-3 flex items-center">
                      <Icon name="MapPin" size={20} className="mr-2 text-primary" />
                      Location Details (Tanzania)
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Region (Mkoa):</strong> {dest.region || 'Not set'}</div>
                      <div><strong>District (Wilaya):</strong> {dest.district || 'Not set'}</div>
                      {dest.ward && <div><strong>Ward (Kata):</strong> {dest.ward}</div>}
                      {dest.street && <div><strong>Street (Mtaa):</strong> {dest.street}</div>}
                      <div><strong>Destination:</strong> {
                        [dest.ward, dest.district, dest.region].filter(Boolean).join(', ') || 'Not set'
                      }</div>
                    </div>
                  </div>

                  {/* Travel Dates */}
                  <div className="bg-card border rounded-lg p-6">
                    <h4 className="font-semibold mb-3 flex items-center">
                      <Icon name="Calendar" size={20} className="mr-2 text-primary" />
                      Travel Dates
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Start Date:</strong> {(journeyData.checkInDate || journeyData.startDate) ? new Date(journeyData.checkInDate || journeyData.startDate).toLocaleDateString() : 'Not set'}</div>
                      <div><strong>End Date:</strong> {(journeyData.checkOutDate || journeyData.endDate) ? new Date(journeyData.checkOutDate || journeyData.endDate).toLocaleDateString() : 'Not set'}</div>
                      {journeyData.travelPurpose && <div><strong>Purpose:</strong> {travelPurposes.find(p => p.id === journeyData.travelPurpose)?.name}</div>}
                      {journeyData.transportType && <div><strong>Transport:</strong> {transportTypes.find(t => t.id === journeyData.transportType)?.name}</div>}
                    </div>
                  </div>

                  {/* Accommodation */}
                  <div className="bg-card border rounded-lg p-6">
                    <h4 className="font-semibold mb-3 flex items-center">
                      <Icon name="Hotel" size={20} className="mr-2 text-primary" />
                      Accommodation
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Type:</strong> {accommodationTypes.find(a => a.id === journeyData.accommodationType)?.name || 'Not set'}</div>
                      <div><strong>Price Range:</strong> {priceRanges.find(p => p.id === journeyData.priceRange)?.name || 'Not set'}</div>
                      <div><strong>Room:</strong> {roomTypes.find(r => r.id === journeyData.roomType)?.name || 'Not set'}</div>
                      <div><strong>Rating:</strong> {journeyData.minRating}+ stars</div>
                    </div>
                  </div>

                  {/* Selected Services for this destination */}
                  <div className="bg-card border rounded-lg p-6">
                    <h4 className="font-semibold mb-3 flex items-center">
                      <Icon name="Briefcase" size={20} className="mr-2 text-primary" />
                      Selected Services ({destServices.length})
                    </h4>
                    <div className="space-y-3 text-sm max-h-48 overflow-y-auto">
                      {destServices.length > 0 ? (
                        destServices.map((service, idx) => (
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
                        <div className="text-muted-foreground">No services selected for this destination</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Selected Providers for this destination */}
                {destProviders.length > 0 && (
                  <div className="bg-card border rounded-lg p-6 mt-6">
                    <h4 className="font-semibold mb-4 flex items-center">
                      <Icon name="Users" size={20} className="mr-2 text-primary" />
                      Selected Service Providers ({destProviders.length})
                    </h4>
                    <div className="space-y-4">
                      {destProviders.map((provider, idx) => (
                        <div key={`provider-${provider.id}-${idx}`} className="flex items-start justify-between p-4 bg-muted/50 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium">{provider.business_name || provider.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {Array.isArray(provider.service_categories) 
                                ? provider.service_categories.join(', ') 
                                : provider.service_category || ''}
                            </div>
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <Icon name="MapPin" size={12} />
                              {provider.location_data?.district || provider.district || ''}, {provider.location_data?.region || provider.region || ''}
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="font-semibold text-primary">
                              TZS {parseFloat(provider.price || 0).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Grand Total for all trips */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl p-6">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-lg font-semibold">Grand Total ({multiTripDestinations.length} Destinations)</h4>
              <p className="text-sm opacity-90">{travelers} traveler(s) × {days || 0} days</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">TZS {totalBudget.toLocaleString()}</div>
              <div className="text-sm opacity-90">TZS {Math.round(totalBudget / travelers).toLocaleString()} per person</div>
            </div>
          </div>
        </div>
      </div>
    );

    // For single trip, render original summary
    const renderSingleTripSummary = () => (
      <>
        <div className="bg-gradient-to-br from-primary to-secondary text-white rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Your Journey to {
            [selectedLocation.district, selectedLocation.region].filter(Boolean).join(', ') || journeyData.destination || 'Tanzania'
          }</h3>
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
              <div><strong>Region (Mkoa):</strong> {selectedLocation.region || 'Not set'}</div>
              <div><strong>District (Wilaya):</strong> {selectedLocation.district || 'Not set'}</div>
              {selectedLocation.ward && <div><strong>Ward (Kata):</strong> {selectedLocation.ward}</div>}
              {selectedLocation.street && <div><strong>Street (Mtaa):</strong> {selectedLocation.street}</div>}
              <div><strong>Destination:</strong> {
                [selectedLocation.ward, selectedLocation.district, selectedLocation.region].filter(Boolean).join(', ') || 'Not set'
              }</div>
            </div>
          </div>

          <div className="bg-card border rounded-lg p-6">
            <h4 className="font-semibold mb-3 flex items-center">
              <Icon name="Calendar" size={20} className="mr-2 text-primary" />
              Travel Dates
            </h4>
            <div className="space-y-2 text-sm">
              <div><strong>Start Date:</strong> {(journeyData.checkInDate || journeyData.startDate) ? new Date(journeyData.checkInDate || journeyData.startDate).toLocaleDateString() : 'Not set'}</div>
              <div><strong>End Date:</strong> {(journeyData.checkOutDate || journeyData.endDate) ? new Date(journeyData.checkOutDate || journeyData.endDate).toLocaleDateString() : 'Not set'}</div>
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
              <div><strong>Type:</strong> {accommodationTypes.find(a => a.id === journeyData.accommodationType)?.name || 'Not set'}</div>
              <div><strong>Price Range:</strong> {priceRanges.find(p => p.id === journeyData.priceRange)?.name || 'Not set'}</div>
              <div><strong>Room:</strong> {roomTypes.find(r => r.id === journeyData.roomType)?.name || 'Not set'}</div>
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
      </>
    );

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold mb-4">
          {isMultiTripEnabled ? `Multi-Trip Summary (${multiTripDestinations.length} Destinations)` : 'Trip Summary'}
        </h2>
        
        {isMultiTripEnabled && multiTripDestinations.length > 0 ? renderMultiTripSummary() : renderSingleTripSummary()}

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={prevStep}>
            <Icon name="ArrowLeft" size={16} /> Back
          </Button>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={async () => {
              // Save journey plan - use API for multi-trip
              if (isMultiTripEnabled) {
                const savedJourney = await saveMultiTripJourney();
                if (savedJourney) {
                  alert('✅ Multi-trip plan saved! View it in Dashboard > My Trips');
                  navigate('/traveler-dashboard?tab=trips');
                  return;
                }
              }

              // Build location string for multiple destinations
              let locationString = '';
              if (isMultiTripEnabled && multiTripDestinations.length > 0) {
                locationString = multiTripDestinations
                  .filter(dest => dest.region)
                  .map(dest => `${dest.ward || dest.district || ''}, ${dest.district || ''}, ${dest.region}`.replace(/^, |, $/g, ''))
                  .join(' → ');
              } else {
                locationString = `${selectedLocation.ward || selectedLocation.district || ''}, ${selectedLocation.district || ''}, ${selectedLocation.region}`.replace(/^, |, $/g, '');
              }

              // Fallback to localStorage for single trips
              const journeyPlan = {
                id: Date.now(),
                status: 'saved',
                country: 'Tanzania',
                region: isMultiTripEnabled ? multiTripDestinations[0]?.region : selectedLocation.region,
                district: isMultiTripEnabled ? multiTripDestinations[0]?.district : selectedLocation.district,
                area: isMultiTripEnabled ? (multiTripDestinations[0]?.ward || multiTripDestinations[0]?.district) : (selectedLocation.ward || selectedLocation.district),
                locationString: locationString,
                isMultiTrip: isMultiTripEnabled,
                destinations: isMultiTripEnabled ? multiTripDestinations : null,
                startDate: journeyData.checkInDate || journeyData.startDate,
                endDate: journeyData.checkOutDate || journeyData.endDate,
                travelers: journeyData.adults || journeyData.travelers || 1,
                services: journeyData.selectedServiceDetails?.map(service => ({
                  id: service.id,
                  service_id: service.id,
                  title: service.title,
                  name: service.title,
                  category: service.category,
                  price: parseFloat(service.price || 0),
                  provider_id: service.provider_id,
                  provider_name: service.provider_name,
                  location: service.provider_location || service.location,
                  image: service.images?.[0],
                  description: service.description
                })) || [],
                totalCost: totalBudget,
                created_at: new Date().toISOString()
              };
              
              // Get existing plans
              const existingPlans = JSON.parse(localStorage.getItem('journey_plans') || '[]');
              existingPlans.push(journeyPlan);
              localStorage.setItem('journey_plans', JSON.stringify(existingPlans));
              
              alert('✅ Trip plan saved! View it in Dashboard > My Trips');
              navigate('/traveler-dashboard?tab=trips');
            }}>
              <Icon name="Save" size={16} /> Save Plan
            </Button>
            <Button variant="secondary" onClick={async () => {
              // Pre-Order: Create booking requests for all selected services
              if (!journeyData.selectedServiceDetails || journeyData.selectedServiceDetails.length === 0) {
                alert('Please select services from providers first!');
                return;
              }

              const userData = JSON.parse(localStorage.getItem('isafari_user') || '{}');
              const token = userData.token;

              if (!token) {
                alert('Please login to create pre-orders');
                navigate('/login');
                return;
              }

              try {
                const bookingDate = journeyData.checkInDate || journeyData.startDate || new Date().toISOString().split('T')[0];
                const participants = journeyData.adults || journeyData.travelers || 1;
                
                let successCount = 0;
                let failCount = 0;

                for (const service of journeyData.selectedServiceDetails) {
                  try {
                    const response = await fetch(`${API_URL}/bookings`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify({
                        serviceId: parseInt(service.id),
                        bookingDate: bookingDate,
                        participants: parseInt(participants)
                      })
                    });

                    const data = await response.json();
                    if (data.success) {
                      successCount++;
                    } else {
                      failCount++;
                      console.error('Pre-order failed for service:', service.title, data.message);
                    }
                  } catch (error) {
                    failCount++;
                    console.error('Pre-order error for service:', service.title, error);
                  }
                }

                if (successCount > 0) {
                  alert(`✅ ${successCount} pre-order(s) created successfully!${failCount > 0 ? ` (${failCount} failed)` : ''}\n\nRedirecting to My Pre-Orders...`);
                  navigate('/traveler-dashboard?tab=cart');
                } else {
                  alert('❌ Failed to create pre-orders. Please try again.');
                }
              } catch (error) {
                console.error('Pre-order error:', error);
                alert('Error creating pre-orders. Please try again.');
              }
            }}>
              <Icon name="Clock" size={16} /> Pre-Order
            </Button>
            <Button onClick={() => {
              // Save trip AND add to cart
              const journeyPlan = {
                id: Date.now(),
                status: 'saved',
                country: 'Tanzania',
                region: selectedLocation.region,
                district: selectedLocation.district,
                area: selectedLocation.ward || selectedLocation.district,
                startDate: journeyData.checkInDate || journeyData.startDate,
                endDate: journeyData.checkOutDate || journeyData.endDate,
                travelers: journeyData.adults || journeyData.travelers || 1,
                services: journeyData.selectedServiceDetails?.map(service => ({
                  id: service.id,
                  service_id: service.id,
                  title: service.title,
                  name: service.title,
                  category: service.category,
                  price: parseFloat(service.price || 0),
                  provider_id: service.provider_id,
                  provider_name: service.provider_name,
                  location: service.provider_location || service.location,
                  image: service.images?.[0],
                  description: service.description
                })) || [],
                totalCost: totalBudget,
                created_at: new Date().toISOString()
              };
              
              // Save plan
              const existingPlans = JSON.parse(localStorage.getItem('journey_plans') || '[]');
              existingPlans.push(journeyPlan);
              localStorage.setItem('journey_plans', JSON.stringify(existingPlans));
              
              // Add services to cart
              const cartItems = journeyData.selectedServiceDetails?.map(service => ({
                id: `service_${service.id}_${Date.now()}`,
                service_id: service.id,
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
                  startDate: journeyData.checkInDate || journeyData.startDate,
                  endDate: journeyData.checkOutDate || journeyData.endDate,
                  travelers: journeyData.adults || journeyData.travelers || 1,
                  destination: journeyData.destination
                }
              })) || [];

              if (cartItems.length > 0) {
                addMultipleToCart(cartItems);
                navigate('/traveler-dashboard?tab=cart&openPayment=true');
              } else {
                alert('Please select services from providers first!');
              }
            }}>
              <Icon name="ShoppingCart" size={16} /> Continue to Cart & Payment
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

          {/* Note about saved trips */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg">
              <Icon name="Info" size={16} />
              <span className="text-sm">Your saved trips are available in Dashboard → My Trips</span>
            </div>
          </div>
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

      {/* Multi-Trip Modal */}
      <MultiTripModal
        isOpen={showMultiTripModal}
        onClose={() => setShowMultiTripModal(false)}
        onConfirm={handleEnableMultiTrip}
      />
    </div>
  );
};

export default JourneyPlannerEnhanced;
