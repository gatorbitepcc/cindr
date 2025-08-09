// src/pages/Settings.tsx
import { Header } from "@/components/Header";

export default function Settings() {
  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Keep your existing header so the app feels consistent */}
      <Header />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-card-foreground mb-4">
          Settings
        </h1>

        <div className="bg-card rounded-xl shadow-card p-6 space-y-6">
          <section>
            <h2 className="font-medium mb-2">Account</h2>
            <p className="text-sm text-muted-foreground">
              Manage your email, password, and profile details here (placeholder).
            </p>
          </section>

          <section>
            <h2 className="font-medium mb-2">Privacy</h2>
            <p className="text-sm text-muted-foreground">
              Control who can see your profile and groups (placeholder).
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
