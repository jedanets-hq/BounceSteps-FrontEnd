import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../contexts/AuthContext';
import { API_URL } from '../../../utils/api';

const ServicePromotion = () => {
  const { user } = useAuth();
  const [selectedService, setSelectedService] = useState(null);
  const [promotionType, setPromotionType] = useState('');
  const [showServiceSelection, setShowServiceSelection] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [myServices, setMyServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });

  useEffect(() => {
    fetchMyServices();
  }, []);

  const fetchMyServices = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      const token = userData.token;
      
      const response = await fetch(`${API_URL}/services/provider/my-services`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setMyServices(data.services);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  const promotionOptions = [
    {
      id: 'featured',
      name: 'Featured Carousel',
      description: 'Display your service in the top featured carousel on homepage',
      price: 50000,
      duration_days: 30,
      duration: '30 days',
      benefits: ['Top carousel placement', 'Maximum visibility', 'Premium badge', 'Homepage slides'],
      icon: 'Star',
      color: 'bg-purple-500'
    },
    {
      id: 'trending',
      name: 'Trending Services',
      description: 'Feature your service in the trending section',
      price: 30000,
      duration_days: 30,
      duration: '30 days',
      benefits: ['Homepage trending section', 'Increased visibility', 'Priority in search'],
      icon: 'TrendingUp',
      color: 'bg-orange-500'
    },
    {
      id: 'search_boost',
      name: 'Search Boost',
      description: 'Boost your service to top of search results',
      price: 20000,
      duration_days: 30,
      duration: '30 days',
      benefits: ['Top search results', 'Category priority', 'Enhanced listing'],
      icon: 'Search',
      color: 'bg-blue-500'
    }
  ];

  const handlePromoteClick = (promoType) => {
    if (myServices.length === 0) {
      alert('Please add a service first before promoting');
      return;
    }
    setPromotionType(promoType);
    setSelectedService(null);
    setShowServiceSelection(true);
    setShowPaymentForm(false);
  };

  const handleServiceSelect = (serviceId) => {
    setSelectedService(serviceId);
  };

  const handleProceedToPayment = () => {
    if (!selectedService) {
      alert('Please select a service to promote');
      return;
    }
    setShowPaymentForm(true);
  };

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cardNumber') {
      formattedValue = value.replace(/\D/g, '').slice(0, 16);
      formattedValue = formattedValue.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
    } else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    } else if (name === 'expiryMonth' || name === 'expiryYear') {
      formattedValue = value.replace(/\D/g, '').slice(0, 2);
    }

    setCardDetails(prev => ({ ...prev, [name]: formattedValue }));
  };

  const validateCard = () => {
    const { cardNumber, cardHolder, expiryMonth, expiryYear, cvv } = cardDetails;
    
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 13) {
      alert('Please enter a valid card number');
      return false;
    }
    if (!cardHolder || cardHolder.length < 3) {
      alert('Please enter the cardholder name');
      return false;
    }
    if (!expiryMonth || parseInt(expiryMonth) < 1 || parseInt(expiryMonth) > 12) {
      alert('Please enter a valid expiry month (01-12)');
      return false;
    }
    if (!expiryYear || parseInt(expiryYear) < 24) {
      alert('Please enter a valid expiry year');
      return false;
    }
    if (!cvv || cvv.length < 3) {
      alert('Please enter a valid CVV');
      return false;
    }
    return true;
  };

  const getCardBrand = (number) => {
    const cleanNumber = number.replace(/\s/g, '');
    if (/^4/.test(cleanNumber)) return 'visa';
    if (/^5[1-5]/.test(cleanNumber)) return 'mastercard';
    if (/^3[47]/.test(cleanNumber)) return 'amex';
    return 'unknown';
  };

  const handleConfirmPayment = async () => {
    if (!validateCard()) return;

    setProcessing(true);
    
    try {
      const promotion = promotionOptions.find(p => p.id === promotionType);
      const userData = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      const token = userData.token;
      
      const cardBrand = getCardBrand(cardDetails.cardNumber);
      const cardLastFour = cardDetails.cardNumber.replace(/\s/g, '').slice(-4);
      
      const response = await fetch(`${API_URL}/services/${selectedService}/promote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          promotion_type: promotionType,
          duration_days: promotion.duration_days,
          payment_method: 'card',
          payment_reference: `CARD-${Date.now()}`,
          amount: promotion.price,
          card_last_four: cardLastFour,
          card_brand: cardBrand,
          card_holder: cardDetails.cardHolder
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ Payment Successful!\n\nYour promotion request has been submitted.\nAmount: TZS ${promotion.price.toLocaleString()}\nCard: ${cardBrand.toUpperCase()} ****${cardLastFour}\n\nYour request will be reviewed by admin. Once approved, your service will be promoted automatically.`);
        setShowServiceSelection(false);
        setShowPaymentForm(false);
        setSelectedService(null);
        setCardDetails({ cardNumber: '', cardHolder: '', expiryMonth: '', expiryYear: '', cvv: '' });
        fetchMyServices();
      } else {
        alert(data.message || 'Payment failed. Please try again.');
      }
    } catch (err) {
      console.error('Payment error:', err);
      alert('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const selectedPromotion = promotionOptions.find(p => p.id === promotionType);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-xl font-medium">Service Promotion</h3>
          <p className="text-sm text-muted-foreground">Boost your services visibility and get more bookings</p>
        </div>
        <div className="flex items-center space-x-2">
          <Icon name="TrendingUp" size={20} className="text-primary" />
          <span className="text-sm font-medium text-primary">Boost Your Business</span>
        </div>
      </div>

      {/* Promotion Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {promotionOptions.map((option) => (
          <div key={option.id} className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 ${option.color} rounded-lg flex items-center justify-center`}>
                  <Icon name={option.icon} size={24} className="text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{option.name}</h4>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-4">{option.description}</p>

            <div className="mb-4">
              <div className="text-2xl font-bold text-foreground">TZS {option.price.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">{option.duration}</div>
            </div>

            <div className="space-y-2 mb-4">
              {option.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Icon name="Check" size={14} className="text-green-500" />
                  <span className="text-sm text-muted-foreground">{benefit}</span>
                </div>
              ))}
            </div>

            <Button variant="default" className="w-full" onClick={() => handlePromoteClick(option.id)}>
              <Icon name="TrendingUp" size={16} />
              Promote Now
            </Button>
          </div>
        ))}
      </div>

      {/* My Services - Promotion Status */}
      <div>
        <h4 className="font-medium text-foreground mb-4">Your Services Promotion Status</h4>
        {loading ? (
          <div className="text-center py-8">
            <Icon name="Loader2" size={32} className="animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground mt-2">Loading services...</p>
          </div>
        ) : myServices.length === 0 ? (
          <div className="text-center py-8 bg-muted/50 rounded-lg">
            <Icon name="Package" size={48} className="mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No services yet. Add a service first to promote it.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myServices.map((service) => (
              <div key={service.id} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h5 className="font-medium text-foreground">{service.title}</h5>
                      <p className="text-sm text-muted-foreground">{service.category} • TZS {parseFloat(service.price).toLocaleString()}</p>
                    </div>
                    {service.is_featured && (
                      <div className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Icon name="Star" size={12} />
                        Promoted
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!service.is_featured ? (
                      <Button variant="outline" size="sm" onClick={() => handlePromoteClick('featured')}>
                        <Icon name="TrendingUp" size={14} />
                        Promote
                      </Button>
                    ) : (
                      <div className="text-xs text-success flex items-center gap-1">
                        <Icon name="CheckCircle" size={14} />
                        Active
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Service Selection & Payment Modal */}
      {showServiceSelection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border border-border rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-foreground text-lg">
                {showPaymentForm ? 'Payment Details' : 'Select Service to Promote'}
              </h3>
              <button onClick={() => {
                setShowServiceSelection(false);
                setShowPaymentForm(false);
                setSelectedService(null);
                setCardDetails({ cardNumber: '', cardHolder: '', expiryMonth: '', expiryYear: '', cvv: '' });
              }}>
                <Icon name="X" size={20} className="text-muted-foreground" />
              </button>
            </div>
            
            {!showPaymentForm ? (
              <div className="space-y-6">
                {/* Promotion Summary */}
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4 border border-primary/20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 ${selectedPromotion?.color} rounded-lg flex items-center justify-center`}>
                      <Icon name={selectedPromotion?.icon} size={20} className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{selectedPromotion?.name}</h4>
                      <p className="text-sm text-muted-foreground">{selectedPromotion?.duration}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <span className="text-sm text-muted-foreground">Price:</span>
                    <span className="text-xl font-bold text-primary">TZS {selectedPromotion?.price.toLocaleString()}</span>
                  </div>
                </div>

                {/* Select Service */}
                <div>
                  <label className="text-sm font-medium text-foreground block mb-3">
                    <Icon name="Package" size={16} className="inline mr-2" />
                    Select Service to Promote
                  </label>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {myServices.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => handleServiceSelect(service.id)}
                        className={`w-full text-left p-4 border-2 rounded-lg transition-all ${
                          selectedService === service.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium text-foreground">{service.title}</h5>
                            <p className="text-sm text-muted-foreground">{service.category} • TZS {parseFloat(service.price).toLocaleString()}</p>
                          </div>
                          {selectedService === service.id && (
                            <Icon name="CheckCircle" size={20} className="text-primary" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <Button variant="outline" className="flex-1" onClick={() => { setShowServiceSelection(false); setSelectedService(null); }}>
                    Cancel
                  </Button>
                  <Button variant="default" className="flex-1" disabled={!selectedService} onClick={handleProceedToPayment}>
                    <Icon name="CreditCard" size={16} />
                    Proceed to Payment
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Order Summary */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium text-foreground mb-3">Order Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Promotion Type:</span>
                      <span className="font-medium">{selectedPromotion?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium">{selectedPromotion?.duration}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span className="font-medium">Total Amount:</span>
                      <span className="text-xl font-bold text-primary">TZS {selectedPromotion?.price.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Card Payment Form */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Icon name="CreditCard" size={20} className="text-primary" />
                    <span className="font-medium">Pay with Visa/MasterCard</span>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">Card Number</label>
                    <input type="text" name="cardNumber" value={cardDetails.cardNumber} onChange={handleCardInputChange} placeholder="1234 5678 9012 3456" className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">Cardholder Name</label>
                    <input type="text" name="cardHolder" value={cardDetails.cardHolder} onChange={handleCardInputChange} placeholder="JOHN DOE" className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary uppercase" />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-2">Month</label>
                      <input type="text" name="expiryMonth" value={cardDetails.expiryMonth} onChange={handleCardInputChange} placeholder="MM" className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-center" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-2">Year</label>
                      <input type="text" name="expiryYear" value={cardDetails.expiryYear} onChange={handleCardInputChange} placeholder="YY" className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-center" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-2">CVV</label>
                      <input type="password" name="cvv" value={cardDetails.cvv} onChange={handleCardInputChange} placeholder="***" className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-center" />
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Icon name="Shield" size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-700 dark:text-blue-300">Your payment is secure. Card details are encrypted and processed securely.</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <Button variant="outline" className="flex-1" onClick={() => setShowPaymentForm(false)} disabled={processing}>
                    <Icon name="ArrowLeft" size={16} />
                    Back
                  </Button>
                  <Button variant="default" className="flex-1 bg-green-600 hover:bg-green-700" disabled={processing} onClick={handleConfirmPayment}>
                    {processing ? (
                      <><Icon name="Loader2" size={16} className="animate-spin" /> Processing...</>
                    ) : (
                      <><Icon name="Lock" size={16} /> Pay TZS {selectedPromotion?.price.toLocaleString()}</>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicePromotion;
