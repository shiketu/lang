import { SignIn } from "@clerk/nextjs";

// Self-hosted sign-in, so an expired session lands back on our own domain
// instead of bouncing through Clerk's hosted portal. Rendered inside the root
// layout only (no Nav/Header — those live in the [ws] layout).
export default function SignInPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
      <SignIn />
    </div>
  );
}
