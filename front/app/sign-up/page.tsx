import { SignUp } from "@stackframe/stack";
import Image from "next/image";
export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 p-4 max-w-6xl w-full">
        <div className="shrink-0 w-full max-w-xs lg:max-w-md">
          <Image
            src="/pdpatch.png"
            alt="PD Patch"
            width={200}
            height={150}
            className="w-full h-auto"
            priority
          />
        </div>
        <div className="w-full max-w-md">
          <SignUp fullPage />
        </div>
      </div>
    </div>
  );
}
