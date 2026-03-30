import {
  CalendarDays,
  Users,
  Scissors,
  DoorOpen,
  UserCircle,
  CreditCard,
  MessageSquare,
  LayoutDashboard,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Calendar', href: '/calendar', icon: CalendarDays },
  { label: 'Services', href: '/services', icon: Scissors },
  { label: 'Therapists', href: '/therapists', icon: Users },
  { label: 'Rooms', href: '/rooms', icon: DoorOpen },
  { label: 'Customers', href: '/customers', icon: UserCircle },
  { label: 'Payments', href: '/payments', icon: CreditCard },
  { label: 'Inbox', href: '/inbox', icon: MessageSquare },
];
