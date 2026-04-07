import { useNavigate } from "react-router-dom";

const Terms = () => {
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
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Terms of Service</h1>
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
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">1. TERMS OF SERVICE — AGREEMENT & SCOPE</h2>
            
            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">1.1 Agreement to Terms</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                By accessing or using the BounceSteps website, mobile application, or any related services (collectively, the "Platform"), you agree to be bound by these Terms of Service ("Terms"), our Privacy Policy, Cookie Policy, and all other applicable policies incorporated herein by reference. These Terms constitute a legally binding agreement between you and BounceSteps ("Company", "we", "us", or "our").
              </p>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                If you do not agree to these Terms, you must immediately cease use of the Platform. Your continued use following any updates constitutes your acceptance of those changes.
              </p>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">1.2 Nature of the Platform</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                BounceSteps is an online marketplace and travel facilitation platform connecting Travellers with Service Providers across the United Republic of Tanzania. The Platform provides geographic coverage at the national, regional (mkoa), district (wilaya), ward (kata), and village (kijiji) levels, enabling access to travel and tourism-related services for users anywhere in Tanzania.
              </p>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                BounceSteps acts solely as an intermediary and marketplace operator. We do not directly provide transportation, accommodation, guiding, or other travel services unless explicitly stated. The contract for services is formed directly between the Traveller and the Service Provider.
              </p>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">1.3 Platform Default Design & Brand</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                The BounceSteps Platform uses green and white as its default colour scheme across all interfaces, products, and official communications. These are the official brand colours of BounceSteps and are protected intellectual property of the Company.
              </p>
            </div>
          </section>

          <section className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">2. DEFINITIONS & INTERPRETATION</h2>
            <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
              For the purposes of these Terms, the following definitions apply:
            </p>
            <ul className="list-disc list-inside text-sm md:text-base text-muted-foreground space-y-1.5 md:space-y-2">
              <li><strong>"Platform"</strong> — the BounceSteps website (bouncesteps.com), mobile applications, and all related digital services.</li>
              <li><strong>"User"</strong> — any individual or entity that accesses or registers on the Platform.</li>
              <li><strong>"Traveller"</strong> — a User seeking to discover, plan, or book travel and tourism services in Tanzania.</li>
              <li><strong>"Service Provider"</strong> — any individual, business, or organisation registered on the Platform to list and offer travel-related services.</li>
              <li><strong>"Unverified Service Provider"</strong> — a Service Provider who has registered on the Platform but has not yet completed the verification process.</li>
              <li><strong>"Verified Service Provider"</strong> — a Service Provider who has successfully submitted and received approval of required legal documents, and whose account bears the official BounceSteps Verified badge.</li>
              <li><strong>"Verification Badge"</strong> — the official digital mark displayed on a Service Provider's profile confirming government-recognised legal documentation has been reviewed and approved by BounceSteps.</li>
              <li><strong>"Premium Package"</strong> — paid promotional or visibility products available exclusively to Verified Service Providers, including but not limited to the Verified Badge, Trending placement, and other platform promotions.</li>
              <li><strong>"Booking"</strong> — a confirmed reservation for services facilitated through the Platform.</li>
              <li><strong>"Listing"</strong> — a Service Provider's published offering of services on the Platform.</li>
              <li><strong>"Content"</strong> — all text, images, videos, reviews, ratings, and other materials posted on the Platform.</li>
              <li><strong>"Fees"</strong> — any commissions, platform service charges, package costs, or transaction fees applied by BounceSteps.</li>
              <li><strong>"Force Majeure"</strong> — events beyond reasonable control including natural disasters, pandemics, government actions, or civil unrest.</li>
              <li><strong>"Personal Data"</strong> — information identifying or capable of identifying a natural person, as defined under applicable Tanzanian and international data protection law.</li>
              <li><strong>"Minor"</strong> — any individual under the age of 18 years.</li>
              <li><strong>"Legal Documents"</strong> — government-recognised business registration certificates, licences, permits, and other official authorisations required to lawfully operate a service in Tanzania.</li>
            </ul>
          </section>

          <section className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">3. ELIGIBILITY & ACCOUNT REGISTRATION</h2>
            
            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">3.1 Age Requirement</h3>
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                <p className="text-red-800 font-semibold">
                  MANDATORY AGE RESTRICTION: BounceSteps strictly prohibits use of the Platform by any person under the age of 18 years. By creating an account or using the Platform, you represent and warrant that you are at least 18 years of age. Accounts belonging to Minors will be immediately terminated.
                </p>
              </div>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                BounceSteps reserves the right to request government-issued identification or other proof of age at any time. If you are a parent or guardian and believe a Minor has registered without authorisation, contact us immediately at legal@bouncesteps.com.
              </p>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">3.2 Account Registration</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                To access the Platform's features, you must create an account. You agree to:
              </p>
              <ul className="list-disc list-inside text-sm md:text-base text-muted-foreground space-y-1.5 md:space-y-2">
                <li>Provide accurate, current, and complete registration information</li>
                <li>Maintain and promptly update your account details</li>
                <li>Keep your login credentials confidential and not share them with third parties</li>
                <li>Accept full responsibility for all activities conducted under your account</li>
                <li>Notify BounceSteps immediately of any unauthorised use of your account</li>
              </ul>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">3.3 Account Types</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                The Platform offers two primary account types: (a) Traveller Account — for individuals seeking to discover and book travel services; and (b) Service Provider Account — for individuals and businesses offering travel-related services. Service Provider accounts are subject to additional terms as set out in Sections 5, 6, and 7.
              </p>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">3.4 Legal Capacity</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                By registering, you confirm that you have full legal capacity to enter into a binding agreement. If registering on behalf of a company or organisation, you confirm that you have authority to bind that entity to these Terms.
              </p>
            </div>
          </section>


          <section className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">4. PLATFORM SERVICES & GEOGRAPHIC COVERAGE</h2>
            
            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">4.1 Scope of Services</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                BounceSteps facilitates the discovery, planning, and booking of travel and tourism services across Tanzania, including but not limited to:
              </p>
              <ul className="list-disc list-inside text-sm md:text-base text-muted-foreground space-y-1.5 md:space-y-2">
                <li>Safari packages and wildlife experiences</li>
                <li>Accommodation (hotels, lodges, campsites, homestays, guesthouses)</li>
                <li>Ground transportation and airport transfers</li>
                <li>Cultural, heritage, and community tours</li>
                <li>Adventure and outdoor activities</li>
                <li>Local guide and interpreter services</li>
                <li>Food, dining, and culinary experiences</li>
                <li>Event and conference venue bookings</li>
                <li>Village and community tourism programmes</li>
              </ul>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">4.2 Geographic Coverage</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                The Platform provides multi-level geographic service coverage across the United Republic of Tanzania:
              </p>
              <ul className="list-disc list-inside text-sm md:text-base text-muted-foreground space-y-1.5 md:space-y-2">
                <li>Regional (Mkoa) Level — covering all administrative regions</li>
                <li>District (Wilaya) Level — covering all districts within each region</li>
                <li>Ward (Kata) Level — covering wards within each district</li>
                <li>Village (Kijiji) Level — covering villages and sub-village communities</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                This four-tier geographic structure ensures that both Travellers and Service Providers in any part of Tanzania, including remote and rural areas, can fully participate in the Platform ecosystem.
              </p>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">4.3 Platform Role & Limitations</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                BounceSteps is a facilitator and marketplace operator. We do not guarantee the quality, safety, legality, or suitability of any service listed on the Platform. Users engage with each other at their own risk, subject to the protections outlined in these Terms.
              </p>
            </div>
          </section>

          <section className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">5. SERVICE PROVIDER REGISTRATION & OPEN ACCESS POLICY</h2>
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg mb-4">
              <p className="text-foreground font-semibold">
                BounceSteps operates an open registration policy: ANY individual or business may register as a Service Provider on the Platform, free of charge, regardless of their formal business status. However, registration alone does not confer Verified status or access to premium promotional features.
              </p>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">5.1 Open Registration</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                BounceSteps welcomes Service Providers from all regions of Tanzania, at all levels of business formalisation. Whether you are an individual local guide, a small community enterprise, or a large registered tourism company, you may create a Service Provider account and publish Listings on the Platform.
              </p>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                Open registration means:
              </p>
              <ul className="list-disc list-inside text-sm md:text-base text-muted-foreground space-y-1.5 md:space-y-2">
                <li>No upfront registration fees are charged to create a Service Provider account</li>
                <li>No formal business registration is required merely to sign up and list services</li>
                <li>Service Providers from all 26 regions of Tanzania may register and list</li>
                <li>Individual freelancers, sole traders, partnerships, and corporations are all eligible to register</li>
              </ul>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">5.2 Status of Unverified Service Providers</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                An Unverified Service Provider may:
              </p>
              <ul className="list-disc list-inside text-sm md:text-base text-muted-foreground space-y-1.5 md:space-y-2">
                <li>Create and maintain a Service Provider profile on the Platform</li>
                <li>Publish service Listings visible to Travellers</li>
                <li>Receive and respond to Booking enquiries</li>
                <li>Communicate with Travellers through the Platform messaging system</li>
                <li>Receive payments for services through the Platform's payment gateway (subject to applicable fees)</li>
              </ul>
              <p className="text-muted-foreground mt-4 mb-4">
                An Unverified Service Provider may NOT:
              </p>
              <ul className="list-disc list-inside text-sm md:text-base text-muted-foreground space-y-1.5 md:space-y-2">
                <li>Display the BounceSteps Verification Badge on their profile</li>
                <li>Purchase or access any Premium Package, including Trending placements, Badge promotions, or any other paid visibility features</li>
                <li>Use the "Verified by BounceSteps" designation in any listing, profile, or marketing material</li>
              </ul>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">5.3 Transition to Verified Status</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                Any Unverified Service Provider may apply for Verification at any time by submitting the required legal documentation as described in Section 6. Upon successful verification, the Service Provider will gain full access to premium features and the Verification Badge.
              </p>
            </div>
          </section>

          <section className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">6. SERVICE PROVIDER VERIFICATION SYSTEM</h2>
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg mb-4">
              <p className="text-foreground font-semibold">
                The BounceSteps Verification Badge is the gold standard of trust on our Platform. It means BounceSteps has reviewed and confirmed that the Service Provider holds valid, government-recognised legal documentation to operate in Tanzania.
              </p>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">6.1 Purpose of Verification</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                The BounceSteps Verification System exists to protect Travellers, build market trust, and ensure that Service Providers operating at a professional level are identifiable and accountable. Verification is not a guarantee of service quality, but it confirms that the Service Provider is a legally recognised and documented entity under Tanzanian law.
              </p>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">6.2 Documents Required for Verification</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                To apply for Verified status, a Service Provider must submit valid, current, and legible copies of government-recognised documents (as applicable to their business type). BounceSteps may request additional documents relevant to the specific service category. All documents must be current (not expired) and must be submitted in Swahili or English.
              </p>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">6.3 Verification Process</h3>
              <ul className="list-disc list-inside text-sm md:text-base text-muted-foreground space-y-1.5 md:space-y-2">
                <li><strong>Step 1 — Application:</strong> Service Provider submits documents via the BounceSteps Verification Portal in the Service Provider dashboard</li>
                <li><strong>Step 2 — Review:</strong> BounceSteps compliance team reviews submitted documents within 5–10 business days</li>
                <li><strong>Step 3 — Decision:</strong> Service Provider is notified of approval, rejection (with reasons), or request for additional information</li>
                <li><strong>Step 4 — Badge Award:</strong> Upon approval, the Verification Badge is activated on the Service Provider's profile</li>
                <li><strong>Step 5 — Annual Renewal:</strong> Verification must be renewed annually or whenever documents expire or are updated</li>
              </ul>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">6.4 Verification Does Not Guarantee Service Quality</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                The BounceSteps Verification Badge confirms legal documentation only. It is not an endorsement, guarantee, or warranty of the quality, safety, or suitability of the Service Provider's services. BounceSteps encourages Travellers to read reviews, communicate directly with providers, and exercise their own judgement.
              </p>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">6.5 Suspension of Verification</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                BounceSteps reserves the right to suspend or revoke a Service Provider's Verified status at any time if: (a) documents are found to be fraudulent or expired; (b) the Service Provider's operating licence is revoked by a government authority; (c) the Service Provider is found to be in serious breach of these Terms; or (d) complaints from Travellers indicate conduct inconsistent with the standards expected of a Verified provider.
              </p>
            </div>
          </section>

          <section className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">7. PREMIUM PACKAGES — BADGE, TRENDING & PLATFORM PROMOTIONS</h2>
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg mb-4">
              <p className="text-foreground font-semibold">
                Premium Packages are paid promotional features available EXCLUSIVELY to Verified Service Providers. Verification must be active and in good standing before any Premium Package may be purchased or activated.
              </p>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">7.1 Eligibility for Premium Packages</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                Only Service Providers who hold current, active Verified status on the Platform are eligible to purchase Premium Packages. BounceSteps will reject or cancel any Premium Package purchase made by an Unverified Service Provider, and any fees paid will be refunded less any applicable processing charges.
              </p>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">7.2 Available Premium Packages</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                BounceSteps currently offers Premium Package categories including Verified Badge (Premium Display), Trending Placement, Featured Listing, Sponsored Search Results, Regional Spotlight, and Analytics Pro. Specific pricing and features are detailed in the Platform's Premium Packages page and may be updated periodically.
              </p>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">7.3 Payment & Activation</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                Premium Packages are offered on subscription (monthly/quarterly/annual) or one-time purchase basis, as specified in the Platform's Packages section. Payment must be made in full prior to activation. BounceSteps accepts M-Pesa, Tigo Pesa, Airtel Money, bank transfer, debit and credit cards through our secure payment gateway.
              </p>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">7.4 Non-Refundable Packages</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                Premium Package fees are generally non-refundable once activated, except in cases where: (a) BounceSteps fails to deliver the purchased promotional placement; (b) technical errors on the Platform's side prevent delivery; or (c) BounceSteps terminates the Service Provider's account without cause. Refund requests must be submitted within 7 days of purchase.
              </p>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">7.5 BounceSteps' Right to Modify Packages</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                BounceSteps reserves the right to modify, discontinue, or update Premium Package offerings with reasonable notice. Existing active subscriptions will be honoured until their expiry date.
              </p>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">7.6 Prohibition on Misrepresentation</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                Service Providers may not misrepresent their package status. Using the Trending, Featured, or Verified designations without an active Premium Package or Verified status constitutes a violation of these Terms and may result in immediate account termination.
              </p>
            </div>
          </section>

          <section className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">8. TRAVELLER SAFETY RECOMMENDATION & VERIFIED PROVIDER ADVISORY</h2>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
              <p className="text-yellow-800 font-semibold">
                OFFICIAL BOUNCESTEPS RECOMMENDATION: For your safety, security, and peace of mind, BounceSteps strongly advises all Travellers to book services exclusively with Verified Service Providers wherever possible.
              </p>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">8.1 Why We Recommend Verified Providers</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                Verified Service Providers have demonstrated legal compliance by submitting and receiving approval of government-recognised business documentation. While BounceSteps does not guarantee the performance of any Service Provider, choosing a Verified provider offers additional assurances including valid government-issued licences, legal identifiability, voluntary compliance review, annual re-verification, and accountability to both government authorities and BounceSteps' platform standards.
              </p>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">8.2 Traveller Advisory on Unverified Providers</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                BounceSteps does not prohibit Travellers from booking with Unverified Service Providers. However, Travellers who choose to engage with Unverified providers do so with the understanding that the provider's legal operating status has not been confirmed by BounceSteps, BounceSteps' ability to assist in dispute resolution may be more limited, and the Traveller assumes greater personal responsibility for assessing the provider's credentials.
              </p>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">8.3 How to Identify a Verified Provider</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                Verified Service Providers on BounceSteps are identified by the official green-and-gold BounceSteps Verification Badge displayed on their profile, the "Verified Provider" label in search results and listing pages, and the ability to access Trending and Featured placement packages. Travellers should always look for the Verification Badge before making a Booking.
              </p>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">8.4 No Liability for Unverified Provider Interactions</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                BounceSteps expressly disclaims liability for any loss, injury, financial harm, or dissatisfaction arising from transactions with Unverified Service Providers. This disclaimer does not affect Travellers' rights under our Booking and Dispute Resolution policies, but Travellers are advised that recourse options may be more limited when engaging with Unverified providers.
              </p>
            </div>
          </section>


          <section className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">9. BOOKING, PAYMENTS & FEES</h2>
            
            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">9.1 Booking Process</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                When a Traveller initiates a Booking through the Platform, this constitutes an offer to purchase the listed service from the Service Provider. A Booking is confirmed only upon written confirmation from the Service Provider and receipt of payment confirmation from the Platform's payment system. BounceSteps recommends Travellers request confirmation in writing within the Platform.
              </p>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">9.2 Payment Processing</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                BounceSteps facilitates payment collection on behalf of Service Providers through integrated payment gateways. Accepted methods include: mobile money (M-Pesa, Tigo Pesa, Airtel Money), bank transfers, debit/credit cards, and other methods as updated on the Platform. All transactions are subject to the payment processor's terms and applicable Tanzanian financial regulations.
              </p>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">9.3 Platform Service Fees</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                BounceSteps charges service fees to Travellers and/or commission fees to Service Providers as disclosed at the time of booking. Platform service fees are non-refundable unless otherwise stated. Specific fee structures are detailed on the Platform's Pricing page and may be updated with reasonable notice.
              </p>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">9.4 Currency & Taxes</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                Prices on the Platform are in Tanzanian Shillings (TZS) unless otherwise specified. Service Providers and Travellers are responsible for any applicable taxes including VAT and tourism levies required under Tanzanian law.
              </p>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">9.5 Off-Platform Transactions</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                BounceSteps is not responsible for any disputes, losses, or harm arising from payment transactions conducted outside the Platform. All financial transactions between Travellers and Service Providers should be conducted exclusively through BounceSteps' official payment channels to ensure full protection and access to our dispute resolution mechanisms.
              </p>
            </div>
          </section>

          <section className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">10. CANCELLATION & REFUND POLICY</h2>
            
            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">10.1 Traveller Cancellations</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                Travellers may cancel a confirmed Booking subject to the cancellation policy of the applicable Listing. Refund eligibility is as follows:
              </p>
              <ul className="list-disc list-inside text-sm md:text-base text-muted-foreground space-y-1.5 md:space-y-2">
                <li>72 hours or more before service: Full refund of service cost less non-refundable platform fees</li>
                <li>24–72 hours before service: 50% refund of service cost, at the Service Provider's discretion</li>
                <li>Less than 24 hours before service: No refund unless the Service Provider agrees otherwise</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Individual Service Providers may operate stricter or more flexible cancellation policies, which will be stated in their Listings.
              </p>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">10.2 Service Provider Cancellations</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                If a Service Provider cancels a confirmed Booking, the Traveller is entitled to a full refund of all amounts paid through the Platform. Service Providers who habitually cancel bookings may face penalties including suspension or removal from the Platform and loss of Verified status.
              </p>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">10.3 Force Majeure</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                In cases of Force Majeure, BounceSteps will use commercially reasonable efforts to facilitate fair resolutions, which may include rescheduling, platform credits, or partial refunds at our discretion and subject to applicable law.
              </p>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">10.4 Refund Processing</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                Approved refunds will be processed to the original payment method within 7–14 business days, subject to processing times of third-party payment providers.
              </p>
            </div>
          </section>

          <section className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">11. SERVICE PROVIDER OBLIGATIONS & STANDARDS</h2>
            
            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">11.1 Listing Standards</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                All Service Providers (Verified and Unverified) must maintain Listings that are:
              </p>
              <ul className="list-disc list-inside text-sm md:text-base text-muted-foreground space-y-1.5 md:space-y-2">
                <li>Accurate and complete in describing the services offered</li>
                <li>Free from false, misleading, or deceptive representations</li>
                <li>Accompanied by genuine photographs and honest descriptions</li>
                <li>Fairly and competitively priced with no hidden charges</li>
              </ul>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">11.2 Service Delivery</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                Upon confirmation of a Booking, Service Providers commit to:
              </p>
              <ul className="list-disc list-inside text-sm md:text-base text-muted-foreground space-y-1.5 md:space-y-2">
                <li>Provide services as described in the Listing at the agreed time and location</li>
                <li>Comply with all applicable safety and regulatory requirements</li>
                <li>Respond promptly to Traveller communications through the Platform</li>
                <li>Treat all Travellers with dignity, respect, and fairness, without discrimination</li>
              </ul>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">11.3 Review & Rating System</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                Service Providers acknowledge that Travellers may post reviews and ratings. Providers agree not to manipulate, fabricate, or coerce reviews. Fraudulent review activity will result in account suspension and removal of the Verification Badge where applicable.
              </p>
            </div>
          </section>

          <section className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">12. TRAVELLER RIGHTS & RESPONSIBILITIES</h2>
            
            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">12.1 Rights of Travellers</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                As a Traveller, you are entitled to:
              </p>
              <ul className="list-disc list-inside text-sm md:text-base text-muted-foreground space-y-1.5 md:space-y-2">
                <li>Clear, accurate, and complete information about listed services</li>
                <li>Services as described at the time of Booking</li>
                <li>File complaints and seek resolution through the Platform's dispute mechanisms</li>
                <li>Post honest reviews based on actual experiences</li>
                <li>Data privacy protections as set out in our Privacy Policy</li>
                <li>Access to BounceSteps' Verified Provider recommendation to support informed booking decisions</li>
              </ul>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">12.2 Responsibilities of Travellers</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                Travellers agree to:
              </p>
              <ul className="list-disc list-inside text-sm md:text-base text-muted-foreground space-y-1.5 md:space-y-2">
                <li>Provide accurate personal and payment information</li>
                <li>Treat Service Providers and their property with respect</li>
                <li>Arrive at agreed times or provide adequate notice of changes</li>
                <li>Comply with applicable Tanzanian laws and regulations</li>
                <li>Post only genuine, honest reviews based on actual experiences</li>
              </ul>
            </div>
          </section>

          <section className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">13. PROHIBITED ACTIVITIES</h2>
            <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
              All Users agree not to engage in the following prohibited activities:
            </p>
            <ul className="list-disc list-inside text-sm md:text-base text-muted-foreground space-y-1.5 md:space-y-2">
              <li>Registering or allowing access by any person under 18 years of age</li>
              <li>Providing false, misleading, or fraudulent information in any registration, Listing, or submission</li>
              <li>Submitting forged, altered, or invalid legal documents in the Verification process</li>
              <li>Claiming Verified status or using the Verification Badge without BounceSteps approval</li>
              <li>Purchasing or activating Premium Packages without active Verified status</li>
              <li>Conducting off-platform financial transactions to circumvent Platform fees</li>
              <li>Harassing, threatening, or discriminating against other Users or BounceSteps staff</li>
              <li>Posting defamatory, obscene, hateful, or unlawful content</li>
              <li>Uploading viruses, malware, or harmful code</li>
              <li>Using bots or automated tools to access or scrape the Platform without authorisation</li>
              <li>Infringing intellectual property rights of BounceSteps or third parties</li>
              <li>Manipulating or fabricating reviews, ratings, or user-generated content</li>
              <li>Listing or facilitating services that are illegal under Tanzanian or international law</li>
              <li>Facilitating human trafficking, exploitation, or modern slavery</li>
              <li>Attempting unauthorised access to other Users' accounts or Platform systems</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Violations may result in immediate account suspension, permanent ban, revocation of Verified status, forfeiture of Premium Package fees, and/or referral to law enforcement.
            </p>
          </section>

          <section className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">14. INTELLECTUAL PROPERTY RIGHTS</h2>
            
            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">14.1 BounceSteps Intellectual Property</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                All content, trademarks, logos (including the BounceSteps green-and-white brand identity), trade names, software, design elements, databases, the Verification Badge design, and Premium Package branding on the Platform are owned by or licensed to BounceSteps and are protected under Tanzanian and international intellectual property laws.
              </p>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">14.2 User Content Licence</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                By posting Content on the Platform, you grant BounceSteps a worldwide, non-exclusive, royalty-free licence to use, reproduce, display, distribute, and adapt that Content for operating and promoting the Platform. You represent that you own or hold the necessary rights to grant this licence.
              </p>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">14.3 Restrictions</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                Users may not copy, reproduce, distribute, or commercially exploit any BounceSteps IP — including the brand colours, Verification Badge, or platform design — without prior written consent.
              </p>
            </div>
          </section>

          <section className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">15. LIMITATION OF LIABILITY & DISCLAIMERS</h2>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
              <p className="text-yellow-800 font-semibold">
                BounceSteps is a marketplace operator and intermediary. We are not a travel agent, tour operator, or direct service provider. Read this section carefully.
              </p>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">15.1 Platform Disclaimer</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                The Platform is provided on an "as is" and "as available" basis. BounceSteps makes no warranties, express or implied, regarding merchantability, fitness for purpose, or non-infringement.
              </p>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">15.2 Service Quality Disclaimer</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                BounceSteps does not guarantee the accuracy of any Listing, the quality of any service, the conduct of any User, or the safety of any destination or activity. The Verification Badge confirms legal documentation only and is not an endorsement of service quality.
              </p>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">15.3 Limitation of Liability</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                To the maximum extent permitted by Tanzanian law, BounceSteps shall not be liable for indirect, incidental, special, consequential, or punitive damages arising from: use or inability to use the Platform; third-party User conduct; services obtained through the Platform; or unauthorised account access. Total aggregate liability shall not exceed the total Fees paid by you in the 12 months preceding the claim.
              </p>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">15.4 Off-Platform Disclaimer</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                BounceSteps expressly disclaims all liability for any agreements, transactions, disputes, or harm arising from arrangements made between Users outside the Platform. Users who bypass BounceSteps' booking and payment systems do so entirely at their own risk.
              </p>
            </div>
          </section>

          <section className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">16. INDEMNIFICATION</h2>
            <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
              You agree to indemnify, defend, and hold harmless BounceSteps, its directors, officers, employees, agents, and licensors from any claims, liabilities, damages, costs, and expenses (including reasonable legal fees) arising from:
            </p>
            <ul className="list-disc list-inside text-sm md:text-base text-muted-foreground space-y-1.5 md:space-y-2">
              <li>Your use or misuse of the Platform</li>
              <li>Your violation of these Terms or applicable law</li>
              <li>Submission of fraudulent or invalid documents in the Verification process</li>
              <li>Your Content or infringement of third-party intellectual property rights</li>
              <li>Your interactions with other Users or Service Providers</li>
              <li>Services you provide as a Service Provider, including personal injury, property damage, or financial loss caused to Travellers</li>
            </ul>
          </section>


          <section className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">20. THIRD-PARTY SERVICES & LINKS</h2>
            <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
              The Platform may contain links to third-party websites or services. BounceSteps is not responsible for the content, privacy practices, or terms of any third-party services. Accessing third-party content is at your own risk. Third-party integrations for mapping, payment, communications, and analytics are also subject to those providers' own terms.
            </p>
          </section>

          <section className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">21. DISPUTE RESOLUTION & GOVERNING LAW</h2>
            
            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">21.1 Internal Resolution</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                Parties should first attempt amicable resolution directly. If unsuccessful, a formal complaint may be filed through the BounceSteps Resolution Centre in the Platform. BounceSteps will act as a non-binding mediator and aim to provide a resolution within 14 business days.
              </p>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">21.2 BounceSteps Final Decision</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                BounceSteps' decisions on Platform matters (refund eligibility, account actions, Verification revocation, Listing removal) are final and binding, subject only to appeal through applicable legal channels.
              </p>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">21.3 Governing Law</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                These Terms and all matters connected with the Platform are governed by the laws of the United Republic of Tanzania. The parties submit to the exclusive jurisdiction of Tanzanian courts for disputes not resolved through internal mechanisms.
              </p>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">21.4 International Users</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                The Platform is designed primarily for services within Tanzania. Users accessing from outside Tanzania are responsible for compliance with their local laws. Tanzanian law governs the Platform relationship in all cases.
              </p>
            </div>
          </section>

          <section className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">22. CHILD SAFETY & AGE VERIFICATION POLICY</h2>
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
              <p className="text-red-800 font-semibold">
                ZERO TOLERANCE: BounceSteps has a zero-tolerance policy for the exploitation, harm, or endangerment of minors in any form. Violations will result in immediate account termination and referral to law enforcement authorities.
              </p>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">22.1 Age Prohibition</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                The Platform is strictly prohibited from use by any individual under 18 years of age. By creating an account, Users confirm they are 18 or older. BounceSteps may request government-issued ID to verify age at any time.
              </p>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">22.2 Verification Procedures</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                BounceSteps may implement age verification measures at registration or during use. Failure to provide satisfactory proof of age will result in suspension of account access.
              </p>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">22.3 Child Protection Obligations</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                All Service Providers (Verified and Unverified) must comply with Tanzania's Law of the Child Act (Cap. 13). Any service, activity, or content that exploits, endangers, or is inappropriate for minors is strictly prohibited.
              </p>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">22.4 Reporting</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                Any User who suspects child exploitation or abuse connected to a Platform service must report it immediately to safety@bouncesteps.com and to relevant Tanzanian authorities including the Department of Social Welfare or Tanzania Police Force.
              </p>
            </div>
          </section>

          <section className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">23. PLATFORM INTEGRITY & ANTI-FRAUD POLICY</h2>
            
            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">23.1 Fraud Prevention</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                BounceSteps employs automated and manual measures to detect fraud including: identity fraud, payment fraud, submission of fraudulent verification documents, Listing manipulation, and review fraud. Suspected fraudulent accounts may be suspended pending investigation.
              </p>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">23.2 Document Fraud</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                Submission of forged, altered, expired, or invalid legal documents in the Verification process constitutes a serious breach of these Terms and may constitute a criminal offence under Tanzanian law. BounceSteps reserves the right to report such conduct to the relevant government authorities.
              </p>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">23.3 Consequences of Fraud</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                Verified fraudulent conduct will result in: (a) immediate account suspension or permanent termination; (b) revocation of Verified status; (c) forfeiture of any active Premium Package; (d) recovery of any damages; and (e) referral to the Tanzania Police Force and relevant regulatory authorities.
              </p>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">23.4 Reporting Fraud</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                Users are encouraged to report suspected fraudulent activity to fraud@bouncesteps.com. All credible reports will be investigated promptly.
              </p>
            </div>
          </section>

          <section className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">24. MODIFICATIONS TO TERMS & TERMINATION</h2>
            
            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">24.1 Amendments</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                BounceSteps reserves the right to modify these Terms at any time. Material changes will be communicated via email or Platform notification at least 14 days before taking effect. Continued use of the Platform constitutes acceptance of revised Terms.
              </p>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">24.2 Account Termination by User</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                You may terminate your account at any time via account settings or by contacting support@bouncesteps.com. All pending Bookings and payment obligations must be fulfilled prior to termination.
              </p>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">24.3 Termination by BounceSteps</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                BounceSteps may suspend or permanently terminate your account — with or without notice — for violations of these Terms, harmful conduct, submission of fraudulent documents, or Platform discontinuation. Verified status and Premium Packages are immediately revoked upon termination for cause.
              </p>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">24.4 Survival</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                Sections on Intellectual Property, Limitation of Liability, Indemnification, Privacy, and Dispute Resolution survive account termination.
              </p>
            </div>
          </section>

          <section className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">25. CONTACT INFORMATION</h2>
            <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
              For all enquiries, complaints, data requests, verification queries, or legal notices:
            </p>
            <div className="space-y-3">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-foreground font-medium">General Support</p>
                <p className="text-muted-foreground text-sm">Email: support@bouncesteps.com</p>
                <p className="text-muted-foreground text-sm">Purpose: General enquiries & account help</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-foreground font-medium">Legal & Compliance</p>
                <p className="text-muted-foreground text-sm">Email: legal@bouncesteps.com</p>
                <p className="text-muted-foreground text-sm">Purpose: Legal notices, Terms queries</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-foreground font-medium">Verification Team</p>
                <p className="text-muted-foreground text-sm">Email: verify@bouncesteps.com</p>
                <p className="text-muted-foreground text-sm">Purpose: SP verification applications & status</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-foreground font-medium">Premium Packages</p>
                <p className="text-muted-foreground text-sm">Email: packages@bouncesteps.com</p>
                <p className="text-muted-foreground text-sm">Purpose: Badge, Trending & promotion queries</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-foreground font-medium">Privacy & Data</p>
                <p className="text-muted-foreground text-sm">Email: privacy@bouncesteps.com</p>
                <p className="text-muted-foreground text-sm">Purpose: Data requests & privacy matters</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-foreground font-medium">Fraud & Safety</p>
                <p className="text-muted-foreground text-sm">Email: fraud@bouncesteps.com</p>
                <p className="text-muted-foreground text-sm">Purpose: Report fraud or safety concerns</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-foreground font-medium">Child Safety</p>
                <p className="text-muted-foreground text-sm">Email: safety@bouncesteps.com</p>
                <p className="text-muted-foreground text-sm">Purpose: Child protection reports</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-foreground font-medium">Service Providers</p>
                <p className="text-muted-foreground text-sm">Email: partners@bouncesteps.com</p>
                <p className="text-muted-foreground text-sm">Purpose: Partnership & listing support</p>
              </div>
            </div>
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-foreground font-medium">BounceSteps</p>
              <p className="text-muted-foreground">Website: www.bouncesteps.com</p>
              <p className="text-muted-foreground">Registered in: United Republic of Tanzania</p>
            </div>
          </section>

          <section className="mb-6 md:mb-8">
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm text-muted-foreground mb-2">
                By using BounceSteps, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions, Privacy Policy, Verification Policy, Premium Package Rules, and all related policies.
              </p>
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

export default Terms;
