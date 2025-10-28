'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import DSwipeLogo from '@/components/DSwipeLogo';
import {
  getDashboardNavLinks,
  getDashboardNavClasses,
  getDashboardNavGroupMeta,
  groupDashboardNavLinks,
  isDashboardLinkActive,
} from '@/components/dashboard/navLinks';

interface DashboardHeaderProps {
  user: any;
  pointBalance: number;
  pageTitle?: string;
  pageSubtitle?: string;
}

export default function DashboardHeader({
  user,
  pointBalance,
  pageTitle = 'ダッシュボード',
  pageSubtitle,
}: DashboardHeaderProps) {
  const pathname = usePathname();
  const isAdmin = user?.user_type === 'admin';
  const navLinks = getDashboardNavLinks({ isAdmin, userType: user?.user_type });
  const navGroups = groupDashboardNavLinks(navLinks);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const subtitle = pageSubtitle || `ようこそ、${user?.username}さん`;

  return (
    <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg shadow-sm">
      {/* Top Navigation Bar */}
      <div className="border-b border-slate-200 px-3 sm:px-6 h-16 flex-shrink-0">
        <div className="flex items-center justify-between h-full">
          {/* Left: Logo (Mobile) + Title (Desktop) */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Logo */}
            <Link href="/dashboard" className="sm:hidden">
              <DSwipeLogo size="small" showFullName={true} textColor="text-slate-900" />
            </Link>
            
            {/* Desktop Title */}
            <div className="hidden sm:block min-w-0">
              <h1 className="text-lg sm:text-xl font-semibold text-slate-900 mb-0 truncate">{pageTitle}</h1>
              <p className="text-slate-500 text-xs">{subtitle}</p>
            </div>
          </div>
          
          {/* Right: Actions & User Info */}
          <div className="hidden sm:flex items-center space-x-4">
            {/* Point Balance */}
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-100 rounded border border-slate-200">
              <span className="text-slate-500 text-xs font-medium">ポイント残高</span>
              <span className="text-slate-900 text-sm font-semibold">{pointBalance.toLocaleString()} P</span>
            </div>
            
            {/* User Avatar */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center text-white text-sm">
                {user?.profile_image_url ? (
                  <img src={user.profile_image_url} alt="ユーザーアイコン" className="w-full h-full object-cover" />
                ) : (
                  user?.username?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
            </div>
          </div>

          {/* Mobile User Info */}
          <div className="sm:hidden flex items-center space-x-2">
            <div className="text-right">
              <div className="text-slate-900 text-xs font-semibold">{pointBalance.toLocaleString()}P</div>
            </div>
            <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center text-white text-xs flex-shrink-0">
              {user?.profile_image_url ? (
                <img src={user.profile_image_url} alt="ユーザーアイコン" className="w-full h-full object-cover" />
              ) : (
                user?.username?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Bar */}
      <div className="sm:hidden border-b border-slate-200/50">
        {/* メニューボタン */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50/50 transition-colors"
        >
          <span className="text-sm font-semibold text-slate-700">メニュー</span>
          {isMenuOpen ? (
            <ChevronDownIcon className="h-5 w-5 text-slate-500" />
          ) : (
            <ChevronRightIcon className="h-5 w-5 text-slate-500" />
          )}
        </button>

        {/* メニュー内容（開いている時だけ表示） */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <nav className="flex flex-col gap-2 px-3 pb-3">
            {navGroups.map((group) => {
              const meta = getDashboardNavGroupMeta(group.key);
              
              return (
                <div key={group.key} className="flex flex-col gap-1">
                  {/* グループラベル */}
                  <span className={`text-[10px] font-semibold uppercase tracking-[0.2em] px-2 pt-2 ${meta.headingClass}`}>
                    {meta.label}
                  </span>
                  
                  {/* メニューアイテム */}
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {group.items.map((link) => {
                      const isActive = isDashboardLinkActive(pathname, link.href);
                      const linkProps = link.external
                        ? { href: link.href, target: '_blank' as const, rel: 'noopener noreferrer' }
                        : { href: link.href };
                      const styles = getDashboardNavClasses(link, { variant: 'mobile', active: isActive });

                      return (
                        <Link
                          key={link.href}
                          {...linkProps}
                          onClick={() => setIsMenuOpen(false)}
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap ${styles.container}`}
                        >
                          <span className={`inline-flex h-4 w-4 items-center justify-center ${styles.icon}`}>
                            {link.icon}
                          </span>
                          <span>{link.label}</span>
                          {link.badge ? (
                            <span className={`ml-1 rounded px-1.5 py-0.5 text-[9px] font-semibold ${styles.badge}`}>
                              {link.badge}
                            </span>
                          ) : null}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
