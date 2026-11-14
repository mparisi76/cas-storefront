import { redirect } from "next/navigation";

// Sales were merged into the dashboard's Orders tab.
export default function SalesPage() {
  redirect("/dashboard?tab=orders");
}
