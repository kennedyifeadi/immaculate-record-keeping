import { getPastMonths } from '@/actions/history-actions';
import Link from 'next/link';
import { Calendar } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function MonthlyIndexPage() {
    // 1. Fetch past months with totals
    const pastMonths = await getPastMonths();

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Monthly History</h1>
                <p className="text-slate-500 mt-2">View and edit records from previous months.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pastMonths.length === 0 ? (
                    <div className="col-span-full p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        <p className="text-slate-500">No past history available yet.</p>
                    </div>
                ) : (
                    pastMonths.map((m) => {
                        return (
                            <div key={`${m.year}-${m.month}`} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-2 text-blue-600">
                                    <Calendar size={24} />
                                    <span className="font-semibold text-lg">{m.monthName} {m.year}</span>
                                </div>

                                <div className="mb-4">
                                    <p className="text-sm text-slate-500">Total Revenue</p>
                                    <p className="text-xl font-bold text-slate-800">
                                        ₦{m.totalSales.toLocaleString()}
                                    </p>
                                </div>

                                <Link
                                    href={`/monthly/edit/${m.year}/${m.month}`}
                                    className="block w-full text-center bg-blue-600 border border-transparent text-white font-medium py-2 rounded-lg hover:bg-blue-700 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                                >
                                    Edit Month
                                </Link>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
