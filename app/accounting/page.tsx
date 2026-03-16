import { getAccountingByDate, getMonthlyAccounting } from '@/actions/accounting-actions';
import AccountingClient from './AccountingClient';

export default async function AccountingPage() {
  const today = new Date();
  
  // Format as YYYY-MM-DD robustly
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;

  const dailyLog = await getAccountingByDate(dateStr);
  const monthlyLogs = await getMonthlyAccounting(today.getMonth(), today.getFullYear());

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Daily Accounting</h1>
        <p className="text-slate-500 text-sm">Log daily product sales and track profitability.</p>
      </div>
      
      <AccountingClient 
        initialDailyLog={dailyLog} 
        initialMonthlyLogs={monthlyLogs}
        currentDateStr={dateStr}
      />
    </div>
  );
}
