export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">SecureBank</h1>
          <p className="text-brand-100 mt-1 text-sm">Cloud-Native Banking Platform</p>
        </div>
        {children}
      </div>
    </div>
  );
}
