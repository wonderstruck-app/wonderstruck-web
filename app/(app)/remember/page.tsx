import type { Metadata } from "next";
import { RememberView } from "./remember-view";

export const metadata: Metadata = { title: "Recall" };

export default function RememberPage() {
  return <RememberView />;
}
