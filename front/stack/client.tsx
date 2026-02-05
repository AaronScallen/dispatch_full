import { StackClientApp } from "@stackframe/stack";

// Validate environment variables
if (!process.env.NEXT_PUBLIC_STACK_PROJECT_ID) {
  throw new Error(
    "Missing NEXT_PUBLIC_STACK_PROJECT_ID environment variable. " +
      "Please add it to your .env.local file or deployment environment variables.",
  );
}

if (!process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY) {
  throw new Error(
    "Missing NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY environment variable. " +
      "Please add it to your .env.local file or deployment environment variables.",
  );
}

export const stackClientApp = new StackClientApp({
  tokenStore: "nextjs-cookie",
  projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
  publishableClientKey: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
});
