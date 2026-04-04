import { useNavigate } from "react-router-dom";

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-16">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-primary-foreground/90">
            Last updated: January 2026
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Agreement to Terms</h2>
            <p className="text-muted-foreground mb-4">
              By accessing and using BounceSteps, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Use License</h2>
            <p className="text-muted-foreground mb-4">
              Permission is granted to temporarily use BounceSteps for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to reverse engineer any software contained on the platform</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">User Accounts</h2>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                When you create an account with us, you must provide information that is accurate, complete, and current at all times.
              </p>
              <p className="text-muted-foreground">
                You are responsible for safeguarding the password and for all activities that occur under your account.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Booking and Payments</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>All bookings are subject to availability and confirmation</li>
              <li>Prices are subject to change without notice</li>
              <li>Payment must be made in full at the time of booking</li>
              <li>Cancellation policies vary by service provider</li>
              <li>BounceSteps acts as an intermediary between travelers and service providers</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Service Provider Terms</h2>
            <p className="text-muted-foreground mb-4">
              Service providers using our platform agree to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Provide accurate service descriptions and pricing</li>
              <li>Honor confirmed bookings</li>
              <li>Maintain appropriate licenses and insurance</li>
              <li>Comply with local laws and regulations</li>
              <li>Provide quality services as advertised</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Prohibited Uses</h2>
            <p className="text-muted-foreground mb-4">
              You may not use our service:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
              <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
              <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
              <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
              <li>To submit false or misleading information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Disclaimer</h2>
            <p className="text-muted-foreground mb-4">
              The information on this platform is provided on an 'as is' basis. To the fullest extent permitted by law, BounceSteps excludes all representations, warranties, conditions and terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Limitations</h2>
            <p className="text-muted-foreground mb-4">
              In no event shall BounceSteps or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on BounceSteps' platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Governing Law</h2>
            <p className="text-muted-foreground mb-4">
              These terms and conditions are governed by and construed in accordance with the laws of Tanzania and you irrevocably submit to the exclusive jurisdiction of the courts in that state or location.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Contact Information</h2>
            <p className="text-muted-foreground">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-foreground font-medium">BounceSteps Legal Team</p>
              <p className="text-muted-foreground">Email: legal@bouncesteps.com</p>
              <p className="text-muted-foreground">Address: Tanzania</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;