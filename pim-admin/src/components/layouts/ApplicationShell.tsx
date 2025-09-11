'use client';

import { useState, Fragment } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Dialog, Transition, Menu } from '@headlessui/react';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  CubeIcon,
  FolderIcon,
  TagIcon,
  PhotoIcon,
  ClipboardDocumentListIcon,
  ArrowPathIcon,
  GlobeAltIcon,
  Cog6ToothIcon,
  UsersIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  CreditCardIcon,
  ShoppingCartIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline';
import { MagnifyingGlassIcon, BellIcon } from '@heroicons/react/20/solid';
import { useAuthStore } from '../../stores/auth.store';

// Navigation structure with sections
const navigationSections = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: HomeIcon,
    href: '/',
    isSection: false,
  },
  {
    id: 'product-engine',
    name: 'Product Engine',
    icon: CubeIcon,  // Same as Products
    isSection: true,
    items: [
      { name: 'Products', href: '/products', icon: CubeIcon },
      { name: 'Categories', href: '/categories', icon: FolderIcon },
      { name: 'Attributes', href: '/attributes', icon: TagIcon },
      { name: 'Media', href: '/media', icon: PhotoIcon },
      { name: 'Workflows', href: '/workflows', icon: ClipboardDocumentListIcon },
      { name: 'Import/Export', href: '/import-export', icon: ArrowPathIcon },
      { name: 'Channels', href: '/channels', icon: GlobeAltIcon },
    ],
  },
  {
    id: 'subscription-engine',
    name: 'Subscription Engine',
    icon: CreditCardIcon,
    isSection: true,
    items: [
      // Ready for future subscription items
      // { name: 'Plans', href: '/plans', icon: ClipboardDocumentListIcon },
      // { name: 'Subscribers', href: '/subscribers', icon: UsersIcon },
      // { name: 'Billing', href: '/billing', icon: CreditCardIcon },
    ],
  },
  {
    id: 'marketplace-engine',
    name: 'Marketplace Engine',
    icon: ShoppingCartIcon,
    isSection: true,
    items: [
      // Ready for future marketplace items
      // { name: 'Vendors', href: '/vendors', icon: UsersIcon },
      // { name: 'Orders', href: '/orders', icon: ClipboardDocumentListIcon },
      // { name: 'Commissions', href: '/commissions', icon: CreditCardIcon },
    ],
  },
  {
    id: 'administration',
    name: 'Administration',
    icon: Cog6ToothIcon,
    isSection: true,
    items: [
      { name: 'Users', href: '/users', icon: UsersIcon },
      { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
    ],
  },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function ApplicationShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Track expanded sections - Product Engine and Administration expanded by default
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['product-engine', 'administration'])
  );

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Toggle section expansion
  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  // Determine current path for navigation highlighting
  const isCurrentPath = (href: string) => {
    if (href === '/') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  // Check if any item in a section is active
  const isSectionActive = (section: any) => {
    if (!section.isSection) return false;
    return section.items?.some((item: any) => isCurrentPath(item.href)) || false;
  };

  // Render navigation item
  const renderNavItem = (item: any, inSection: boolean = false) => (
    <li key={item.name}>
      <Link
        to={item.href}
        onClick={() => sidebarOpen && setSidebarOpen(false)}
        className={classNames(
          isCurrentPath(item.href)
            ? 'bg-navy-100 dark:bg-navy-900/30 text-navy-800 dark:text-white font-semibold'
            : 'text-gray-700 dark:text-gray-300 hover:text-navy-800 hover:bg-navy-50 dark:hover:bg-navy-900/20',
          'group flex gap-x-3 rounded-md p-2 text-sm leading-6',
          inSection ? 'pl-11' : '' // Indent sub-items
        )}
      >
        <item.icon
          className={classNames(
            isCurrentPath(item.href)
              ? 'text-navy-800 dark:text-navy-300'
              : 'text-gray-400 group-hover:text-navy-800',
            'h-5 w-5 shrink-0',
          )}
          aria-hidden="true"
        />
        {item.name}
      </Link>
    </li>
  );

  // Render navigation section
  const renderSection = (section: any) => {
    const isExpanded = expandedSections.has(section.id);
    const hasActiveItem = isSectionActive(section);

    if (!section.isSection) {
      // Render simple navigation item (like Dashboard)
      return renderNavItem(section);
    }

    return (
      <li key={section.id}>
        <button
          onClick={() => toggleSection(section.id)}
          className={classNames(
            hasActiveItem
              ? 'bg-gray-50 dark:bg-gray-800/50 text-navy-800 dark:text-white'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50',
            'group flex w-full items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 transition-colors'
          )}
        >
          <section.icon
            className={classNames(
              hasActiveItem
                ? 'text-navy-800 dark:text-navy-300'
                : 'text-gray-400 group-hover:text-navy-600',
              'h-6 w-6 shrink-0'
            )}
            aria-hidden="true"
          />
          <span className="flex-1 text-left">{section.name}</span>
          {section.items && section.items.length > 0 && (
            <>
              {isExpanded ? (
                <ChevronDownIcon className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronRightIcon className="h-4 w-4 text-gray-400" />
              )}
            </>
          )}
          {section.items && section.items.length === 0 && (
            <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
              Soon
            </span>
          )}
        </button>
        
        {/* Render sub-items if expanded and has items */}
        {isExpanded && section.items && section.items.length > 0 && (
          <ul role="list" className="mt-1 space-y-1">
            {section.items.map((item) => renderNavItem(item, true))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <>
      <div>
        {/* Mobile sidebar */}
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-900/80" />
            </Transition.Child>

            <div className="fixed inset-0 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                      <button
                        type="button"
                        className="-m-2.5 p-2.5"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                      </button>
                    </div>
                  </Transition.Child>

                  {/* Mobile Sidebar content */}
                  <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-900 px-6 pb-4">
                    <div className="flex h-16 shrink-0 items-center">
                      <div className="flex items-center space-x-2">
                        <div className="flex-shrink-0">
                          <RocketLaunchIcon className="h-8 w-8 text-accent-500" aria-hidden="true" />
                        </div>
                        <span className="text-xl font-bold text-gray-900 dark:text-white">My Engines</span>
                      </div>
                    </div>
                    <nav className="flex flex-1 flex-col">
                      <ul role="list" className="flex flex-1 flex-col gap-y-4">
                        {navigationSections.map(section => renderSection(section))}
                      </ul>
                    </nav>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 pb-4">
            <div className="flex h-16 shrink-0 items-center">
              <div className="flex items-center space-x-2">
                <div className="flex-shrink-0">
                  <RocketLaunchIcon className="h-8 w-8 text-accent-500" aria-hidden="true" />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">My Engines</span>
              </div>
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-4">
                {navigationSections.map(section => renderSection(section))}
              </ul>
            </nav>
          </div>
        </div>

        <div className="lg:pl-72">
          {/* Top header bar */}
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <button
              type="button"
              className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-300 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>

            {/* Separator */}
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 lg:hidden" aria-hidden="true" />

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              <form className="relative flex flex-1" action="#" method="GET">
                <label htmlFor="search-field" className="sr-only">
                  Search
                </label>
                <MagnifyingGlassIcon
                  className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400"
                  aria-hidden="true"
                />
                <input
                  id="search-field"
                  className="block h-full w-full border-0 py-0 pl-8 pr-0 text-gray-900 dark:text-white bg-transparent placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                  placeholder="Search..."
                  type="search"
                  name="search"
                />
              </form>
              <div className="flex items-center gap-x-4 lg:gap-x-6">
                <button type="button" className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500">
                  <span className="sr-only">View notifications</span>
                  <BellIcon className="h-6 w-6" aria-hidden="true" />
                </button>

                {/* Separator */}
                <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200 dark:bg-gray-700" aria-hidden="true" />

                {/* Profile dropdown */}
                <Menu as="div" className="relative">
                  <Menu.Button className="-m-1.5 flex items-center p-1.5">
                    <span className="sr-only">Open user menu</span>
                    <UserCircleIcon className="h-8 w-8 text-gray-400" aria-hidden="true" />
                    <span className="hidden lg:flex lg:items-center">
                      <span
                        className="ml-4 text-sm font-semibold leading-6 text-gray-900 dark:text-white"
                        aria-hidden="true"
                      >
                        {user ? `${user.firstName} ${user.lastName}` : 'User'}
                      </span>
                      <ChevronDownIcon
                        className="ml-2 h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </span>
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2.5 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/profile"
                            className={classNames(
                              active ? 'bg-gray-50 dark:bg-gray-700' : '',
                              'block px-3 py-1 text-sm leading-6 text-gray-900 dark:text-white'
                            )}
                          >
                            <div className="flex items-center">
                              <UserCircleIcon className="mr-3 h-5 w-5 text-gray-400" />
                              Your profile
                            </div>
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/settings"
                            className={classNames(
                              active ? 'bg-gray-50 dark:bg-gray-700' : '',
                              'block px-3 py-1 text-sm leading-6 text-gray-900 dark:text-white'
                            )}
                          >
                            <div className="flex items-center">
                              <Cog6ToothIcon className="mr-3 h-5 w-5 text-gray-400" />
                              Settings
                            </div>
                          </Link>
                        )}
                      </Menu.Item>
                      <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogout}
                            className={classNames(
                              active ? 'bg-gray-50 dark:bg-gray-700' : '',
                              'block w-full text-left px-3 py-1 text-sm leading-6 text-gray-900 dark:text-white'
                            )}
                          >
                            <div className="flex items-center">
                              <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400" />
                              Sign out
                            </div>
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </div>
          </div>

          <main className="py-10 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}
