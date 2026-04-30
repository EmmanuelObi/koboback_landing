/**
 * KoboBack Terms of Service
 * Governing law: Nigeria
 * Effective: 30 April 2026
 */

import {
  LegalLayout,
  Section,
  SubSection,
  P,
  Ul,
  Notice,
} from "../components/LegalLayout";

export default function Terms() {
  return (
    <LegalLayout title="Terms of Service" effectiveDate="30 April 2026">
      {/* ── Introduction ── */}
      <Section title="1. Introduction and Agreement">
        <P>
          Welcome to KoboBack. These Terms of Service ("Terms") govern your
          access to and use of the KoboBack platform, including our website,
          mobile application, AI-powered analysis tools, and any related
          services (collectively, the "Service").
        </P>
        <P>
          By creating an account, uploading a bank statement, or otherwise using
          the Service, you enter into a legally binding agreement with KoboBack
          ("we", "our", or "us"). If you do not agree to these Terms, you must
          not use the Service.
        </P>
        <Notice>
          Please read these Terms carefully. Section 7 (No Guarantee), Section 8
          (Limitation of Liability), and Section 13 (Dispute Resolution) contain
          important information about your legal rights.
        </Notice>
      </Section>

      {/* ── Service Description ── */}
      <Section title="2. What KoboBack Does">
        <P>
          KoboBack is an independent consumer financial analysis platform. We
          are not a bank, a financial institution, a payment service provider,
          or a licensed financial adviser. We do not hold, move, or manage funds
          on your behalf.
        </P>
        <P>Our Service enables you to:</P>
        <Ul
          items={[
            "Upload bank statements in PDF or supported formats for AI-powered analysis",
            "Receive a report identifying transactions that may constitute billing errors, illegal charges, or unreversed failed transaction debits",
            "Access guidance and assistance in understanding and, where appropriate, formally disputing identified errors with the relevant financial institution",
            "Opt into continuous monitoring of your bank account activity (where available) to detect issues on an ongoing basis",
          ]}
        />
        <P>
          The nature of our analysis is investigative and advisory. KoboBack
          identifies potential issues based on pattern recognition and
          established error typologies. We do not make legally binding
          determinations about what a bank owes you. All findings should be
          treated as informed assessments, not guarantees.
        </P>
      </Section>

      {/* ── Eligibility ── */}
      <Section title="3. Eligibility">
        <SubSection title="3.1 Age">
          <P>
            You must be at least 18 years of age to use KoboBack. By using the
            Service, you confirm that you meet this requirement.
          </P>
        </SubSection>

        <SubSection title="3.2 Accurate Information">
          <P>
            You agree to provide accurate, truthful, and complete information
            when creating an account or uploading documents. You must not
            impersonate another person or use another person's bank statements
            without their explicit authorisation.
          </P>
        </SubSection>

        <SubSection title="3.3 Lawful Use">
          <P>
            The Service may only be used for lawful purposes and in relation to
            bank accounts and financial data that you own or are legally
            authorised to access and analyse.
          </P>
        </SubSection>
      </Section>

      {/* ── User Responsibilities ── */}
      <Section title="4. Your Responsibilities">
        <P>When using KoboBack, you agree to:</P>
        <Ul
          items={[
            "Upload only genuine bank statements issued to you by your financial institution",
            "Use the platform for legitimate personal or business financial review purposes only",
            "Not upload documents containing fraudulent, fabricated, or altered information",
            "Not use the platform to facilitate any unlawful activity, including financial fraud or money laundering",
            "Not attempt to reverse-engineer, copy, or exploit any part of our technology or intellectual property",
            "Not use automated tools, bots, or scrapers to access the platform without prior written permission",
            "Maintain the security of your account credentials and notify us immediately of any unauthorised access",
          ]}
        />
        <P>
          We reserve the right to suspend or permanently terminate your account
          if we have reasonable grounds to believe you have violated these
          responsibilities.
        </P>
      </Section>

      {/* ── Fees and Payments ── */}
      <Section title="5. Fees and Payment Terms">
        <SubSection title="5.1 Free Scan">
          <P>
            KoboBack offers a basic free scan of your bank statement, which
            provides a summary-level overview of potential issues detected. No
            payment is required for this tier.
          </P>
        </SubSection>

        <SubSection title="5.2 Paid Audit">
          <P>
            A detailed audit report — including itemised findings, error
            classifications, and a full estimated recovery breakdown — is
            available as a paid feature. The current fee for a paid audit is
            displayed on our pricing page and is subject to change. Fees are
            charged at the time of requesting the detailed report.
          </P>
        </SubSection>

        <SubSection title="5.3 Subscription (Continuous Monitoring)">
          <P>
            Users who opt into our subscription tier receive ongoing monitoring
            of their bank account activity, regular audit summaries, and
            priority support. Subscription fees are billed monthly or annually
            as selected at signup. You may cancel your subscription at any time;
            cancellation takes effect at the end of the current billing period.
            No partial refunds are issued for unused subscription time unless
            required by applicable law.
          </P>
        </SubSection>

        <SubSection title="5.4 Success Fee (Recovery Assistance)">
          <P>
            Where KoboBack actively assists you in recovering funds from your
            bank — including preparing formal dispute communications on your
            behalf — we charge a success fee. This fee is:
          </P>
          <Ul
            items={[
              "Calculated as a percentage of the amount actually recovered and credited to your account",
              "Only charged when a successful recovery is confirmed",
              "Never charged if no recovery occurs, regardless of the effort invested",
              "Disclosed clearly and agreed upon by you before any recovery assistance begins",
            ]}
          />
          <P>
            The applicable success fee percentage is stated on our platform and
            in any engagement confirmation we send to you. We will not charge a
            success fee without your prior written consent.
          </P>
        </SubSection>

        <SubSection title="5.5 Refund Policy">
          <P>
            Fees for paid audits are non-refundable once the audit report has
            been generated and delivered, as the analytical work will have been
            completed. If a technical error on our part prevents delivery of
            your report, you are entitled to a full refund of the audit fee.
            Subscription fees are non-refundable except where required by law.
            To request a refund, contact us at{" "}
            <a
              href="mailto:billing@koboback.com"
              className="text-blue-600 hover:text-blue-700"
            >
              billing@koboback.com
            </a>
            .
          </P>
        </SubSection>
      </Section>

      {/* ── Data and Privacy ── */}
      <Section title="6. Data, Privacy, and Confidentiality">
        <P>
          Your use of KoboBack involves sharing sensitive financial data with
          us. We treat this data with the highest degree of care. Our complete{" "}
          <a href="/privacy" className="text-blue-600 hover:text-blue-700">
            Privacy Policy
          </a>{" "}
          forms part of these Terms and governs how we collect, use, store, and
          protect your data.
        </P>
        <P>Key commitments:</P>
        <Ul
          items={[
            "We will never sell your personal or financial data to third parties",
            "Your uploaded bank statements are used solely to generate your requested analysis",
            "All data is encrypted in transit (TLS) and at rest (AES-256)",
            "You retain ownership of all data you upload; we receive a limited licence to process it solely to deliver the Service",
          ]}
        />
      </Section>

      {/* ── No Guarantee ── */}
      <Section title="7. No Guarantee of Results">
        <Notice>This section is important. Please read it carefully.</Notice>
        <SubSection title="7.1 Analysis Accuracy">
          <P>
            While we invest significantly in the accuracy of our AI analysis,
            KoboBack does not guarantee that every billing error in your
            statement will be detected. Our models are trained on known error
            patterns and may not identify novel or highly specific bank
            practices. Findings should be treated as a starting point for
            investigation, not as a definitive or exhaustive audit.
          </P>
        </SubSection>
        <SubSection title="7.2 Recovery Outcomes">
          <P>
            KoboBack does not guarantee that any funds will be recovered. The
            outcome of a dispute with a bank depends on factors outside our
            control, including the policies of the financial institution, the
            evidence available, regulatory decisions, and the nature of the
            identified error. We make no promise or representation that
            initiating a dispute will result in a successful refund.
          </P>
        </SubSection>
        <SubSection title="7.3 No Legal or Financial Advice">
          <P>
            Nothing on the KoboBack platform constitutes legal, financial, or
            regulatory advice. If you require formal legal or financial counsel
            in connection with a dispute, you should consult a qualified
            professional.
          </P>
        </SubSection>
      </Section>

      {/* ── Limitation of Liability ── */}
      <Section title="8. Limitation of Liability">
        <P>To the maximum extent permitted by applicable Nigerian law:</P>
        <Ul
          items={[
            "KoboBack's total aggregate liability to you for any claim arising from these Terms or the use of our Service shall not exceed the total amount you have paid to KoboBack in the three (3) months preceding the event giving rise to the claim, or ₦50,000 — whichever is greater",
            "KoboBack shall not be liable for any indirect, incidental, consequential, special, or punitive damages, including loss of profit, loss of data, loss of opportunity, or reputational harm, even if we have been advised of the possibility of such damages",
            "We are not liable for the actions or decisions of any financial institution in response to a dispute you raise, whether or not that dispute was initiated with our assistance",
          ]}
        />
        <P>
          Nothing in these Terms limits our liability for fraud, gross
          negligence, wilful misconduct, or any liability that cannot be
          excluded under Nigerian law.
        </P>
      </Section>

      {/* ── Intellectual Property ── */}
      <Section title="9. Intellectual Property">
        <SubSection title="9.1 KoboBack's IP">
          <P>
            All intellectual property in the KoboBack platform — including our
            software, AI models, analysis methodologies, design, trademarks, and
            content — belongs exclusively to KoboBack. Nothing in these Terms
            grants you a licence to reproduce, modify, distribute, or
            commercially exploit any part of our intellectual property.
          </P>
        </SubSection>
        <SubSection title="9.2 Your Data">
          <P>
            You retain full ownership of all data you upload to KoboBack. By
            uploading a bank statement, you grant KoboBack a limited,
            non-exclusive, revocable licence to process and analyse that data
            solely for the purpose of providing you with the Service. This
            licence terminates when you request deletion of your data or close
            your account.
          </P>
        </SubSection>
        <SubSection title="9.3 Feedback">
          <P>
            If you provide us with feedback or suggestions about the Service, we
            may use that feedback to improve the platform without obligation or
            compensation to you.
          </P>
        </SubSection>
      </Section>

      {/* ── Termination ── */}
      <Section title="10. Account Suspension and Termination">
        <SubSection title="10.1 By You">
          <P>
            You may close your KoboBack account at any time by contacting us at{" "}
            <a
              href="mailto:hello@koboback.com"
              className="text-blue-600 hover:text-blue-700"
            >
              hello@koboback.com
            </a>
            . Upon account closure, we will delete your personal data in
            accordance with our Privacy Policy, subject to any legal retention
            obligations.
          </P>
        </SubSection>
        <SubSection title="10.2 By KoboBack">
          <P>
            We reserve the right to suspend or terminate your account with
            immediate effect where:
          </P>
          <Ul
            items={[
              "You have materially breached these Terms",
              "We have reasonable grounds to suspect fraudulent or unlawful use of the platform",
              "Your continued use poses a risk to the security or integrity of the platform or other users",
              "We are required to do so by law or a regulatory authority",
            ]}
          />
          <P>
            Where possible, we will give you advance notice and an opportunity
            to remedy any breach before taking action. In cases of serious or
            urgent risk, we may act immediately.
          </P>
        </SubSection>
        <SubSection title="10.3 Effect of Termination">
          <P>
            On termination, your right to access the Service ceases. Any
            outstanding fees become immediately due. Sections 7, 8, 9, and 13 of
            these Terms survive termination.
          </P>
        </SubSection>
      </Section>

      {/* ── Third Party Services ── */}
      <Section title="11. Third-Party Services and Links">
        <P>
          The KoboBack platform may contain links to or integrations with
          third-party services (e.g., payment processors, cloud providers).
          These third parties operate under their own terms and privacy
          policies. KoboBack is not responsible for the practices, content, or
          reliability of any third-party service.
        </P>
      </Section>

      {/* ── Modifications to Service ── */}
      <Section title="12. Changes to the Service">
        <P>
          We continually improve KoboBack. We reserve the right to modify,
          suspend, or discontinue any part of the Service at any time, with
          reasonable notice where feasible. We will not be liable to you for any
          such modification or discontinuation, although we will endeavour to
          give sufficient advance notice where a change materially affects your
          use of the Service.
        </P>
      </Section>

      {/* ── Dispute Resolution ── */}
      <Section title="13. Governing Law and Dispute Resolution">
        <SubSection title="13.1 Governing Law">
          <P>
            These Terms are governed by and construed in accordance with the
            laws of the Federal Republic of Nigeria. Nothing in this clause
            limits your rights under any applicable mandatory consumer
            protection legislation.
          </P>
        </SubSection>
        <SubSection title="13.2 Informal Resolution">
          <P>
            We encourage you to contact us first if you have a complaint or
            dispute regarding the Service. Many issues can be resolved quickly
            and informally. Please email{" "}
            <a
              href="mailto:hello@koboback.com"
              className="text-blue-600 hover:text-blue-700"
            >
              hello@koboback.com
            </a>{" "}
            with a description of your concern, and we will respond within 10
            business days.
          </P>
        </SubSection>
        <SubSection title="13.3 Formal Proceedings">
          <P>
            If a dispute cannot be resolved informally, it shall be subject to
            the exclusive jurisdiction of the courts of Nigeria. Both parties
            submit to the personal jurisdiction of such courts for the purpose
            of resolving any dispute arising under these Terms.
          </P>
        </SubSection>
        <SubSection title="13.4 Regulatory Complaints">
          <P>
            If your complaint relates to data protection, you may also raise it
            directly with the Nigeria Data Protection Commission (NDPC). If it
            relates to consumer financial rights, you may raise it with the
            Federal Competition and Consumer Protection Commission (FCCPC) or
            the Central Bank of Nigeria (CBN) Consumer Protection Department.
          </P>
        </SubSection>
      </Section>

      {/* ── Changes to Terms ── */}
      <Section title="14. Changes to These Terms">
        <P>
          We may update these Terms from time to time. When we make material
          changes, we will notify you at least 14 days in advance by email or
          through a prominent notice on the platform. If you continue to use the
          Service after the effective date of the revised Terms, you are deemed
          to have accepted the changes.
        </P>
        <P>
          If you do not agree to updated Terms, you must stop using the Service
          and may request deletion of your account before the changes take
          effect.
        </P>
      </Section>

      {/* ── Entire Agreement ── */}
      <Section title="15. Entire Agreement">
        <P>
          These Terms, together with our{" "}
          <a href="/privacy" className="text-blue-600 hover:text-blue-700">
            Privacy Policy
          </a>{" "}
          and any additional terms applicable to specific features or
          subscriptions, constitute the entire agreement between you and
          KoboBack regarding the Service and supersede all prior agreements,
          representations, or understandings of any kind.
        </P>
        <P>
          If any provision of these Terms is found to be unenforceable, the
          remaining provisions will continue in full force and effect.
        </P>
      </Section>

      {/* ── Contact ── */}
      <Section title="16. Contact">
        <P>For any questions about these Terms, please contact:</P>
        <Ul
          items={[
            "General: hello@koboback.com",
            "Billing: billing@koboback.com",
            "Data / Privacy: privacy@koboback.com",
            "Website: koboback.com",
          ]}
        />
      </Section>
    </LegalLayout>
  );
}
