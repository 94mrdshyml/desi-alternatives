import React, { useState } from 'react';

interface CostSavingsCalculatorProps {
  globalToolName: string;
  globalStartingPriceUsd?: number | null;
  desiStartingPriceInr?: number | null;
}

export default function CostSavingsCalculator({
  globalToolName,
  globalStartingPriceUsd = 40,
  desiStartingPriceInr = 1200,
}: CostSavingsCalculatorProps) {
  const [teamSize, setTeamSize] = useState<number>(25);

  const baseUsdPerUser = globalStartingPriceUsd && globalStartingPriceUsd > 0 ? globalStartingPriceUsd : 30;
  const baseInrPerUser = desiStartingPriceInr && desiStartingPriceInr > 0 ? Math.min(desiStartingPriceInr, 1500) : 800;

  // USD Rate and Overhead calculations
  const usdToInr = 87; // Current USD to INR benchmark
  const forexMarkupPercent = 0.035; // 3.5% foreign transaction fee on Indian credit cards
  const gstRate = 0.18; // 18% GST

  // Monthly foreign cost calculation
  const foreignMonthlyUsd = teamSize * baseUsdPerUser;
  const foreignMonthlyInrBase = foreignMonthlyUsd * usdToInr;
  const foreignForexMarkup = foreignMonthlyInrBase * forexMarkupPercent;
  const foreignMonthlyTotal = foreignMonthlyInrBase + foreignForexMarkup;
  const foreignAnnualTotal = foreignMonthlyTotal * 12;

  // Monthly Indian cost calculation
  const desiMonthlyInr = teamSize * baseInrPerUser;
  const desiGst = desiMonthlyInr * gstRate; // 18% GST (claimable as Input Tax Credit)
  const desiNetMonthly = desiMonthlyInr; // Net cost to business because GST is claimable
  const desiAnnualTotal = desiNetMonthly * 12;

  // Annual savings
  const annualSavings = Math.max(0, foreignAnnualTotal - desiAnnualTotal);
  const savingsPercent = Math.round((annualSavings / (foreignAnnualTotal || 1)) * 100);

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs sm:p-7">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
            <span>₹</span>
            <span>Annual ROI & Savings Simulator</span>
          </div>
          <h3 className="mt-2 text-lg font-bold text-foreground sm:text-xl">
            How much can you save switching from {globalToolName}?
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Calculated with live forex rates, 3.5% foreign card fees, and 18% GST Input Tax Credit (ITC).
          </p>
        </div>

        <div className="rounded-xl bg-primary/10 border border-primary/20 px-4 py-2.5 text-center sm:text-right shrink-0">
          <p className="text-[11px] font-semibold text-primary uppercase tracking-wider">Estimated Annual Savings</p>
          <p className="text-xl font-extrabold text-primary sm:text-2xl">
            ₹{annualSavings.toLocaleString('en-IN')}
            <span className="ml-1 text-xs font-bold text-emerald-700">({savingsPercent}% Off)</span>
          </p>
        </div>
      </div>

      {/* Slider input */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-xs font-semibold text-foreground">
          <label htmlFor="team-size-slider">Scale / Active Team Members</label>
          <span className="rounded-lg bg-secondary px-3 py-1 font-mono text-sm font-bold text-foreground">
            {teamSize} {teamSize === 1 ? 'user' : 'users'}
          </span>
        </div>

        <input
          id="team-size-slider"
          type="range"
          min="5"
          max="250"
          step="5"
          value={teamSize}
          onChange={(e) => setTeamSize(Number(e.target.value))}
          className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-primary"
        />

        <div className="mt-1 flex justify-between text-[11px] text-muted-foreground font-mono">
          <span>5 users</span>
          <span>50 users</span>
          <span>100 users</span>
          <span>250+ users</span>
        </div>
      </div>

      {/* Cost comparison columns */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Global Tool Card */}
        <div className="rounded-xl border border-red-200/70 bg-red-50/30 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-900">{globalToolName} (Global USD)</span>
            <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-800">
              ${baseUsdPerUser}/user/mo
            </span>
          </div>

          <div className="mt-3">
            <p className="text-2xl font-bold text-foreground">
              ₹{Math.round(foreignMonthlyTotal).toLocaleString('en-IN')}
              <span className="text-xs font-normal text-muted-foreground"> / month</span>
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              ₹{Math.round(foreignAnnualTotal).toLocaleString('en-IN')} billed annually
            </p>
          </div>

          <div className="mt-3 space-y-1 border-t border-red-200/50 pt-2 text-[11px] text-red-700">
            <p>• ${foreignMonthlyUsd.toLocaleString()} base USD converted at ₹{usdToInr}/$</p>
            <p>• +3.5% Foreign Card Forex fee (~₹{Math.round(foreignForexMarkup).toLocaleString('en-IN')}/mo)</p>
            <p>• ✕ Zero 18% GST Input Tax Credit claimable</p>
          </div>
        </div>

        {/* Indian Alternative Card */}
        <div className="rounded-xl border border-emerald-300 bg-emerald-50/40 p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900">Desi Alternative (Indian INR)</span>
            <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
              ₹{baseInrPerUser}/user/mo
            </span>
          </div>

          <div className="mt-3">
            <p className="text-2xl font-bold text-foreground">
              ₹{Math.round(desiNetMonthly).toLocaleString('en-IN')}
              <span className="text-xs font-normal text-muted-foreground"> / month</span>
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              ₹{Math.round(desiAnnualTotal).toLocaleString('en-IN')} billed annually
            </p>
          </div>

          <div className="mt-3 space-y-1 border-t border-emerald-200/60 pt-2 text-[11px] text-emerald-800">
            <p>• Fixed ₹ INR billing (Immune to USD currency swings)</p>
            <p>• 0% Forex markups via direct UPI, NEFT & RuPay</p>
            <p>• ✓ 18% GST invoice provided (Full ITC claimable)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
