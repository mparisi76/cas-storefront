import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, CONTACT_EMAIL } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What information Catskill Architectural Salvage collects, why, and who we share it with.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      intro={
        <>
          We collect only what we need to run the shop, process orders, and answer your questions. We
          don&rsquo;t sell your personal information, and the Site doesn&rsquo;t use advertising or
          analytics trackers.
        </>
      }
    >
      <section>
        <h2>What we collect</h2>
        <ul>
          <li>
            <strong>When you buy:</strong> your name, email, phone number, and shipping address, collected at
            checkout. Card details go directly to Stripe; we never see or store your full card number.
          </li>
          <li>
            <strong>When you contact us:</strong> your name, email, and message.
          </li>
          <li>
            <strong>When you sign up as a Vendor:</strong> your name, email, shop name, inventory type, and
            optional profile details (phone, city, state), plus the listings and photos you upload.
          </li>
          <li>
            <strong>Technical data:</strong> basic server logs (such as IP address and pages requested) used for
            security and to prevent abuse, for example rate-limiting our contact form.
          </li>
        </ul>
      </section>

      <section>
        <h2>How we use it</h2>
        <ul>
          <li>To process and deliver your order, including sending your shipping details to the Vendor who sold the item so they can ship it.</li>
          <li>To send order confirmations, replies to your inquiries, and Vendor account emails.</li>
          <li>To run Vendor accounts and display Vendors&rsquo; shop names and locations on the Site.</li>
          <li>To keep the Site secure and prevent fraud.</li>
        </ul>
        <p>We don&rsquo;t send marketing email unless you ask us to.</p>
      </section>

      <section>
        <h2>Who we share it with</h2>
        <p>We share information only with services that help us run the Site, and only as needed:</p>
        <ul>
          <li><strong>Stripe</strong>: payment processing.</li>
          <li><strong>Resend</strong>: sending email.</li>
          <li><strong>Shippo</strong>: shipping quotes (your ZIP code only).</li>
          <li><strong>Our hosting and database providers</strong>: storing listings and account data.</li>
          <li><strong>The Vendor you buy from</strong>: your name, contact details, and shipping address, so they can fulfill your order.</li>
        </ul>
        <p>We may also disclose information if required by law or to protect the Site and its users.</p>
      </section>

      <section>
        <h2>Cookies and local storage</h2>
        <ul>
          <li>
            <strong>Login cookies</strong> keep Vendors and admins signed in. They&rsquo;re only set when you
            log in.
          </li>
          <li>
            <strong>Browser storage</strong> remembers items you&rsquo;ve recently viewed and your text-size
            preference. It stays on your device and you can clear it anytime.
          </li>
          <li>Stripe sets its own cookies on its checkout page for fraud prevention.</li>
        </ul>
      </section>

      <section>
        <h2>How long we keep it</h2>
        <p>
          Order records are kept as long as needed for accounting, tax, and dispute purposes. Contact messages
          and Vendor account data are kept while they&rsquo;re useful to you or us, and deleted on request
          where the law allows.
        </p>
      </section>

      <section>
        <h2>Your choices</h2>
        <p>
          You can ask us to access, correct, or delete your personal information by emailing{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Vendors can update their profile anytime in
          the Vendor Portal.
        </p>
      </section>

      <section>
        <h2>Children</h2>
        <p>The Site isn&rsquo;t intended for children under 13, and we don&rsquo;t knowingly collect their information.</p>
      </section>

      <section>
        <h2>Changes and contact</h2>
        <p>
          We&rsquo;ll post any changes here and update the date above. Questions:{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> or our{" "}
          <Link href="/contact">contact form</Link>.
        </p>
      </section>
    </LegalPage>
  );
}
