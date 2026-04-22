import { Fragment, type ReactNode } from 'react';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import { cn } from '@/lib/utils';

interface DropdownItem {
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
  divider?: boolean;
}

interface DropdownProps {
  trigger: ReactNode;
  items?: DropdownItem[];
  children?: ReactNode;
  align?: 'left' | 'right';
  className?: string;
  contentClassName?: string;
}

function Dropdown({ trigger, items, children, align = 'right', className, contentClassName }: DropdownProps) {
  return (
    <Menu as="div" className={cn('relative inline-block text-left', className)}>
      <MenuButton as={Fragment}>{trigger}</MenuButton>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <MenuItems
          className={cn(
            'absolute z-50 mt-2 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black/5 focus:outline-none overflow-hidden',
            align === 'left' ? 'left-0' : 'right-0',
            children ? contentClassName : 'w-56 py-1'
          )}
        >
          {children ? (
            children
          ) : (
            items?.map((item, index) =>
              item.divider ? (
                <div key={index} className="border-t border-gray-100 my-1" />
              ) : (
                <MenuItem key={index}>
                  {({ focus }) => (
                    <button
                      onClick={item.onClick}
                      className={cn(
                        'flex w-full items-center gap-3 px-4 py-2.5 text-sm',
                        focus && 'bg-gray-50',
                        item.danger
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-gray-700 hover:bg-gray-50'
                      )}
                    >
                      {item.icon && <span className="w-5 h-5">{item.icon}</span>}
                      {item.label}
                    </button>
                  )}
                </MenuItem>
              )
            )
          )}
        </MenuItems>
      </Transition>
    </Menu>
  );
}

export { Dropdown };
export type { DropdownItem };
