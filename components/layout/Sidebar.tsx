'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Table2, BarChart3, Users, Calendar } from 'lucide-react';
import { clsx } from 'clsx';

const menuItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Logger', href: '/logger', icon: Table2 },
  { name: 'Monthly', href: '/monthly', icon: Calendar },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Vendors', href: '/vendors', icon: Users }, // List view of vendors
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen fixed left-0 top-0 border-r border-slate-800">
      {/* Logo Area */}
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white tracking-wide">
          IMACULATE <span className="text-blue-500">LOGS</span>
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                  : "hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-800 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
            F
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">Franca</span>
            <span className="text-xs text-slate-400">Admin</span>
          </div>
        </div>
      </div>
    </aside>
  );
}