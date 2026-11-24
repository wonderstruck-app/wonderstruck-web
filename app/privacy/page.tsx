import type { Metadata } from "next";
import { LegalList, LegalPage, LegalSection, Mail } from "@/components/wonderstruck/legal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What data Wonderstruck collects, why, who we share it with, and your choices.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro={
        <p>
          This policy explains, in plain language, what Wonderstruck (based in Karnataka, India) collects
          when you use the app, why we need it, and the choices you have. We don&rsquo;t sell your data and
          we don&rsquo;t show ads.
        </p>
      }
    >
      <LegalSection title="1. What we collect">
        <LegalList>
          <li>
            <strong>Account details from Google:</strong> your name, email address and profile photo when you
            sign in with Google.
          </li>
          <li>
            <strong>Learning activity:</strong> the blocks you open and save, your sessions with Mira
            (transcripts of what you say or type and Mira&rsquo;s replies), activity answers, recaps, recall
            results, the concepts you&rsquo;ve learned and your settings.
          </li>
          <li>
            <strong>Voice:</strong> when you talk to Mira, your microphone audio is streamed to our AI
            provider so Mira can reply. We keep the text transcript, not audio recordings.
          </li>
          <li>
            <strong>Payments:</strong> if you buy Pro, Dodo Payments collects your payment details. We only
            receive your plan, billing status and the country needed for taxes, never your full card
            number.
          </li>
          <li>
            <strong>Technical data:</strong> sign-in cookies, IP address, browser and device type, and error
            logs that keep the service secure and working.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="2. Why we use it">
        <LegalList>
          <li>To run your account and keep you signed in.</li>
          <li>To power Mira, create recaps and recall questions, and build your learning graph.</li>
          <li>To personalise what you discover based on what you&rsquo;ve learned.</li>
          <li>To process subscriptions and provide support.</li>
          <li>To keep Wonderstruck secure, fix problems and improve the product.</li>
        </LegalList>
        <p>We do not sell your personal data or use it for advertising.</p>
      </LegalSection>

      <LegalSection title="3. Who we share it with">
        <p>Only with services that help us run Wonderstruck, and only what they need:</p>
        <LegalList>
          <li>
            <strong>Google</strong> &mdash; sign-in, and the Gemini Live API for voice conversations with
            Mira.
          </li>
          <li>
            <strong>AI model providers via OpenRouter</strong> &mdash; to generate recaps, recall questions,
            activities and concept links from your learning content.
          </li>
          <li>
            <strong>Microsoft Azure</strong> &mdash; hosting and database storage.
          </li>
          <li>
            <strong>Dodo Payments</strong> &mdash; payments, taxes and invoices as our Merchant of Record.
          </li>
        </LegalList>
        <p>
          We may also share data if the law requires it, or to protect the safety of our users and the
          service. Some of these providers process data outside India.
        </p>
      </LegalSection>

      <LegalSection title="4. Cookies">
        <p>
          We use essential cookies to keep you signed in, and your browser&rsquo;s storage to remember
          preferences such as light or dark mode. We don&rsquo;t use advertising or third-party tracking
          cookies.
        </p>
      </LegalSection>

      <LegalSection title="5. How long we keep it">
        <p>
          We keep your data while your account is active. If you delete your account, we delete your
          personal data within 30 days, except records we must keep by law, such as payment and tax
          records.
        </p>
      </LegalSection>

      <LegalSection title="6. Your choices and rights">
        <LegalList>
          <li>See, download or correct your personal data.</li>
          <li>Delete individual memories or your whole account.</li>
          <li>Withdraw consent, for example by stopping voice sessions or deleting your account.</li>
          <li>Raise a complaint with us, and with the relevant data protection authority if needed.</li>
        </LegalList>
        <p>
          To use any of these rights, email <Mail />. We will reply within 30 days.
        </p>
      </LegalSection>

      <LegalSection title="7. Security">
        <p>
          Data is encrypted in transit, Google sign-in tokens are stored encrypted, and access to our
          systems is restricted. No system is perfectly secure, but we will tell you promptly if a breach
          affects your data.
        </p>
      </LegalSection>

      <LegalSection title="8. Age">
        <p>
          Wonderstruck is for people aged 18 and over. We don&rsquo;t knowingly collect data from anyone
          younger. If you believe a minor has an account, contact us and we will delete it.
        </p>
      </LegalSection>

      <LegalSection title="9. Changes to this policy">
        <p>
          If we make significant changes, we will let you know by email or in the app before they take
          effect.
        </p>
      </LegalSection>

      <LegalSection title="10. Contact">
        <p>
          Questions about privacy? Email <Mail />. This policy is written to follow India&rsquo;s Digital
          Personal Data Protection Act, 2023.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
