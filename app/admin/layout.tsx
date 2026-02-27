"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, Calendar, DollarSign, UserCog,
  Heart, LogOut, Menu, X, Bell, ChevronDown,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

const navItems = [
  { href: '/admin/dashboard',    label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/admin/pacientes',    label: 'Pacientes',     icon: Users },
  { href: '/admin/agenda',       label: 'Agenda',        icon: Calendar },
  { href: '/admin/financeiro',   label: 'Financeiro',    icon: DollarSign },
  { href: '/admin/funcionarios', label: 'Funcionários',  icon: UserCog },
];

function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router   = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/admin/login');
  }

  return (
    <aside className="flex flex-col h-full w-64 bg-white border-r border-border">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
          <div>
            <span className="font-semibold text-brand-700 text-sm block">Saúde Certa</span>
            <span className="text-xs text-muted-foreground">Painel Administrativo</span>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn('sidebar-link', active && 'active')}
            >
              <item.icon className="w-4.5 h-4.5 shrink-0" style={{ width: 18, height: 18 }} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <Link href="/" className="sidebar-link text-xs mb-1" target="_blank">
          ← Ver site público
        </Link>
        <button onClick={handleSignOut} className="sidebar-link w-full text-destructive hover:bg-red-50 hover:text-destructive">
          <LogOut className="w-4.5 h-4.5 shrink-0" style={{ width: 18, height: 18 }} />
          Sair
        </button>
      </div>
    </aside>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <div className="hidden lg:flex flex-col shrink-0">
        <Sidebar />
      </div>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="flex flex-col shrink-0">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-border px-4 lg:px-6 h-14 flex items-center justify-between shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-muted"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-muted">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-semibold text-xs">
                MA
              </div>
              <span className="hidden sm:block font-medium text-sm">Marcia</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
