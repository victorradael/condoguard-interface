import Image from "next/image";

function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-alt px-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center">
          <div className="rounded-xl bg-sidebar px-8 py-5">
            <Image
              src="/logo.svg"
              alt="CondoGuard"
              width={180}
              height={72}
              priority
            />
          </div>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-border bg-surface p-8 shadow-lg">{children}</div>
      </div>
    </div>
  );
}

export default AuthLayout;
