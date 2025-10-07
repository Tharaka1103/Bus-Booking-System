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
  Menu,
  BarChart3,
  MessageSquare,
  Bell,
  Search,
  ChevronLeft,
  Clock,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  badge?: string;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const { user, logout, hasPermission } = useAuth();
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const menuItems: MenuItem[] = [
    {
      name: 'Dashboard',
      href: `/dashboard/${user?.role?.replace('_', '-')}`,
      icon: BarChart3,
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
    },
    {
      name: 'Feedback Management',
      href: '/dashboard/feedback',
      icon: MessageSquare,
      permission: 'feedbacks:read',
      badge: 'New'
    },
  ];

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev =>
      prev.includes(itemName)
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderMenuItem = (item: MenuItem, level = 0) => {
    if (item.permission && !hasPermission(item.permission)) {
      return null;
    }

    const isActive = pathname === item.href;
    const isExpanded = expandedItems.includes(item.name);
    const hasChildren = item.children && item.children.length > 0;

    if (hasChildren) {
      return (
        <Collapsible
          key={item.name}
          open={isExpanded}
          onOpenChange={() => toggleExpanded(item.name)}
          className={cn(level > 0 && !isCollapsed && 'ml-4')}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-between hover:bg-primary/10 transition-all duration-200 group',
                isActive && 'bg-gradient-to-r from-primary to-primary/80 text-white hover:from-primary/90 hover:to-primary/70'
              )}
            >
              <div className="flex items-center">
                <item.icon className={cn(
                  "w-5 h-5 mr-3 transition-transform group-hover:scale-110",
                  isActive && "text-white"
                )} />
                {!isCollapsed && <span className="font-medium">{item.name}</span>}
              </div>
              {!isCollapsed && (
                isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-1 space-y-1">
            {item.children?.map(child => renderMenuItem(child, level + 1))}
          </CollapsibleContent>
        </Collapsible>
      );
    }

    const MenuButton = (
      <Button
        variant="ghost"
        asChild
        className={cn(
          'w-full justify-start hover:bg-primary/10 transition-all duration-200 group relative',
          level > 0 && !isCollapsed && 'ml-4',
          isActive && 'bg-gradient-to-r from-primary to-primary/80 text-white hover:from-primary/90 hover:to-primary/70'
        )}
      >
        <Link href={item.href} onClick={() => setIsOpen(false)}>
          <item.icon className={cn(
            "w-5 h-5 mr-3 transition-transform group-hover:scale-110",
            isActive && "text-white"
          )} />
          {!isCollapsed && (
            <div className="flex items-center justify-between flex-1">
              <span className="font-medium">{item.name}</span>
              {item.badge && (
                <Badge variant="secondary" className="ml-auto text-xs bg-primary/10 text-primary border-0">
                  {item.badge}
                </Badge>
              )}
            </div>
          )}
          {isActive && !isCollapsed && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full" />
          )}
        </Link>
      </Button>
    );

    if (isCollapsed) {
      return (
        <TooltipProvider key={item.name}>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              {MenuButton}
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              <p>{item.name}</p>
              {item.badge && (
                <Badge variant="secondary" className="mt-1 text-xs">
                  {item.badge}
                </Badge>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return <div key={item.name}>{MenuButton}</div>;
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 bg-white shadow-2xl border-r border-gray-200/60 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          isCollapsed ? 'w-20' : 'w-72 sm:w-80 lg:w-72'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header with gradient */}
          <div className="relative overflow-hidden">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-sky-600" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            
            <div className="relative p-6 space-y-4">
              {/* Logo and collapse button */}
              <div className="flex items-center justify-between">
                {!isCollapsed && (
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <Bus className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-lg font-bold text-white">
                        Wijitha Travels
                      </h1>
                      <p className="text-xs text-white/80 capitalize">
                        {user?.role?.replace('_', ' ')} Portal
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Mobile close / Desktop collapse */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      setIsOpen(false);
                    } else {
                      setIsCollapsed(!isCollapsed);
                    }
                  }}
                  className="text-white hover:bg-white/20 flex-shrink-0"
                >
                  {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                </Button>
              </div>

              {/* User Profile */}
              {!isCollapsed && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all cursor-pointer border border-white/20">
                      <Avatar className="w-11 h-11 bg-white ring-2 ring-white/30">
                        <AvatarFallback className="bg-gradient-to-br from-sky-400 to-primary text-white font-semibold">
                          {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-white/70 truncate flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {getCurrentTime()}
                        </p>
                      </div>
                      <ChevronDown className="w-4 h-4 text-white/70 flex-shrink-0" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="start">
                    <DropdownMenuLabel>
                      <div>
                        <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-gray-500 font-normal">{user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/settings" className="cursor-pointer">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600 cursor-pointer">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {isCollapsed && (
                <TooltipProvider>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Avatar className="w-10 h-10 bg-white ring-2 ring-white/30 cursor-pointer mx-auto">
                        <AvatarFallback className="bg-gradient-to-br from-sky-400 to-primary text-white font-semibold">
                          {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>

          {/* Greeting Card */}
          {!isCollapsed && (
            <div className="px-4 pt-4">
              <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-lg p-4 border border-sky-100">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <p className="text-xs font-medium text-gray-600">
                    {getGreeting()}!
                  </p>
                </div>
                <p className="text-sm text-gray-800 font-semibold">
                  Welcome back, {user?.firstName}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          )}

          {/* Search */}
          {!isCollapsed && (
            <div className="px-4 pt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search menu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-1">
              {filteredMenuItems.map(item => renderMenuItem(item))}
            </nav>

            {!isCollapsed && filteredMenuItems.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">No menu items found</p>
              </div>
            )}
          </ScrollArea>

          {/* Bottom section */}
          <div className="p-3 border-t border-gray-200 bg-gray-50/50 space-y-2">
            {!isCollapsed && (
              <>
                {/* Quick Actions */}
                <div className="flex items-center justify-between px-2 mb-2">
                  <span className="text-xs font-medium text-gray-500">Quick Actions</span>
                  <TooltipProvider>
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 relative">
                          <Bell className="w-4 h-4" />
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-medium">
                            3
                          </span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Notifications</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Separator />
              </>
            )}

            {/* Settings and Logout */}
            {isCollapsed ? (
              <TooltipProvider>
                <div className="space-y-1">
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className={cn(
                          'w-full hover:bg-gray-100',
                          pathname === '/dashboard/settings' && 'bg-primary text-white hover:bg-primary/90'
                        )}
                      >
                        <Link href="/dashboard/settings" onClick={() => setIsOpen(false)}>
                          <Settings className="w-5 h-5" />
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Settings</TooltipContent>
                  </Tooltip>

                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={logout}
                        className="w-full bg-red-500 text-white hover:bg-red-600"
                      >
                        <LogOut className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Sign Out</TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            ) : (
              <>
                <Button
                  variant="ghost"
                  asChild
                  className={cn(
                    'w-full justify-start hover:bg-gray-100 transition-all',
                    pathname === '/dashboard/settings' && 'bg-primary text-white hover:bg-primary/90'
                  )}
                >
                  <Link href="/dashboard/settings" onClick={() => setIsOpen(false)}>
                    <Settings className="w-4 h-4 mr-3" />
                    <span className="font-medium">Settings</span>
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  onClick={logout}
                  className="w-full justify-start bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all shadow-sm"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  <span className="font-medium">Sign Out</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Button - Floating */}
      {!isOpen && (
        <Button
          size="icon"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 lg:hidden z-40 h-14 w-14 rounded-full shadow-xl bg-gradient-to-r from-primary to-sky-600 hover:from-primary/90 hover:to-sky-700 transition-all hover:scale-110"
        >
          <Menu className="w-6 h-6" />
        </Button>
      )}
    </>
  );
}