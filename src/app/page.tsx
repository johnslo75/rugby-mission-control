import { redirect } from "next/navigation";

// Root "/" is handled by middleware which rewrites to /site or /hub based on subdomain.
// This fallback is only hit in local dev when no subdomain routing occurs.
export default function RootPage() {
  redirect("/hub");
}
