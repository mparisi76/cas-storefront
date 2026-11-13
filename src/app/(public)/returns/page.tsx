import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, CONTACT_EMAIL } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Shipping & Returns",
  description: "How shipping, pickup, cancellations, and returns work for salvage bought on Catskill Architectural Salvage.",
  alternates: { canonical: "/returns" },
};

export default function ReturnsPage() {
  return (
    <LegalPage
      eyebrow="Policies"
      title="Shipping & Returns"
      intro={
        <>
          Salvage is heavy, fragile, and one of a kind, so we handle shipping personally and keep returns
          simple and fair.
        </>
      }
    >
      <section>
        <h2>Shipping</h2>
        <ul>
          <li>
            After you buy, the seller (us or the Vendor) packs your item and ships it to the address you gave
            at checkout. We&rsquo;ll be in touch if anything needs confirming.
          </li>
          <li>
            Most items ship within 5 business days. Large or delicate pieces may take longer to crate safely.
          </li>
          <li>
            Use &ldquo;Calculate Shipping&rdquo; on any listing for an estimate. Items over 100 lbs ship by
            freight and are quoted individually.
          </li>
          <li>We currently ship within the United States only.</li>
          <li>
            Local pickup in the Hudson Valley may be possible. <Link href="/contact">Ask us</Link> before
            buying.
          </li>
        </ul>
      </section>

      <section>
        <h2>Cancellations</h2>
        <p>
          Changed your mind? Contact us before your item ships and we&rsquo;ll cancel the order and refund you
          in full.
        </p>
      </section>

      <section>
        <h2>Returns</h2>
        <p>
          Because every piece is unique and sold as-is, <strong>sales are final once an item ships</strong>,
          except in these cases:
        </p>
        <ul>
          <li>
            <strong>Not as described.</strong> If the item is materially different from its listing (wrong
            dimensions, undisclosed major damage), you can return it for a full refund, including original
            shipping. We&rsquo;ll cover return shipping too.
          </li>
          <li>
            <strong>Damaged in transit.</strong> Inspect your item on arrival. If it was damaged in shipping,
            keep all packaging and contact us within <strong>48 hours</strong> of delivery with photos of the
            item and the box. We&rsquo;ll file the carrier claim and refund or replace it.
          </li>
        </ul>
        <p>
          Normal signs of age (wear, patina, chipped paint, minor cracks consistent with the photos)
          aren&rsquo;t grounds for a return. When in doubt, ask before you buy. We&rsquo;re happy to send more
          photos or measurements.
        </p>
      </section>

      <section>
        <h2>How to start a return or claim</h2>
        <p>
          Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> or use our{" "}
          <Link href="/contact">contact form</Link> with your name, the item (its CAS number, e.g. CAS-0123),
          and photos. Approved refunds go back to your original payment method within 5–10 business days of
          our receiving the item (or approving a damage claim).
        </p>
      </section>

      <section>
        <h2>Items sold on other sites</h2>
        <p>
          Listings marked &ldquo;View Original Listing&rdquo; are sold on the Vendor&rsquo;s own site or
          another marketplace, and that seller&rsquo;s shipping and return policies apply.
        </p>
      </section>
    </LegalPage>
  );
}
