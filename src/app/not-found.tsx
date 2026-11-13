import type { Metadata } from "next";
import { StatusPage } from "@/components/layout/StatusPage";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <StatusPage
      code="404"
      title="Nothing here"
      message="This page doesn't exist, or the piece you're looking for has moved on to a new home. There's plenty more in the catalog."
    />
  );
}
