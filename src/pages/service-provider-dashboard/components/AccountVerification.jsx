import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import VerifiedBadge, { VerifiedBadgePremium } from '../../../components/ui/VerifiedBadge';

const AccountVerification = () => {
  const [verificationStep, setVerificationStep] = useState('requirements');
  const [uploadedDocs, setUploadedDocs] = useState({});
  const [isVerified, setIsVerified] = useState(false);

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
