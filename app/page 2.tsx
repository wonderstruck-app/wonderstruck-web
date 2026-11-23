import { redirect } from "next/navigation";

// The public landing page is not designed yet; send visitors to the learner dashboard mock.
export default function Home() {
  redirect("/dashboard");
}
