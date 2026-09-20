import React from 'react';
import { FinancialMetrics } from '../../data/types/insight';
import { DollarSign, ArrowUpRight, ArrowDownRight, ShieldAlert, CreditCard } from 'lucide-react';

interface FinancialInsightSectionProps {
  financial: FinancialMetrics;
}

export const FinancialInsightSection: React.FC<FinancialInsightSectionProps> = ({ financial }) => {
  const topCategories = Object.entries(financial.categoryBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const topModes = Object.entries(financial.modeBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <div className="bg-[#0c0d15] border border-gray-800 rounded-2xl p-6 space-y-6 shadow-xl font-mono">
      <div className="flex items-center space-x-2 border-b border-gray-800 pb-3">
        <DollarSign className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-bold text-white font-sans">FINANCIAL & RECEIPT METRICS</h3>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-black/50 p-4 rounded-xl border border-gray-800/80">
          <div className="text-[10px] text-gray-400 uppercase flex items-center justify-between">
            <span>TOTAL EXPENSE</span>
            <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div className="text-xl font-bold text-red-400 mt-1">₹{financial.totalExpense.toLocaleString()}</div>
          <div className="text-[10px] text-gray-500">{financial.transactionCount.toLocaleString()} Total Transactions</div>
        </div>

        <div className="bg-black/50 p-4 rounded-xl border border-gray-800/80">
          <div className="text-[10px] text-gray-400 uppercase flex items-center justify-between">
            <span>TOTAL INCOME</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 mt-1">₹{financial.totalIncome.toLocaleString()}</div>
          <div className="text-[10px] text-gray-500">Household Income Logs</div>
        </div>

        <div className="bg-black/50 p-4 rounded-xl border border-gray-800/80">
          <div className="text-[10px] text-gray-400 uppercase">NET CASH FLOW</div>
          <div className={`text-xl font-bold mt-1 ${financial.netCashFlow >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            ₹{financial.netCashFlow.toLocaleString()}
          </div>
          <div className="text-[10px] text-gray-500">Income minus Expenses</div>
        </div>

        <div className="bg-black/50 p-4 rounded-xl border border-gray-800/80">
          <div className="text-[10px] text-gray-400 uppercase flex items-center justify-between">
            <span>RISK FLAGS</span>
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-400 mt-1">{financial.flaggedFraudCount} Flags</div>
          <div className="text-[10px] text-gray-500">Multi-Facet Anomaly Flags</div>
        </div>
      </div>

      {/* Categories & Payment Modes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Top Spending Categories */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Top Spending Categories</h4>
          <div className="space-y-2">
            {topCategories.map(([cat, amount], i) => (
              <div key={i} className="flex items-center justify-between bg-gray-900/60 p-2.5 rounded-lg border border-gray-800/60 text-xs">
                <span className="truncate pr-2 text-gray-200">{cat}</span>
                <span className="text-amber-400 font-bold shrink-0">₹{amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Channels */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center space-x-1">
            <CreditCard className="w-3.5 h-3.5 text-blue-400" />
            <span>Payment Instruments</span>
          </h4>
          <div className="space-y-2">
            {topModes.map(([mode, amount], i) => (
              <div key={i} className="flex items-center justify-between bg-gray-900/60 p-2.5 rounded-lg border border-gray-800/60 text-xs">
                <span className="truncate pr-2 text-gray-200">{mode}</span>
                <span className="text-blue-400 font-bold shrink-0">₹{amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
