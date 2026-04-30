/**
 * KoboBack Privacy Policy
 * Jurisdiction: Nigeria (NDPA-compliant, GDPR-inspired structure)
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

export default function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy" effectiveDate="30 April 2026">
      {/* ── Introduction ── */}
      <Section title="1. Introduction">
        <P>
          KoboBack ("we", "our", or "us") is a consumer-first financial
          technology platform registered and operating in Nigeria. Our service
          uses artificial intelligence to analyse bank statements, detect
          potential billing errors, and assist users in recovering funds they
          may be owed by their bank.
        </P>
        <P>
          We understand that the data you share with us, including your
          financial records, is among the most sensitive information that
          exists. This Privacy Policy explains precisely what data we collect,
          why we collect it, how we protect it, and what rights you have over
          it.
        </P>
        <P>
          This policy is written to comply with the{" "}
          <strong>Nigeria Data Protection Act 2023 (NDPA)</strong> and follows
          best-practice principles aligned with global data protection
          frameworks.
        </P>
        <Notice>
          By creating an account or using any part of the KoboBack platform, you
          confirm that you have read and understood this Privacy Policy and
          consent to the processing of your personal data as described herein.
        </Notice>
      </Section>

      {/* ── Data We Collect ── */}
      <Section title="2. Data We Collect">
        <P>
          We collect only the data necessary to deliver our service. We do not
          collect data speculatively or in bulk.
        </P>

        <SubSection title="2.1 Account and Identity Data">
          <Ul
            items={[
              "Full name (used for account identification and correspondence)",
              "Email address (used for account login, notifications, and support)",
              "Phone number (optional, used for account recovery and alerts)",
              "Date of birth (where required to verify eligibility)",
            ]}
          />
        </SubSection>

        <SubSection title="2.2 Financial Data">
          <Ul
            items={[
              "Bank statement files (PDF or structured formats) that you voluntarily upload",
              "Transaction data extracted from those statements, including dates, amounts, descriptions, and merchant references",
              "Account numbers or BVN fragments visible within uploaded documents (we do not require or request BVN separately)",
              "Bank name and account type",
            ]}
          />
          <P>
            We do not receive live access to your bank account unless you
            explicitly grant it through a future open banking integration. All
            financial data at present is derived solely from what you upload.
          </P>
        </SubSection>

        <SubSection title="2.3 Technical and Usage Data">
          <Ul
            items={[
              "IP address and approximate geographic location (country or city level)",
              "Browser type and version",
              "Device type and operating system",
              "Pages visited, features used, and session duration",
              "Referring URLs (how you arrived at our platform)",
              "Error logs and crash reports (anonymised where possible)",
            ]}
          />
        </SubSection>

        <SubSection title="2.4 Communications Data">
          <Ul
            items={[
              "Messages and requests you send to our support team",
              "Feedback, survey responses, or reviews you voluntarily submit",
            ]}
          />
        </SubSection>
      </Section>

      {/* ── How Data is Collected ── */}
      <Section title="3. How We Collect Your Data">
        <SubSection title="3.1 Data You Provide Directly">
          <P>
            We collect data when you register for an account, upload a bank
            statement, complete a form, or contact our support team.
          </P>
        </SubSection>

        <SubSection title="3.2 Data Collected Automatically">
          <P>
            When you use our platform, we automatically collect certain
            technical data (IP address, device information, usage analytics)
            through cookies, server logs, and similar technologies. See Section
            10 for our full cookies policy.
          </P>
        </SubSection>

        <SubSection title="3.3 Future Data Sources">
          <P>
            We may in the future offer direct bank connectivity through open
            banking APIs or regulated data-sharing frameworks. Any such
            integration will require your explicit, separate consent and will be
            clearly disclosed before activation.
          </P>
        </SubSection>
      </Section>

      {/* ── How Data is Used ── */}
      <Section title="4. How We Use Your Data">
        <P>
          We use your personal and financial data for the following purposes:
        </P>

        <SubSection title="4.1 Service Delivery">
          <Ul
            items={[
              "Parsing and analysing your bank statements to identify potential errors, illegal charges, or unreversed transactions",
              "Generating personalised audit reports showing detected issues and estimated recoverable amounts",
              "Guiding you through the fund recovery process, including drafting dispute correspondence where applicable",
            ]}
          />
        </SubSection>

        <SubSection title="4.2 Account Management">
          <Ul
            items={[
              "Creating and maintaining your user account",
              "Authenticating your identity when you log in",
              "Communicating service updates, scan results, and recovery progress",
            ]}
          />
        </SubSection>

        <SubSection title="4.3 Service Improvement">
          <Ul
            items={[
              "Training and improving our AI models to detect a broader range of errors more accurately",
              "Conducting anonymised, aggregated analysis of error patterns across the Nigerian banking sector",
              "Identifying and fixing bugs or usability issues in our platform",
            ]}
          />
          <P>
            Where data is used to train AI models, it is first anonymised and
            stripped of personally identifiable information. We do not use your
            financial data in identifiable form for model training without your
            explicit consent.
          </P>
        </SubSection>

        <SubSection title="4.4 Legal and Compliance Obligations">
          <Ul
            items={[
              "Complying with applicable Nigerian laws and regulatory requirements",
              "Responding to lawful requests from courts, regulators, or law enforcement authorities",
              "Maintaining records required for tax, audit, or dispute resolution purposes",
            ]}
          />
        </SubSection>

        <SubSection title="4.5 Communications and Marketing">
          <Ul
            items={[
              "Sending service-related notifications (scan complete, recovery update, etc.)",
              "Sending product updates or educational content about bank consumer rights, with your consent only",
            ]}
          />
          <P>
            You may opt out of marketing communications at any time by clicking
            the unsubscribe link in any email or by contacting us directly.
          </P>
        </SubSection>
      </Section>

      {/* ── Legal Basis ── */}
      <Section title="5. Legal Basis for Processing">
        <P>
          Under the Nigeria Data Protection Act 2023, we process your personal
          data on the following legal grounds:
        </P>
        <Ul
          items={[
            "Consent — where you have expressly agreed to a specific type of processing, such as uploading your financial documents or receiving marketing emails",
            "Contract — processing necessary to deliver the service you have signed up for, including statement analysis and report generation",
            "Legal obligation — processing required to comply with applicable Nigerian law or a binding regulatory direction",
            "Legitimate interests — certain technical and security processing activities that are necessary for platform integrity and do not override your fundamental rights",
          ]}
        />
        <P>
          Where consent is the basis for processing, you have the right to
          withdraw that consent at any time without affecting the lawfulness of
          processing that occurred before withdrawal.
        </P>
      </Section>

      {/* ── Data Sharing ── */}
      <Section title="6. Data Sharing and Disclosure">
        <Notice>
          We do not sell, rent, or trade your personal or financial data to any
          third party, under any circumstances.
        </Notice>

        <P>
          We may share your data only in the following limited circumstances:
        </P>

        <SubSection title="6.1 Service Providers">
          <P>
            We engage trusted third-party vendors to support platform
            operations, including cloud hosting providers, payment processors,
            email delivery services, and analytics tools. These providers are
            contractually prohibited from using your data for any purpose other
            than providing services to KoboBack and are required to maintain
            appropriate security standards.
          </P>
        </SubSection>

        <SubSection title="6.2 Regulatory and Legal Authorities">
          <P>
            We may disclose your data if required by Nigerian law, a court
            order, or a binding request from a regulatory authority such as the
            Central Bank of Nigeria (CBN), the Federal Competition and Consumer
            Protection Commission (FCCPC), or the Nigeria Data Protection
            Commission (NDPC). We will notify you of such requests where we are
            legally permitted to do so.
          </P>
        </SubSection>

        <SubSection title="6.3 Recovery Assistance">
          <P>
            If you request that KoboBack assist in filing a formal dispute with
            your bank on your behalf, we may share the relevant portion of your
            statement analysis with that financial institution. We will always
            obtain your explicit instruction before doing so.
          </P>
        </SubSection>

        <SubSection title="6.4 Business Transfers">
          <P>
            In the event of a merger, acquisition, or sale of assets, your data
            may be transferred to the acquiring entity. You will be notified in
            advance and will retain your right to request deletion.
          </P>
        </SubSection>
      </Section>

      {/* ── Data Security ── */}
      <Section title="7. Data Security">
        <P>
          We implement rigorous technical and organisational measures to protect
          your data against unauthorised access, loss, alteration, or
          disclosure.
        </P>
        <Ul
          items={[
            "All data transmitted between your device and our servers is encrypted using TLS 1.2 or higher",
            "Financial data and personal information stored on our servers is encrypted at rest using AES-256",
            "Access to your data is restricted to authorised KoboBack personnel on a strict need-to-know basis",
            "All internal access is logged and audited regularly",
            "Our infrastructure is hosted on reputable cloud providers with industry-standard compliance certifications",
            "We conduct periodic security reviews and vulnerability assessments",
          ]}
        />
        <P>
          While we take every reasonable precaution, no system is entirely
          immune from risk. In the unlikely event of a data breach that affects
          your rights or freedoms, we will notify you and the relevant
          regulatory authority within the timeframe required by applicable law.
        </P>
      </Section>

      {/* ── Data Retention ── */}
      <Section title="8. Data Retention">
        <P>
          We retain your data only for as long as is necessary for the purposes
          described in this policy, or as required by law.
        </P>
        <Ul
          items={[
            "Account data is retained for the duration of your account and for up to 12 months after account closure, unless a longer period is required by law",
            "Uploaded bank statement files are retained only for the period needed to complete the analysis and generate your report. After your report is delivered, raw PDF files are deleted from our processing environment",
            "Anonymised or aggregated data derived from statements may be retained indefinitely for research and model improvement purposes",
            "Communication records with our support team are retained for up to 36 months",
          ]}
        />
        <P>
          You may request deletion of your account and associated data at any
          time. See Section 9 for your rights.
        </P>
      </Section>

      {/* ── Your Rights ── */}
      <Section title="9. Your Data Rights">
        <P>
          Under the Nigeria Data Protection Act 2023, you have the following
          rights in respect of your personal data:
        </P>
        <SubSection title="Right of Access">
          <P>
            You may request a copy of the personal data we hold about you at any
            time.
          </P>
        </SubSection>
        <SubSection title="Right to Correction">
          <P>
            If any personal data we hold is inaccurate or incomplete, you may
            request that it be corrected.
          </P>
        </SubSection>
        <SubSection title="Right to Deletion">
          <P>
            You may request that we delete your personal data. We will honour
            this request unless retention is required by law or is necessary to
            complete a pending transaction or legal obligation.
          </P>
        </SubSection>
        <SubSection title="Right to Withdraw Consent">
          <P>
            Where processing is based on your consent, you may withdraw that
            consent at any time without penalty.
          </P>
        </SubSection>
        <SubSection title="Right to Object">
          <P>
            You may object to certain types of processing, including direct
            marketing communications.
          </P>
        </SubSection>
        <SubSection title="Right to Lodge a Complaint">
          <P>
            If you believe your data rights have been violated, you have the
            right to file a complaint with the Nigeria Data Protection
            Commission (NDPC) at <strong>ndpb.gov.ng</strong>.
          </P>
        </SubSection>
        <P>
          To exercise any of these rights, contact us at{" "}
          <a
            href="mailto:privacy@koboback.com"
            className="text-blue-600 hover:text-blue-700"
          >
            privacy@koboback.com
          </a>
          . We will respond within 30 days.
        </P>
      </Section>

      {/* ── Cookies ── */}
      <Section title="10. Cookies and Tracking Technologies">
        <P>
          We use cookies and similar tracking technologies to operate our
          platform and understand how it is used. Cookies are small text files
          stored in your browser.
        </P>
        <SubSection title="Strictly Necessary Cookies">
          <P>
            Required for the platform to function. These include session
            authentication tokens and security cookies. They cannot be disabled.
          </P>
        </SubSection>
        <SubSection title="Analytics Cookies">
          <P>
            Used to understand how visitors interact with our platform (pages
            visited, time spent, errors encountered). We use privacy-respecting
            analytics tools that anonymise IP addresses. These cookies are only
            set with your consent.
          </P>
        </SubSection>
        <P>
          You may manage or disable non-essential cookies through your browser
          settings at any time.
        </P>
      </Section>

      {/* ── International Transfers ── */}
      <Section title="11. International Data Transfers">
        <P>
          KoboBack primarily stores and processes data within Nigeria. Where we
          engage cloud service providers or vendors based outside Nigeria, we
          ensure that any transfer of personal data is subject to appropriate
          safeguards, including contractual clauses that provide equivalent data
          protection standards to those required under Nigerian law.
        </P>
      </Section>

      {/* ── Children ── */}
      <Section title="12. Children's Privacy">
        <P>
          Our platform is intended for users aged 18 and above. We do not
          knowingly collect personal data from minors. If we become aware that
          data has been collected from a minor without parental consent, we will
          delete that data promptly.
        </P>
      </Section>

      {/* ── Updates ── */}
      <Section title="13. Updates to This Policy">
        <P>
          We may update this Privacy Policy from time to time to reflect changes
          in our practices, technology, or legal requirements. When we make
          material changes, we will notify you by email or through a prominent
          notice on our platform before the changes take effect.
        </P>
        <P>
          Your continued use of KoboBack after the effective date of any update
          constitutes your acceptance of the revised policy.
        </P>
      </Section>

      {/* ── Contact ── */}
      <Section title="14. Contact Us">
        <P>
          If you have any questions about this Privacy Policy or how your data
          is handled, please contact our Data Protection Officer:
        </P>
        <Ul
          items={[
            "Email: privacy@koboback.com",
            "General enquiries: hello@koboback.com",
            "Website: koboback.com",
          ]}
        />
      </Section>
    </LegalLayout>
  );
}
