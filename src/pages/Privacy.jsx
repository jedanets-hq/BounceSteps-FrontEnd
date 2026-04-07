import { useNavigate } from "react-router-dom";

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-8 md:py-12">
        <div className="max-w-5xl mx-auto px-4">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3 mb-6">
            <img
              src="/LOGO.png"
              alt="BounceSteps"
              className="h-10 w-auto"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <span className="font-bold text-xl md:text-2xl text-primary-foreground">BounceSteps</span>
          </div>
          
          <button
            onClick={() => navigate(-1)}
            className="mb-3 text-sm md:text-base text-primary-foreground/80 hover:text-primary-foreground transition-colors flex items-center gap-1"
          >
            ← Back
          </button>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-sm md:text-base text-primary-foreground/90">
            Last updated: April 5, 2026
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <div className="prose prose-sm md:prose-base max-w-none break-words overflow-wrap-anywhere">
          <style>{`
            .prose p, .prose li, .prose h1, .prose h2, .prose h3 {
              word-wrap: break-word;
              overflow-wrap: break-word;
              hyphens: auto;
            }
            .prose ul, .prose ol {
              padding-left: 1.5rem;
            }
          `}</style>
          <section className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">17. PRIVACY POLICY</h2>
            
            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">17.1 Data Controller</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                BounceSteps is the data controller for Personal Data collected through the Platform. We are committed to protecting your privacy in accordance with the Personal Data Protection Act of Tanzania and applicable international standards including GDPR principles.
              </p>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">17.2 Data We Collect</h3>
              <ul className="list-disc list-inside text-sm md:text-base text-muted-foreground space-y-1.5 md:space-y-2">
                <li><strong>Registration Data:</strong> Name, email, phone number, date of birth, national ID or passport</li>
                <li><strong>Profile Data:</strong> Profile photos, travel preferences, saved listings</li>
                <li><strong>Verification Data:</strong> Legal documents submitted by Service Providers for verification</li>
                <li><strong>Transaction Data:</strong> Booking history, payment information, receipts</li>
                <li><strong>Location Data:</strong> Geographic location, region/district/ward/village selections</li>
                <li><strong>Device & Usage Data:</strong> IP address, browser type, device identifiers, usage patterns</li>
                <li><strong>Communications Data:</strong> In-Platform messages, support correspondence</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-3">17.3 How We Use Your Data</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>To create and manage your account</li>
                <li>To verify Service Provider identity and legal documents</li>
                <li>To facilitate Bookings and process payments</li>
                <li>To administer the Verification and Premium Package systems</li>
                <li>To detect and prevent fraud</li>
                <li>To provide customer support and resolve disputes</li>
                <li>To send service notifications and (with consent) marketing communications</li>
                <li>To comply with legal obligations under Tanzanian law</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-3">17.4 Legal Bases for Processing</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                We process data on the bases of: (a) performance of a contract; (b) compliance with a legal obligation; (c) legitimate interests (fraud prevention, platform security); and (d) your explicit consent where required.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-3">17.5 Data Sharing</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong>Service Providers:</strong> Limited booking information to facilitate services</li>
                <li><strong>Payment Processors:</strong> For secure transaction processing</li>
                <li><strong>Government Authorities:</strong> Where required by Tanzanian law or court order</li>
                <li><strong>Technology Partners:</strong> Cloud hosting, analytics providers bound by data processing agreements</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                We do not sell your Personal Data to third parties.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-3">17.6 Your Rights</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                You have rights to: access your data; correct inaccurate data; request erasure; restrict processing; data portability; object to processing; and withdraw consent. Submit requests to privacy@bouncesteps.com. We will respond within 30 days.
              </p>
            </div>
          </section>

          <section className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">18. COOKIE POLICY</h2>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-3">18.1 What Are Cookies</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                Cookies are small text files stored on your device when you visit the Platform. We use cookies to enhance your experience, analyse usage, and deliver relevant content.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-3">18.2 Types of Cookies</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong>Essential Cookies:</strong> Required for Platform functionality. Cannot be disabled.</li>
                <li><strong>Analytics Cookies:</strong> Help us understand Platform usage (e.g., Google Analytics).</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences.</li>
                <li><strong>Marketing Cookies:</strong> Deliver personalised promotional content with your consent.</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-3">18.3 Cookie Control</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                A cookie consent banner will appear on your first visit. You may accept all, select specific categories, or reject non-essential cookies. Preferences may be updated at any time through account settings or your browser controls.
              </p>
            </div>
          </section>

          <section className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">19. DATA RETENTION & SECURITY</h2>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-3">19.1 Retention Periods</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                Active account data is retained for the duration of your account. Transaction and financial records are retained for at least 7 years for tax and accounting compliance. Verification documents are retained for the duration of the Service Provider relationship plus applicable legal holding periods. Dispute-related data is retained until resolution.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-3">19.2 Security Measures</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                BounceSteps implements SSL/TLS encryption, secure data storage, role-based access controls, regular security audits, and staff training on data protection. While all reasonable precautions are taken, no internet system is completely secure.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-3">19.3 Data Breach Notification</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                In the event of a data breach posing risk to your rights and freedoms, we will notify affected Users and relevant regulatory authorities within 72 hours of awareness, as required by applicable law.
              </p>
            </div>
          </section>

          <section className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">Contact Information</h2>
            <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
              For privacy enquiries, data requests, or concerns:
            </p>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-foreground font-medium">BounceSteps Privacy & Data Team</p>
              <p className="text-muted-foreground">Email: privacy@bouncesteps.com</p>
              <p className="text-muted-foreground">Website: www.bouncesteps.com</p>
              <p className="text-muted-foreground">Registered in: United Republic of Tanzania</p>
            </div>
          </section>

          <section className="mb-6 md:mb-8">
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm text-muted-foreground">
                © 2026 BounceSteps. All rights reserved. | Effective: April 5, 2026 | Version: v1.0
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;