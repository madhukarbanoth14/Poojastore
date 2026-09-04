"use client";

import { useState, type FormEvent } from "react";
import { clientFetch } from "@/lib/client";

export default function PriestApplyPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      await clientFetch("/priests/applications", {
        method: "POST",
        body: JSON.stringify({
          fullName: form.get("fullName"),
          countryCode: form.get("countryCode") || "91",
          phone: form.get("phone"),
          city: form.get("city"),
          state: form.get("state"),
          languages: String(form.get("languages") || "Telugu,Hindi")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          specializations: String(form.get("specializations") || "Satyanarayan")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          yearsExperience: Number(form.get("yearsExperience") || 5),
          bio: form.get("bio"),
          basePriceInr: Number(form.get("basePriceInr") || 1500),
          offersHome: true,
          offersOnline: true,
        }),
      });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit");
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-lg px-5 py-16 text-center">
        <h1 className="font-display text-4xl text-maroon">Application received</h1>
        <p className="mt-3 text-muted">Our team will review and add you to the priest directory.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-5 py-12">
      <p className="text-[11px] font-semibold tracking-[0.22em] text-maroon uppercase">Join the mandir</p>
      <h1 className="font-display mt-2 text-4xl text-maroon">Pujari onboarding</h1>
      <p className="mt-2 text-sm text-muted">Tell us about your seva. We will verify and list you.</p>
      <form className="card-temple mt-8 space-y-3 p-6" onSubmit={(e) => void onSubmit(e)}>
        <input name="fullName" required minLength={3} className="input-ps" placeholder="Full name" />
        <div className="grid grid-cols-[5rem_1fr] gap-2">
          <input name="countryCode" defaultValue="91" className="input-ps" />
          <input name="phone" required className="input-ps" placeholder="Mobile number" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input name="city" required className="input-ps" placeholder="City" />
          <input name="state" required className="input-ps" placeholder="State" />
        </div>
        <input name="languages" className="input-ps" placeholder="Languages (comma separated)" defaultValue="Telugu, Hindi" />
        <input name="specializations" className="input-ps" placeholder="Specializations" defaultValue="Satyanarayan, Griha Pravesh" />
        <input name="yearsExperience" type="number" min={0} className="input-ps" placeholder="Years of experience" defaultValue={8} />
        <input name="basePriceInr" type="number" min={300} className="input-ps" placeholder="Base fee (INR)" defaultValue={1500} />
        <textarea name="bio" required minLength={20} rows={4} className="input-ps" placeholder="Short bio (at least 20 characters)" />
        {error ? <p className="text-sm text-orange">{error}</p> : null}
        <button disabled={busy} className="w-full btn-orange">
          {busy ? "Sending…" : "Submit application"}
        </button>
      </form>
    </div>
  );
}
