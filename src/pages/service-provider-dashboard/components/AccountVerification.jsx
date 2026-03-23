import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import VerifiedBadge, { VerifiedBadgePremium } from '../../../components/ui/VerifiedBadge';
import { API_URL } from '../../../utils/api';

const AccountVerification = () => {
  const [verificationStep, setVerificationStep] = useState('requirements');
  const [isVerified, setIsVerified] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });

  useEffect(() => {
    fetchVerificationStatus();
  }, []);

  const fetchVerificationStatus = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      const token = userData.token;
      
      const response = await fetch(`${API_URL}/provider-payments/verification-status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setIsVerified(data.is_verified);
        setPaymentStatus(data.payment);
        
        if (data.payment && !data.is_verified) {
          setVerificationStep('review');
        } else if (data.is_verified) {
          setVerificationStep('verified');
        }
      }
    } catch (err) {
      console.error('Error fetching verification status:', err);
    } finally {
      setLoading(false);
    }
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

  const handlePayForVerification = async () => {
    if (!validateCard()) return;

    setProcessing(true);
    
    try {
      const userData = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      const token = userData.token;
      
      const cardBrand = getCardBrand(cardDetails.cardNumber);
      const cardLastFour = cardDetails.cardNumber.replace(/\s/g, '').slice(-4);
      
      const response = await fetch(`${API_URL}/provider-payments/pay-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          card_number: cardDetails.cardNumber.replace(/\s/g, ''),
          card_holder: cardDetails.cardHolder,
          card_expiry: `${cardDetails.expiryMonth}/${cardDetails.expiryYear}`,
          cvv: cardDetails.cvv
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ Payment Successful!\n\nAmount: ${data.payment.currency} ${parseFloat(data.payment.amount).toLocaleString()}\nCard: ${cardBrand.toUpperCase()} ****${cardLastFour}\nTransaction: ${data.payment.transaction_reference}\n\nYour verification request has been submitted and is pending admin approval.\n\nPayment received to:\n${data.admin_account.account_holder}\n${data.admin_account.account_type.replace('_', ' ').toUpperCase()}: ${data.admin_account.account_number}`);
        
        setShowPaymentModal(false);
        setCardDetails({ cardNumber: '', cardHolder: '', expiryMonth: '', expiryYear: '', cvv: '' });
        fetchVerificationStatus();
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

  const verificationBenefits = [
    {
      icon: 'Shield',
      title: 'Verified Badge',
      description: 'Display verified status to build trust'
    },
    {
      icon: 'TrendingUp',
      title: 'Priority Ranking',
      description: 'Higher placement in search results'
    },
    {
      icon: 'Star',
      title: 'Premium Features',
      description: 'Access to advanced promotion tools'
    },
    {
      icon: 'Users',
      title: 'Customer Trust',
      description: 'Increase booking conversion rates'
    },
    {
      icon: 'BarChart',
      title: 'Advanced Analytics',
      description: 'Detailed performance insights'
    },
    {
      icon: 'Headphones',
      title: 'Priority Support',
      description: '24/7 dedicated customer support'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon name="Loader2" size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  const renderRequirementsStep = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="Info" size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100">Get Verified Badge</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Pay verification fee to get your account verified. Once payment is confirmed, 
              admin will review and approve your verification request within 24-48 hours.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {verificationBenefits.map((benefit, index) => (
          <div key={index} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon name={benefit.icon} size={16} className="text-primary" />
              </div>
              <h5 className="font-medium text-foreground">{benefit.title}</h5>
            </div>
            <p className="text-sm text-muted-foreground">{benefit.description}</p>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6 border border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-foreground mb-1">Verification Fee</h4>
            <p className="text-sm text-muted-foreground">One-time payment for 1 year verification</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">TZS 50,000</div>
            <div className="text-xs text-muted-foreground">Valid for 365 days</div>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <Button
          variant="default"
          size="lg"
          onClick={() => setShowPaymentModal(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Icon name="CreditCard" size={18} />
          Pay Verification Fee
        </Button>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Clock" size={32} className="text-yellow-600 dark:text-yellow-400" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Payment Received - Under Review</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Your payment has been received successfully. Your verification request is currently under admin review. 
          You'll be notified once approved.
        </p>
        
        {paymentStatus && (
          <div className="bg-muted/50 rounded-lg p-4 mt-6 max-w-md mx-auto">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Amount Paid:</span>
                <span className="font-bold text-green-600 dark:text-green-400">
                  {paymentStatus.currency} {parseFloat(paymentStatus.amount).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Transaction Ref:</span>
                <span className="font-mono text-xs">{paymentStatus.transaction_reference}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Payment Date:</span>
                <span className="font-medium">{new Date(paymentStatus.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium text-yellow-600 dark:text-yellow-400">Pending Approval</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <h4 className="font-medium text-foreground mb-2">What happens next?</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start space-x-2">
              <Icon name="Check" size={14} className="text-green-500 mt-0.5" />
              <span>Payment verification (completed)</span>
            </li>
            <li className="flex items-start space-x-2">
              <Icon name="Clock" size={14} className="text-yellow-500 mt-0.5" />
              <span>Admin review (24-48 hours)</span>
            </li>
            <li className="flex items-start space-x-2">
              <Icon name="Clock" size={14} className="text-gray-400 mt-0.5" />
              <span>Verification badge activation</span>
            </li>
          </ul>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <h4 className="font-medium text-foreground mb-2">Need help?</h4>
          <p className="text-sm text-muted-foreground mb-3">
            Contact our support team if you have questions about your verification.
          </p>
          <Button variant="outline" size="sm">
            <Icon name="MessageCircle" size={14} />
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );

  const renderVerifiedStep = () => (
    <div className="space-y-6">
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Shield" size={32} className="text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Account Verified!</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Congratulations! Your account has been successfully verified. 
          You now have access to all premium features.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {verificationBenefits.map((benefit, index) => (
          <div key={index} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Icon name={benefit.icon} size={16} className="text-green-600 dark:text-green-400" />
              </div>
              <h5 className="font-medium text-foreground">{benefit.title}</h5>
            </div>
            <p className="text-sm text-muted-foreground">{benefit.description}</p>
            <div className="mt-2">
              <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded">Active</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-xl font-medium">Account Verification</h3>
          <p className="text-sm text-muted-foreground">
            Get verified to unlock premium features and build customer trust
          </p>
        </div>
        
        {isVerified && (
          <div className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-800">
            <VerifiedBadgePremium size="md" />
            <span className="font-medium">Verified Account</span>
          </div>
        )}
      </div>

      {/* Progress Steps */}
      <div className="flex items-center space-x-4 mb-8">
        <div className={`flex items-center space-x-2 ${
          verificationStep === 'requirements' ? 'text-primary' : 'text-muted-foreground'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            verificationStep === 'requirements' ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}>
            1
          </div>
          <span className="text-sm font-medium">Payment</span>
        </div>
        
        <div className="flex-1 h-px bg-border"></div>
        
        <div className={`flex items-center space-x-2 ${
          verificationStep === 'review' ? 'text-primary' : 'text-muted-foreground'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            verificationStep === 'review' ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}>
            2
          </div>
          <span className="text-sm font-medium">Review</span>
        </div>
        
        <div className="flex-1 h-px bg-border"></div>
        
        <div className={`flex items-center space-x-2 ${
          verificationStep === 'verified' ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            verificationStep === 'verified' ? 'bg-green-600 text-white' : 'bg-muted'
          }`}>
            <Icon name="Check" size={16} />
          </div>
          <span className="text-sm font-medium">Verified</span>
        </div>
      </div>

      {/* Step Content */}
      {verificationStep === 'requirements' && renderRequirementsStep()}
      {verificationStep === 'review' && renderReviewStep()}
      {verificationStep === 'verified' && renderVerifiedStep()}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border border-border rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-foreground">Pay Verification Fee</h3>
              <button onClick={() => setShowPaymentModal(false)}>
                <Icon name="X" size={24} className="text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-3">Order Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service:</span>
                    <span className="font-medium">Account Verification</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">365 days (1 year)</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border">
                    <span className="font-medium">Total Amount:</span>
                    <span className="text-xl font-bold text-primary">TZS 50,000</span>
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
                  <input 
                    type="text" 
                    name="cardNumber" 
                    value={cardDetails.cardNumber} 
                    onChange={handleCardInputChange} 
                    placeholder="1234 5678 9012 3456" 
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" 
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Cardholder Name</label>
                  <input 
                    type="text" 
                    name="cardHolder" 
                    value={cardDetails.cardHolder} 
                    onChange={handleCardInputChange} 
                    placeholder="JOHN DOE" 
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary uppercase" 
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">Month</label>
                    <input 
                      type="text" 
                      name="expiryMonth" 
                      value={cardDetails.expiryMonth} 
                      onChange={handleCardInputChange} 
                      placeholder="MM" 
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-center" 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">Year</label>
                    <input 
                      type="text" 
                      name="expiryYear" 
                      value={cardDetails.expiryYear} 
                      onChange={handleCardInputChange} 
                      placeholder="YY" 
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-center" 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">CVV</label>
                    <input 
                      type="password" 
                      name="cvv" 
                      value={cardDetails.cvv} 
                      onChange={handleCardInputChange} 
                      placeholder="***" 
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-center" 
                    />
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Icon name="Shield" size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Your payment is secure. Card details are encrypted and processed securely. 
                      Payment will be received by admin account.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => setShowPaymentModal(false)} 
                  disabled={processing}
                >
                  Cancel
                </Button>
                <Button 
                  variant="default" 
                  className="flex-1 bg-green-600 hover:bg-green-700" 
                  disabled={processing} 
                  onClick={handlePayForVerification}
                >
                  {processing ? (
                    <>
                      <Icon name="Loader2" size={16} className="animate-spin" /> 
                      Processing...
                    </>
                  ) : (
                    <>
                      <Icon name="Lock" size={16} /> 
                      Pay TZS 50,000
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountVerification;

  const verificationRequirements = [
    {
      id: 'business_license',
      name: 'Business License',
      description: 'Valid business registration or license',
      required: true,
      uploaded: false,
      status: 'pending'
    },
    {
      id: 'tax_certificate',
      name: 'Tax Certificate',
      description: 'Tax registration certificate',
      required: true,
      uploaded: false,
      status: 'pending'
    },
    {
      id: 'insurance',
      name: 'Insurance Certificate',
      description: 'Public liability insurance',
      required: true,
      uploaded: false,
      status: 'pending'
    },
    {
      id: 'certifications',
      name: 'Professional Certifications',
      description: 'Tourism/guide certifications',
      required: false,
      uploaded: false,
      status: 'pending'
    },
    {
      id: 'bank_statement',
      name: 'Bank Statement',
      description: 'Recent bank statement (last 3 months)',
      required: true,
      uploaded: false,
      status: 'pending'
    }
  ];

  const verificationBenefits = [
    {
      icon: 'Shield',
      title: 'Verified Badge',
      description: 'Display verified status to build trust'
    },
    {
      icon: 'TrendingUp',
      title: 'Priority Ranking',
      description: 'Higher placement in search results'
    },
    {
      icon: 'Star',
      title: 'Premium Features',
      description: 'Access to advanced promotion tools'
    },
    {
      icon: 'Users',
      title: 'Customer Trust',
      description: 'Increase booking conversion rates'
    },
    {
      icon: 'BarChart',
      title: 'Advanced Analytics',
      description: 'Detailed performance insights'
    },
    {
      icon: 'Headphones',
      title: 'Priority Support',
      description: '24/7 dedicated customer support'
    }
  ];

  const handleFileUpload = (docId, file) => {
    // Simulate file upload
    setUploadedDocs(prev => ({
      ...prev,
      [docId]: file
    }));
    
    // Update requirement status
    const updatedReqs = verificationRequirements.map(req => 
      req.id === docId ? { ...req, uploaded: true, status: 'uploaded' } : req
    );
    
    alert(`${file.name} uploaded successfully for ${docId}`);
  };

  const submitVerification = () => {
    const requiredDocs = verificationRequirements.filter(req => req.required);
    const uploadedRequired = requiredDocs.filter(req => uploadedDocs[req.id]);
    
    if (uploadedRequired.length === requiredDocs.length) {
      setVerificationStep('review');
      alert('Verification documents submitted! Review typically takes 2-3 business days.');
    } else {
      alert('Please upload all required documents before submitting.');
    }
  };

  const renderRequirementsStep = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="Info" size={20} className="text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Verification Process</h4>
            <p className="text-sm text-blue-700 mt-1">
              Complete account verification to unlock premium features and build customer trust. 
              The process typically takes 2-3 business days after document submission.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {verificationBenefits.map((benefit, index) => (
          <div key={index} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon name={benefit.icon} size={16} className="text-primary" />
              </div>
              <h5 className="font-medium text-foreground">{benefit.title}</h5>
            </div>
            <p className="text-sm text-muted-foreground">{benefit.description}</p>
          </div>
        ))}
      </div>

      <div>
        <h4 className="font-medium text-foreground mb-4">Required Documents</h4>
        <div className="space-y-4">
          {verificationRequirements.map((req) => (
            <div key={req.id} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    uploadedDocs[req.id] 
                      ? 'bg-green-100 text-green-600' 
                      : req.required 
                        ? 'bg-red-100 text-red-600'
                        : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Icon 
                      name={uploadedDocs[req.id] ? 'Check' : 'FileText'} 
                      size={16} 
                    />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h5 className="font-medium text-foreground">{req.name}</h5>
                      {req.required && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
                          Required
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{req.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {uploadedDocs[req.id] ? (
                    <div className="flex items-center space-x-2 text-green-600">
                      <Icon name="Check" size={16} />
                      <span className="text-sm font-medium">Uploaded</span>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.pdf,.jpg,.jpeg,.png';
                        input.onchange = (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            handleFileUpload(req.id, file);
                          }
                        };
                        input.click();
                      }}
                    >
                      <Icon name="Upload" size={14} />
                      Upload
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-border">
        <div className="text-sm text-muted-foreground">
          {Object.keys(uploadedDocs).length} of {verificationRequirements.filter(r => r.required).length} required documents uploaded
        </div>
        <Button
          variant="default"
          onClick={submitVerification}
          disabled={Object.keys(uploadedDocs).length < verificationRequirements.filter(r => r.required).length}
        >
          <Icon name="Send" size={16} />
          Submit for Review
        </Button>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Clock" size={32} className="text-yellow-600" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Under Review</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Your verification documents have been submitted and are currently under review. 
          We'll notify you via email once the review is complete.
        </p>
        
        <div className="bg-muted/50 rounded-lg p-4 mt-6 max-w-md mx-auto">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Estimated review time:</span>
            <span className="font-medium">2-3 business days</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <h4 className="font-medium text-foreground mb-2">What happens next?</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start space-x-2">
              <Icon name="Check" size={14} className="text-green-500 mt-0.5" />
              <span>Document verification (1-2 days)</span>
            </li>
            <li className="flex items-start space-x-2">
              <Icon name="Check" size={14} className="text-green-500 mt-0.5" />
              <span>Background check (1 day)</span>
            </li>
            <li className="flex items-start space-x-2">
              <Icon name="Clock" size={14} className="text-yellow-500 mt-0.5" />
              <span>Final approval & badge activation</span>
            </li>
          </ul>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <h4 className="font-medium text-foreground mb-2">Need help?</h4>
          <p className="text-sm text-muted-foreground mb-3">
            Contact our verification team if you have questions.
          </p>
          <Button variant="outline" size="sm">
            <Icon name="MessageCircle" size={14} />
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );

  const renderVerifiedStep = () => (
    <div className="space-y-6">
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Shield" size={32} className="text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Account Verified!</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Congratulations! Your account has been successfully verified. 
          You now have access to all premium features.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {verificationBenefits.map((benefit, index) => (
          <div key={index} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Icon name={benefit.icon} size={16} className="text-green-600" />
              </div>
              <h5 className="font-medium text-foreground">{benefit.title}</h5>
            </div>
            <p className="text-sm text-muted-foreground">{benefit.description}</p>
            <div className="mt-2">
              <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">Active</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-xl font-medium">Account Verification</h3>
          <p className="text-sm text-muted-foreground">
            Get verified to unlock premium features and build customer trust
          </p>
        </div>
        
        {isVerified && (
          <div className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-200">
            <VerifiedBadgePremium size="md" />
            <span className="font-medium">Verified Account</span>
          </div>
        )}
      </div>

      {/* Progress Steps */}
      <div className="flex items-center space-x-4 mb-8">
        <div className={`flex items-center space-x-2 ${
          verificationStep === 'requirements' ? 'text-primary' : 'text-muted-foreground'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            verificationStep === 'requirements' ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}>
            1
          </div>
          <span className="text-sm font-medium">Requirements</span>
        </div>
        
        <div className="flex-1 h-px bg-border"></div>
        
        <div className={`flex items-center space-x-2 ${
          verificationStep === 'review' ? 'text-primary' : 'text-muted-foreground'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            verificationStep === 'review' ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}>
            2
          </div>
          <span className="text-sm font-medium">Review</span>
        </div>
        
        <div className="flex-1 h-px bg-border"></div>
        
        <div className={`flex items-center space-x-2 ${
          isVerified ? 'text-green-600' : 'text-muted-foreground'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isVerified ? 'bg-green-600 text-white' : 'bg-muted'
          }`}>
            <Icon name="Check" size={16} />
          </div>
          <span className="text-sm font-medium">Verified</span>
        </div>
      </div>

      {/* Step Content */}
      {verificationStep === 'requirements' && renderRequirementsStep()}
      {verificationStep === 'review' && renderReviewStep()}
      {isVerified && renderVerifiedStep()}

      {/* Demo buttons for testing */}
      <div className="flex space-x-2 pt-4 border-t border-border">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setVerificationStep('requirements')}
        >
          Demo: Requirements
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setVerificationStep('review')}
        >
          Demo: Review
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setIsVerified(true)}
        >
          Demo: Verified
        </Button>
      </div>
    </div>
  );
};

export default AccountVerification;
