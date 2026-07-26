import Link from "next/link";
import { BRAND } from "@/config/branding";

export const metadata = {
    title: `Privacy Policy | ${BRAND.name}`,
    description: `Privacy Policy for ${BRAND.name} — WhatsApp Business Platform`,
};

export default function PrivacyPolicyPage() {

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
                    Privacy Policy
                </h1>

                <p className="mb-10 text-sm text-muted-foreground">
                    Last updated: {lastUpdated}
                </p>

                <p className="mb-6 leading-relaxed">
                    {BRAND.company.name} ("{BRAND.name}," "we," "us," or "our")
                    provides a WhatsApp Business Platform that helps businesses
                    manage WhatsApp communication with their customers,
                    including message templates, broadcasts, contacts, and
                    conversation history (the "Service"). This Privacy Policy
                    explains what information we collect, how we use it, and
                    the choices you have.
                </p>

                <p className="mb-10 leading-relaxed">
                    By using {BRAND.name}, you agree to the collection and use
                    of information as described in this policy. If you do not
                    agree, please do not use the Service.
                </p>

                <h2 className="mb-3 mt-10 text-xl font-semibold">1. Information We Collect</h2>

                <h3 className="mb-2 mt-6 text-base font-semibold">a. Account Information</h3>
                <p className="mb-4 leading-relaxed">
                    When you sign in with Google, we collect your name, email
                    address, and profile picture to create and manage your
                    {" "}{BRAND.name} account and organization.
                </p>

                <h3 className="mb-2 mt-6 text-base font-semibold">b. WhatsApp Business Account Data</h3>
                <p className="mb-4 leading-relaxed">
                    When you connect a WhatsApp Business Account through Meta's
                    Embedded Signup or manual connection flow, we collect and
                    store:
                </p>
                <ul className="mb-4 list-disc space-y-1 pl-6 leading-relaxed">
                    <li>Your WhatsApp Business Account (WABA) ID and phone number ID</li>
                    <li>Your verified business name and phone number</li>
                    <li>An access token issued by Meta, which we encrypt before storing, used solely to communicate with the WhatsApp Cloud API on your behalf</li>
                    <li>Message quality rating and messaging limit information provided by Meta</li>
                </ul>

                <h3 className="mb-2 mt-6 text-base font-semibold">c. Message Templates and Content</h3>
                <p className="mb-4 leading-relaxed">
                    We store the message templates you create (including text,
                    header images, buttons, and variable sample values) so they
                    can be submitted to Meta for approval and reused when
                    sending messages.
                </p>

                <h3 className="mb-2 mt-6 text-base font-semibold">d. Contacts and Message Activity</h3>
                <p className="mb-4 leading-relaxed">
                    We store the phone numbers you send messages to, the
                    templates used, timestamps, and delivery status (sent,
                    delivered, read, or failed) to give you visibility into
                    your messaging activity.
                </p>

                <h3 className="mb-2 mt-6 text-base font-semibold">e. Uploaded Media</h3>
                <p className="mb-4 leading-relaxed">
                    Images you upload for use in message templates are stored
                    on our servers and, where required, uploaded to Meta as
                    part of template submission.
                </p>

                <h2 className="mb-3 mt-10 text-xl font-semibold">2. How We Use Your Information</h2>
                <ul className="mb-6 list-disc space-y-1 pl-6 leading-relaxed">
                    <li>To provide, operate, and maintain the Service</li>
                    <li>To connect your WhatsApp Business Account and send messages on your behalf, at your direction</li>
                    <li>To submit and manage message templates with Meta's WhatsApp Business Platform</li>
                    <li>To display message delivery status and activity history</li>
                    <li>To communicate with you about your account or the Service</li>
                    <li>To maintain the security and integrity of the Service</li>
                </ul>

                <h2 className="mb-3 mt-10 text-xl font-semibold">3. How We Share Your Information</h2>
                <p className="mb-4 leading-relaxed">
                    We do not sell your personal information. We share
                    information only in the following circumstances:
                </p>
                <ul className="mb-6 list-disc space-y-1 pl-6 leading-relaxed">
                    <li>
                        <strong>Meta Platforms, Inc.</strong> — to send
                        messages, manage templates, and connect WhatsApp
                        Business Accounts, we transmit relevant data to Meta's
                        WhatsApp Business Platform (Cloud API) as required for
                        the Service to function.
                    </li>
                    <li>
                        <strong>Service providers</strong> — infrastructure
                        providers (such as hosting and database providers) who
                        process data on our behalf under appropriate
                        confidentiality obligations.
                    </li>
                    <li>
                        <strong>Legal requirements</strong> — if required to
                        comply with applicable law, regulation, legal process,
                        or governmental request.
                    </li>
                </ul>

                <h2 className="mb-3 mt-10 text-xl font-semibold">4. Data Security</h2>
                <p className="mb-6 leading-relaxed">
                    We take reasonable technical and organizational measures
                    to protect your information. WhatsApp access tokens are
                    encrypted at rest. Access to your organization's data is
                    restricted to your account and authorized members of your
                    organization. However, no method of transmission or
                    storage is completely secure, and we cannot guarantee
                    absolute security.
                </p>

                <h2 className="mb-3 mt-10 text-xl font-semibold">5. Data Retention</h2>
                <p className="mb-6 leading-relaxed">
                    We retain your information for as long as your account is
                    active or as needed to provide the Service. You may
                    request deletion of your account and associated data at
                    any time by contacting us at the email below. Some
                    information may be retained where required by law or for
                    legitimate business purposes, such as fraud prevention or
                    record-keeping.
                </p>

                <h2 className="mb-3 mt-10 text-xl font-semibold">6. Your Choices and Rights</h2>
                <ul className="mb-6 list-disc space-y-1 pl-6 leading-relaxed">
                    <li>You may disconnect your WhatsApp Business Account from {BRAND.name} at any time.</li>
                    <li>You may request access to, correction of, or deletion of your personal data.</li>
                    <li>You may delete templates, contacts, or media you have uploaded through the Service.</li>
                </ul>
                <p className="mb-6 leading-relaxed">
                    To exercise these rights, contact us using the details
                    below.
                </p>

                <h2 className="mb-3 mt-10 text-xl font-semibold">7. Children's Privacy</h2>
                <p className="mb-6 leading-relaxed">
                    The Service is intended for business use and is not
                    directed to individuals under the age of 18. We do not
                    knowingly collect personal information from children.
                </p>

                <h2 className="mb-3 mt-10 text-xl font-semibold">8. Changes to This Policy</h2>
                <p className="mb-6 leading-relaxed">
                    We may update this Privacy Policy from time to time. We
                    will post any changes on this page and update the "Last
                    updated" date above. Continued use of the Service after
                    changes constitutes acceptance of the updated policy.
                </p>

                <h2 className="mb-3 mt-10 text-xl font-semibold">9. Contact Us</h2>
                <p className="mb-6 leading-relaxed">
                    If you have questions about this Privacy Policy or how we
                    handle your data, contact us at:
                </p>
                <p className="mb-2 font-medium text-gradient-brand">
                    {BRAND.company.supportEmail}
                </p>

            </div>

        </div>
    );
}
