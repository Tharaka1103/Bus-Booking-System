'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  Bus,
  Users,
  Route,
  Calendar,
  Settings,
  LogOut,
  X,
  ChevronDown,
  ChevronRight,
  Shield,
  BookOpen,
  BarChart3,
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
  children?: MenuItem[];
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const { user, logout, hasPermission } = useAuth();
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const menuItems: MenuItem[] = [
    {
      name: 'Dashboard',
      href: `/dashboard/${user?.role?.replace('_', '-')}`,
      icon: BarChart3
    },
    {
      name: 'User Management',
      href: '/dashboard/users',
      icon: Users,
      permission: 'users:read',
      
    },
    {
      name: 'Route Management',
      href: '/dashboard/routes',
      icon: Route,
      permission: 'routes:read',
      
    },
    {
      name: 'Bus Management',
      href: '/dashboard/buses',
      icon: Bus,
      permission: 'buses:read',
      
    },
    {
      name: 'Booking Management',
      href: '/dashboard/bookings',
      icon: Calendar,
      permission: 'bookings:read',
      
    }
  ];

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    if (item.permission && !hasPermission(item.permission)) {
      return null;
    }

    const isActive = pathname === item.href;
    const isExpanded = expandedItems.includes(item.name);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.name}>
        <div
          className={cn(
            'flex items-center justify-between px-4 py-2 rounded-lg transition-colors cursor-pointer',
            level > 0 && 'ml-4',
            isActive 
              ? 'bg-primary text-white' 
              : 'text-gray-700 hover:bg-gray-100'
          )}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.name);
            }
          }}
        >
          <Link 
            href={hasChildren ? '#' : item.href}
            className="flex items-center flex-1"
            onClick={(e) => {
              if (hasChildren) {
                e.preventDefault();
              } else {
                setIsOpen(false);
              }
            }}
          >
            <item.icon className="w-5 h-5 mr-3" />
            <span className="font-medium">{item.name}</span>
          </Link>
          {hasChildren && (
            <div className="ml-2">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </div>
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children?.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
            <div className="flex items-center space-x-3">
              <div>
                <h1 className="text-lg font-bold text-gray-800">Wijitha Travels</h1>
                <p className="text-sm text-gray-500 capitalize">{user?.role?.replace('_', ' ')} Portal</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="lg:hidden"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* User Info */}
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map(item => renderMenuItem(item))}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-gray-200 space-y-2 bg-white">
            <Link href="/dashboard/settings">
              <div
                className={cn(
                  'flex items-center px-4 py-2 rounded-lg transition-colors cursor-pointer',
                  pathname === '/dashboard/settings'
                    ? 'bg-primary text-white mb-2'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
                onClick={() => setIsOpen(false)}
              >
                <Settings className="w-5 h-5 mr-3" />
                <span className="font-medium">Settings</span>
              </div>
            </Link>
            
            <Button
              variant="ghost"
              onClick={logout}
              className="w-full bg-red-500 text-white justify-start  hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}