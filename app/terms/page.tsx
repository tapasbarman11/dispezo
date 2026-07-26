import Link from "next/link";
import { BRAND } from "@/config/branding";

export const metadata = {
    title: `Terms of Service | ${BRAND.name}`,
    description: `Terms of Service for ${BRAND.name} — WhatsApp Business Platform`,
};

export default function TermsOfServicePage() {

    const lastUpdated = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(new Date());

    return (
        <div className="min-h-screen bg-background text-foreground">

            <header className="border-b border-border px-6 py-6">
                <div className="mx-auto flex max-w-3xl items-center">
                    <Link href="/" className="flex items-center gap-3">
                        <img
                            src={BRAND.logo}
                            alt={BRAND.name}
                            className="h-9 w-auto"
                        />
                    </Link>
                </div>
            </header>

            <div className="mx-auto max-w-3xl px-6 py-16">

                <h1 className="mb-2 text-3xl font-bold text-gradient-brand">
                    Terms of Service
                </h1>

                <p className="mb-10 text-sm text-muted-foreground">
                    Last updated: {lastUpdated}
                </p>

                <p className="mb-6 leading-relaxed">
                    These Terms of Service ("Terms") govern your access to and
                    use of {BRAND.name} (the "Service"), operated by
                    {" "}{BRAND.company.name} ("{BRAND.name}," "we," "us," or
                    "our"). By creating an account or using the Service, you
                    agree to be bound by these Terms.
                </p>

                <h2 className="mb-3 mt-10 text-xl font-semibold">1. The Service</h2>
                <p className="mb-6 leading-relaxed">
                    {BRAND.name} is a platform that enables businesses to
                    connect their WhatsApp Business Account, create and
                    submit message templates, manage contacts, and send
                    WhatsApp messages through Meta's WhatsApp Business
                    Platform (Cloud API). {BRAND.name} acts as a technology
                    provider facilitating your use of WhatsApp's official
                    APIs; it does not own or control WhatsApp or Meta's
                    underlying platform.
                </p>

                <h2 className="mb-3 mt-10 text-xl font-semibold">2. Eligibility and Account Registration</h2>
                <p className="mb-6 leading-relaxed">
                    You must be at least 18 years old and have the authority
                    to bind the business you represent to use the Service.
                    You are responsible for maintaining the confidentiality
                    of your account credentials and for all activity under
                    your account.
                </p>

                <h2 className="mb-3 mt-10 text-xl font-semibold">3. Your Responsibilities</h2>
                <p className="mb-4 leading-relaxed">You agree that you will:</p>
                <ul className="mb-6 list-disc space-y-1 pl-6 leading-relaxed">
                    <li>Comply with Meta's WhatsApp Business Messaging Policy, Commerce Policy, and all applicable WhatsApp Business Platform terms</li>
                    <li>Only message recipients who have provided appropriate opt-in consent to receive messages from your business</li>
                    <li>Not use the Service to send spam, unsolicited bulk messages, or content that violates applicable law</li>
                    <li>Not use the Service for any unlawful, fraudulent, harassing, or abusive purpose</li>
                    <li>Ensure that any content, templates, or media you submit comply with Meta's template guidelines</li>
                    <li>Be solely responsible for the content of messages and templates you create and send through the Service</li>
                </ul>

                <h2 className="mb-3 mt-10 text-xl font-semibold">4. Meta and WhatsApp Compliance</h2>
                <p className="mb-6 leading-relaxed">
                    Your use of the Service is subject to Meta's WhatsApp
                    Business Platform Terms of Service and Business Messaging
                    Policy. We reserve the right to suspend or terminate your
                    access to the Service if your use violates Meta's
                    policies, results in template rejections, or negatively
                    affects your messaging quality rating or the standing of
                    our platform with Meta.
                </p>

                <h2 className="mb-3 mt-10 text-xl font-semibold">5. Fees</h2>
                <p className="mb-6 leading-relaxed">
                    Use of the Service may be subject to fees as described on
                    our pricing page. Message-based charges from Meta's
                    WhatsApp Business Platform may be passed through to you
                    at the rates disclosed at the time of use. [Update this
                    section to match your actual billing model before
                    publishing.]
                </p>

                <h2 className="mb-3 mt-10 text-xl font-semibold">6. Data and Privacy</h2>
                <p className="mb-6 leading-relaxed">
                    Our collection and use of information in connection with
                    the Service is described in our{" "}
                    <a
                        href="/privacy"
                        className="font-medium text-gradient-brand underline decoration-2 underline-offset-2"
                    >
                        Privacy Policy
                    </a>
                    , which is incorporated into these Terms by reference.
                </p>

                <h2 className="mb-3 mt-10 text-xl font-semibold">7. Intellectual Property</h2>
                <p className="mb-6 leading-relaxed">
                    The Service, including its software, design, and content
                    (excluding content you submit), is owned by
                    {" "}{BRAND.company.name} and protected by applicable
                    intellectual property laws. You retain ownership of the
                    templates, contacts, and content you upload to the
                    Service.
                </p>

                <h2 className="mb-3 mt-10 text-xl font-semibold">8. Service Availability</h2>
                <p className="mb-6 leading-relaxed">
                    We aim to keep the Service available and reliable, but we
                    do not guarantee uninterrupted or error-free operation.
                    The Service depends in part on third-party
                    infrastructure, including Meta's WhatsApp Business
                    Platform, which is outside our control.
                </p>

                <h2 className="mb-3 mt-10 text-xl font-semibold">9. Termination</h2>
                <p className="mb-6 leading-relaxed">
                    You may stop using the Service and disconnect your
                    WhatsApp Business Account at any time. We may suspend or
                    terminate your access to the Service if you violate
                    these Terms, Meta's policies, or applicable law, or for
                    any reason with reasonable notice where practicable.
                </p>

                <h2 className="mb-3 mt-10 text-xl font-semibold">10. Disclaimer of Warranties</h2>
                <p className="mb-6 leading-relaxed">
                    The Service is provided "as is" and "as available"
                    without warranties of any kind, whether express or
                    implied, including but not limited to warranties of
                    merchantability, fitness for a particular purpose, and
                    non-infringement.
                </p>

                <h2 className="mb-3 mt-10 text-xl font-semibold">11. Limitation of Liability</h2>
                <p className="mb-6 leading-relaxed">
                    To the maximum extent permitted by law,
                    {" "}{BRAND.company.name} shall not be liable for any
                    indirect, incidental, special, consequential, or punitive
                    damages, or any loss of profits or revenues, arising from
                    your use of the Service.
                </p>

                <h2 className="mb-3 mt-10 text-xl font-semibold">12. Changes to These Terms</h2>
                <p className="mb-6 leading-relaxed">
                    We may update these Terms from time to time. We will post
                    any changes on this page and update the "Last updated"
                    date above. Continued use of the Service after changes
                    constitutes acceptance of the updated Terms.
                </p>

                <h2 className="mb-3 mt-10 text-xl font-semibold">13. Governing Law</h2>
                <p className="mb-6 leading-relaxed">
                    These Terms are governed by the laws of the jurisdiction
                    in which {BRAND.company.name} is registered, without
                    regard to its conflict of law principles. [Specify your
                    exact jurisdiction here, e.g. "the Republic of India."]
                </p>

                <h2 className="mb-3 mt-10 text-xl font-semibold">14. Contact Us</h2>
                <p className="mb-6 leading-relaxed">
                    If you have questions about these Terms, contact us at:
                </p>
                <p className="mb-2 font-medium text-gradient-brand">
                    {BRAND.company.supportEmail}
                </p>

            </div>

        </div>
    );
}
