import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/ui/Header';
import Button from '../components/ui/Button';
import Icon from '../components/AppIcon';

const JourneyPlanner = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const preselectedDestination = location.state?.destination;

  const [step, setStep] = useState(1); // Multi-step form
  const [journeyData, setJourneyData] = useState({
    // Location
    country: 'Tanzania',
    region: '',
    district: '',
    ward: '',
    destination: preselectedDestination?.name || '',
    nearbyAttractions: [],
    
    // Travel Details
    checkInDate: '',
    checkOutDate: '',
    adults: 1,
    children: 0,
    travelPurpose: 'vacation',
    transportType: 'rental-car',
    budgetRange: preselectedDestination?.price || 1000,
    
    // Accommodation
    accommodationType: 'hotel',
    accommodationPriceRange: 'mid-range',
    facilities: [],
    roomType: 'double',
    minRating: 4,
    
    // Activities & Extras
    tours: [],
    carRental: false,
    localEvents: [],
    mealPlan: 'breakfast',
    
    // Legacy fields
    budget: preselectedDestination?.price || 1000,
    accommodation: 'mid-range',
    transport: 'rental-car',
    activities: []
  });

  const [itinerary, setItinerary] = useState([]);
  const [showBudgetBreakdown, setShowBudgetBreakdown] = useState(false);
  const [savedJourneys, setSavedJourneys] = useState([]);
  const [showSummary, setShowSummary] = useState(false);

  // Redirect if not logged in
  if (!user) {
    navigate('/login');
    return null;
  }

  const destinations = [
    'Serengeti National Park',
    'Zanzibar Beach',
    'Mount Kilimanjaro',
    'Ngorongoro Crater',
    'Lake Manyara',
    'Tarangire National Park',
    'Ruaha National Park',
    'Selous Game Reserve'
  ];

  const accommodationOptions = [
    { id: 'budget', name: 'Budget', pricePerNight: 30, icon: 'Home' },
    { id: 'mid-range', name: 'Mid-Range', pricePerNight: 100, icon: 'Hotel' },
    { id: 'luxury', name: 'Luxury', pricePerNight: 250, icon: 'Star' }
  ];

  const transportOptions = [
    { id: 'rental-car', name: 'Rental Car', pricePerDay: 80, icon: 'Car' },
    { id: 'private-driver', name: 'Private Driver', pricePerDay: 150, icon: 'Users' },
    { id: 'tour-bus', name: 'Tour Bus', pricePerDay: 40, icon: 'Bus' }
  ];

  const activityOptions = [
    { id: 'game-drive', name: 'Game Drive', price: 100, icon: 'Binoculars' },
    { id: 'hot-air-balloon', name: 'Hot Air Balloon', price: 500, icon: 'Wind' },
    { id: 'cultural-tour', name: 'Cultural Tour', price: 50, icon: 'Users' },
    { id: 'walking-safari', name: 'Walking Safari', price: 80, icon: 'Footprints' },
    { id: 'boat-safari', name: 'Boat Safari', price: 120, icon: 'Waves' },
    { id: 'night-drive', name: 'Night Drive', price: 90, icon: 'Moon' }
  ];

  const calculateDays = () => {
    if (!journeyData.startDate || !journeyData.endDate) return 0;
    const start = new Date(journeyData.startDate);
    const end = new Date(journeyData.endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return days > 0 ? days : 0;
  };

  const calculateBudget = () => {
    const days = calculateDays();
    if (days === 0) return { total: 0, breakdown: {} };

    const accommodation = accommodationOptions.find(a => a.id === journeyData.accommodation);
    const transport = transportOptions.find(t => t.id === journeyData.transport);
    
    const accommodationCost = accommodation.pricePerNight * days * journeyData.travelers;
    const transportCost = transport.pricePerDay * days;
    const activitiesCost = journeyData.activities.reduce((sum, actId) => {
      const activity = activityOptions.find(a => a.id === actId);
      return sum + (activity ? activity.price * journeyData.travelers : 0);
    }, 0);
    const mealsCost = 30 * days * journeyData.travelers; // $30 per person per day
    const miscCost = 50 * days; // Miscellaneous expenses

    const total = accommodationCost + transportCost + activitiesCost + mealsCost + miscCost;

    return {
      total,
      breakdown: {
        accommodation: accommodationCost,
        transport: transportCost,
        activities: activitiesCost,
        meals: mealsCost,
        misc: miscCost
      }
    };
  };

  const budget = calculateBudget();
  const days = calculateDays();

  const toggleActivity = (activityId) => {
    setJourneyData(prev => ({
      ...prev,
      activities: prev.activities.includes(activityId)
        ? prev.activities.filter(id => id !== activityId)
        : [...prev.activities, activityId]
    }));
  };

  const generateItinerary = () => {
    const days = calculateDays();
    if (days === 0) {
      alert('Please select start and end dates');
      return;
    }

    const newItinerary = [];
    for (let i = 0; i < days; i++) {
      newItinerary.push({
        day: i + 1,
        activities: i === 0 ? ['Arrival & Check-in'] : 
                   i === days - 1 ? ['Check-out & Departure'] :
                   ['Morning Game Drive', 'Lunch', 'Afternoon Activities', 'Dinner']
      });
    }
    setItinerary(newItinerary);
    setShowBudgetBreakdown(true);
  };

  const saveJourney = () => {
    const journey = {
      ...journeyData,
      budget: budget.total,
      days,
      itinerary,
      createdAt: new Date().toISOString()
    };
    
    const savedJourneys = JSON.parse(localStorage.getItem(`journeys_${user.id}`) || '[]');
    savedJourneys.push(journey);
    localStorage.setItem(`journeys_${user.id}`, JSON.stringify(savedJourneys));
    
    alert('Journey plan saved successfully!');
    navigate('/traveler-dashboard');
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
              Create your perfect itinerary with budget breakdown
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Planning Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Details */}
              <div className="bg-card border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Trip Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Destination</label>
                    <select
                      value={journeyData.destination}
                      onChange={(e) => setJourneyData({...journeyData, destination: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="">Select destination</option>
                      {destinations.map(dest => (
                        <option key={dest} value={dest}>{dest}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Start Date</label>
                      <input
                        type="date"
                        value={journeyData.startDate}
                        onChange={(e) => setJourneyData({...journeyData, startDate: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">End Date</label>
                      <input
                        type="date"
                        value={journeyData.endDate}
                        onChange={(e) => setJourneyData({...journeyData, endDate: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Number of Travelers</label>
                    <input
                      type="number"
                      min="1"
                      value={journeyData.travelers}
                      onChange={(e) => setJourneyData({...journeyData, travelers: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Accommodation */}
              <div className="bg-card border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Accommodation</h2>
                <div className="grid grid-cols-3 gap-4">
                  {accommodationOptions.map(option => (
                    <button
                      key={option.id}
                      onClick={() => setJourneyData({...journeyData, accommodation: option.id})}
                      className={`p-4 border rounded-lg text-center ${
                        journeyData.accommodation === option.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:bg-muted'
                      }`}
                    >
                      <Icon name={option.icon} size={24} className="mx-auto mb-2" />
                      <div className="font-semibold">{option.name}</div>
                      <div className="text-sm text-muted-foreground">${option.pricePerNight}/night</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Transport */}
              <div className="bg-card border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Transport</h2>
                <div className="grid grid-cols-3 gap-4">
                  {transportOptions.map(option => (
                    <button
                      key={option.id}
                      onClick={() => setJourneyData({...journeyData, transport: option.id})}
                      className={`p-4 border rounded-lg text-center ${
                        journeyData.transport === option.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:bg-muted'
                      }`}
                    >
                      <Icon name={option.icon} size={24} className="mx-auto mb-2" />
                      <div className="font-semibold">{option.name}</div>
                      <div className="text-sm text-muted-foreground">${option.pricePerDay}/day</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Activities */}
              <div className="bg-card border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Activities</h2>
                <div className="grid grid-cols-2 gap-3">
                  {activityOptions.map(activity => (
                    <button
                      key={activity.id}
                      onClick={() => toggleActivity(activity.id)}
                      className={`p-3 border rounded-lg flex items-center space-x-3 ${
                        journeyData.activities.includes(activity.id)
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:bg-muted'
                      }`}
                    >
                      <Icon name={activity.icon} size={20} />
                      <div className="flex-1 text-left">
                        <div className="font-medium text-sm">{activity.name}</div>
                        <div className="text-xs text-muted-foreground">${activity.price}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Button fullWidth onClick={generateItinerary}>
                <Icon name="Calendar" size={20} />
                Generate Itinerary
              </Button>
            </div>

            {/* Budget Summary */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-primary to-secondary text-white rounded-lg p-6 sticky top-24">
                <h2 className="text-xl font-semibold mb-4">Budget Summary</h2>
                
                {days > 0 && (
                  <>
                    <div className="mb-4 pb-4 border-b border-white/20">
                      <div className="text-sm opacity-90 mb-1">Trip Duration</div>
                      <div className="text-2xl font-bold">{days} Days</div>
                    </div>

                    <div className="mb-4 pb-4 border-b border-white/20">
                      <div className="text-sm opacity-90 mb-1">Total Budget</div>
                      <div className="text-3xl font-bold">${budget.total.toLocaleString()}</div>
                      <div className="text-sm opacity-75 mt-1">
                        ${Math.round(budget.total / journeyData.travelers)} per person
                      </div>
                    </div>

                    {showBudgetBreakdown && (
                      <div className="space-y-2">
                        <div className="text-sm font-semibold mb-2">Breakdown:</div>
                        <div className="flex justify-between text-sm">
                          <span>Accommodation</span>
                          <span>${budget.breakdown.accommodation}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Transport</span>
                          <span>${budget.breakdown.transport}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Activities</span>
                          <span>${budget.breakdown.activities}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Meals</span>
                          <span>${budget.breakdown.meals}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Miscellaneous</span>
                          <span>${budget.breakdown.misc}</span>
                        </div>
                      </div>
                    )}

                    <Button 
                      fullWidth 
                      variant="outline" 
                      className="mt-6 bg-white text-primary hover:bg-white/90"
                      onClick={saveJourney}
                    >
                      <Icon name="Save" size={20} />
                      Save Journey Plan
                    </Button>
                  </>
                )}

                {days === 0 && (
                  <div className="text-center py-8 opacity-75">
                    <Icon name="Calendar" size={48} className="mx-auto mb-3" />
                    <p>Select dates to see budget</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Generated Itinerary */}
          {itinerary.length > 0 && (
            <div className="mt-8 bg-card border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-6">Your Itinerary</h2>
              <div className="space-y-4">
                {itinerary.map(day => (
                  <div key={day.day} className="border-l-4 border-primary pl-4">
                    <h3 className="font-semibold text-lg mb-2">Day {day.day}</h3>
                    <ul className="space-y-1">
                      {day.activities.map((activity, idx) => (
                        <li key={idx} className="text-muted-foreground flex items-center">
                          <Icon name="CheckCircle" size={16} className="mr-2 text-primary" />
                          {activity}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JourneyPlanner;
