import type { Metadata } from "next";
import Link from "next/link";
import { LegalList, LegalPage, LegalSection, Mail } from "@/components/wonderstruck/legal";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The rules for using Wonderstruck, including plans, billing and cancellation.",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro={
        <p>
          These terms are an agreement between you and Wonderstruck (&ldquo;we&rdquo;, &ldquo;us&rdquo;),
          based in Karnataka, India. By creating an account or using Wonderstruck, you agree to them. If
          you don&rsquo;t agree, please don&rsquo;t use the service.
        </p>
      }
    >
      <LegalSection title="1. What Wonderstruck is">
        <p>
          Wonderstruck is an AI-powered learning app. You discover short learning blocks, talk them through
          with Mira, our AI tutor, try interactive activities, and review what you learned with recaps,
          active recall and a personal learning graph.
        </p>
      </LegalSection>

      <LegalSection title="2. Your account">
        <LegalList>
          <li>You sign in with Google. You must be at least 18 years old to create an account.</li>
          <li>Keep your Google account secure. You are responsible for activity on your Wonderstruck account.</li>
          <li>Give us accurate information and use one account per person.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="3. Plans and pricing">
        <p>Wonderstruck has two plans. Prices are in US dollars and may exclude applicable taxes.</p>
        <LegalList>
          <li>
            <strong>Free</strong> &mdash; $0. Daily learning blocks, a limited number of Mira voice minutes
            each day, session recaps, active recall and your learning graph.
          </li>
          <li>
            <strong>Pro</strong> &mdash; $10 per month, or $96 per year. Extended Mira voice time (subject to
            fair use), every interactive activity, and full recall and learning-graph features.
          </li>
        </LegalList>
        <p>
          We may change prices or plan features. We will tell you at least 30 days before a price change
          affects your subscription, and the new price applies from your next billing period.
        </p>
      </LegalSection>

      <LegalSection title="4. Billing and payments">
        <LegalList>
          <li>
            Payments are processed by Dodo Payments, which acts as our Merchant of Record. Dodo Payments
            handles checkout, card and payment details, taxes and invoices. We never see or store your full
            card number.
          </li>
          <li>
            Pro subscriptions renew automatically at the end of each monthly or yearly period, charged to
            the payment method you chose, until you cancel.
          </li>
          <li>If a payment fails, we may pause Pro features until the payment succeeds.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="5. Cancellation and refunds">
        <LegalList>
          <li>You can cancel Pro at any time from your account settings or by emailing us.</li>
          <li>
            When you cancel, you keep Pro until the end of the period you already paid for. After that,
            your account moves to the Free plan and your learning history stays.
          </li>
          <li>
            Payments are non-refundable, including for partly used periods, except where the law requires
            a refund.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="6. Using Wonderstruck fairly">
        <p>Please don&rsquo;t:</p>
        <LegalList>
          <li>break the law or use Wonderstruck to harm, harass or deceive anyone;</li>
          <li>try to get Mira to produce harmful, illegal or abusive content;</li>
          <li>scrape, copy at scale, resell or reverse-engineer the service;</li>
          <li>overload, attack or get around limits and security of the service.</li>
        </LegalList>
        <p>We may suspend or close accounts that break these rules.</p>
      </LegalSection>

      <LegalSection title="7. AI-generated content">
        <p>
          Mira and other AI features can make mistakes. Wonderstruck is for learning and curiosity, not
          professional advice. Don&rsquo;t rely on it for medical, legal, financial or safety decisions, and
          check important facts with trusted sources.
        </p>
      </LegalSection>

      <LegalSection title="8. Your content and ours">
        <p>
          What you say or type to Mira and your answers in activities stay yours. You let us use them to
          run the service for you, such as creating your recaps, recall questions and learning graph. The
          Wonderstruck app, design, brand, mascot and our learning content belong to us. We give you a
          personal, non-transferable right to use them while you have an account.
        </p>
      </LegalSection>

      <LegalSection title="9. Ending your account">
        <p>
          You can stop using Wonderstruck and ask us to delete your account at any time. See the{" "}
          <Link href="/privacy" className="font-medium text-primary-ink underline underline-offset-4">
            Privacy Policy
          </Link>{" "}
          for what happens to your data.
        </p>
      </LegalSection>

      <LegalSection title="10. Disclaimers and liability">
        <p>
          We work hard to keep Wonderstruck available and accurate, but we provide it &ldquo;as is&rdquo;
          without guarantees. As far as the law allows, we are not liable for indirect or consequential
          losses, and our total liability to you is limited to the amount you paid us in the 12 months
          before the claim.
        </p>
      </LegalSection>

      <LegalSection title="11. Changes to these terms">
        <p>
          We may update these terms. If a change is significant, we will notify you by email or in the app
          before it takes effect. Continuing to use Wonderstruck after that means you accept the new terms.
        </p>
      </LegalSection>

      <LegalSection title="12. Governing law">
        <p>
          These terms are governed by the laws of India. Disputes will be handled by the courts of
          Bengaluru, Karnataka.
        </p>
      </LegalSection>

      <LegalSection title="13. Contact">
        <p>
          Questions about these terms or your subscription? Email <Mail />.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
