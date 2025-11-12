export interface NavItem {
  label: string;
  path: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Expenses', path: '/expenses' },
  { label: 'Savings Goals', path: '/savings-goals' },
  { label: 'Budgets', path: '/budgets' },
  { label: 'Categories', path: '/categories' },
  { label: 'Reports', path: '/reports' },
  { label: 'Settings', path: '/settings' },
];

