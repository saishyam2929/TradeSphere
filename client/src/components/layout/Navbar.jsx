import { Menu, Sun, Moon, Bell } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { formatCurrency } from '../../utils/format';

export default function Navbar({ onMenuClick }) {
  const user = useAuthStore((s) => s.user);
  const { theme, toggleTheme } = useThemeStore();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 px-4 backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/80 lg:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden dark:text-gray-400 dark:hover:bg-slate-800"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden sm:block">
          <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back,</p>
          <p className="font-semibold text-gray-900 dark:text-white">{user?.username}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden rounded-lg bg-emerald-50 px-4 py-2 dark:bg-emerald-900/20 md:block">
          <p className="text-xs text-emerald-600 dark:text-emerald-400">Wallet Balance</p>
          <p className="font-bold text-emerald-700 dark:text-emerald-300">
            {formatCurrency(user?.walletBalance)}
          </p>
        </div>

        <button className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800">
          <Bell className="h-5 w-5" />
        </button>

        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
          {user?.username?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
