import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, CONTACT_EMAIL } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that apply when you browse, buy from, or sell on Catskill Architectural Salvage.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of Service"
      intro={
        <>
          These terms apply when you use catskillas.com (the &ldquo;Site&rdquo;), operated by Catskill
          Architectural Salvage (&ldquo;we,&rdquo; &ldquo;us&rdquo;). By browsing, buying, or listing items
          on the Site, you agree to them.
        </>
      }
    >
      <section>
        <h2>1. What the Site is</h2>
        <p>
          The Site is a catalog of architectural salvage, antiques, and reclaimed materials. Items come from
          two kinds of sellers: our own inventory, and independent dealers (&ldquo;Vendors&rdquo;) who list
          their pieces with us.
        </p>
        <p>
          Some listings link to a Vendor&rsquo;s own website or another marketplace (&ldquo;View Original
          Listing&rdquo;). Those purchases happen entirely on the other site, under its terms, and we are not
          a party to them.
        </p>
      </section>

      <section>
        <h2>2. Buying on the Site</h2>
        <ul>
          <li>
            <strong>Payment.</strong> Purchases made through our checkout are processed by Stripe. We never see
            or store your full card number. Your order is confirmed once payment succeeds and you receive a
            confirmation email.
          </li>
          <li>
            <strong>Prices.</strong> Prices are in US dollars. Shipping is arranged after purchase unless the
            checkout shows a shipping charge; see{" "}
            <Link href="/returns">Shipping &amp; Returns</Link>.
          </li>
          <li>
            <strong>One-of-a-kind items.</strong> Most items are unique. If an item sells to someone else
            before your payment completes, or a listing turns out to be wrong, we&rsquo;ll cancel the order and
            refund you in full.
          </li>
          <li>
            <strong>Condition.</strong> Salvage is old and used. Items are sold <em>as-is</em>, with the
            wear, patina, and imperfections that come with age. We and our Vendors describe and photograph
            items honestly, but colors and dimensions may vary slightly. Please ask before buying if anything
            matters to you.
          </li>
          <li>
            <strong>Suitability and safety.</strong> Salvaged materials may not meet current building codes and
            may contain lead paint or other legacy materials. You are responsible for evaluating an item for
            your intended use and for any installation or restoration.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. Selling as a Vendor</h2>
        <ul>
          <li>Vendor accounts require approval. We may decline, suspend, or remove any account or listing.</li>
          <li>
            You must own, or have the right to sell, everything you list, and describe it accurately, including
            known defects and hazardous materials.
          </li>
          <li>
            You&rsquo;re responsible for packing and shipping sold items promptly, and for any taxes on your
            sales.
          </li>
          <li>
            By uploading photos and descriptions, you allow us to display them on the Site and in promotion of
            the Site.
          </li>
          <li>Keep your login secure. You&rsquo;re responsible for activity on your account.</li>
        </ul>
      </section>

      <section>
        <h2>4. Acceptable use</h2>
        <p>
          Don&rsquo;t misuse the Site: no scraping that burdens the service, no attempts to access accounts or
          data that aren&rsquo;t yours, no fraudulent purchases or listings, and no spam through our contact
          forms.
        </p>
      </section>

      <section>
        <h2>5. Content and trademarks</h2>
        <p>
          The Site&rsquo;s design, text, and our own photographs belong to us. Vendor photos and descriptions
          belong to their Vendors. Don&rsquo;t reuse them without permission.
        </p>
      </section>

      <section>
        <h2>6. Disclaimers and limits</h2>
        <p>
          The Site is provided &ldquo;as is.&rdquo; To the extent the law allows, we disclaim implied
          warranties, including merchantability and fitness for a particular purpose. Our total liability for
          any claim related to a purchase is limited to the amount you paid for that item. We aren&rsquo;t
          liable for indirect or consequential losses. Nothing here limits rights you have under consumer
          protection law that can&rsquo;t be waived.
        </p>
      </section>

      <section>
        <h2>7. Changes and governing law</h2>
        <p>
          We may update these terms; the date at the top shows the latest version. These terms are governed by
          the laws of the State of New York, and any dispute will be handled in the state or federal courts
          located in New York.
        </p>
      </section>

      <section>
        <h2>8. Contact</h2>
        <p>
          Questions about these terms: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> or our{" "}
          <Link href="/contact">contact form</Link>.
        </p>
      </section>
    </LegalPage>
  );
}
