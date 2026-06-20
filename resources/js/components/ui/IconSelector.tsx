import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react';
import { ChevronDown, Check } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

export const AVAILABLE_ICONS = [
  'Activity', 'Award', 'Book', 'Briefcase', 'Calendar', 'Clock', 'Code', 'Coins', 'Cpu', 'Heart', 
  'MessageSquare', 'Palette', 'Play', 'RefreshCw', 'Target', 'TrendingUp', 'Wrench', 'Zap',
  'Monitor', 'Smartphone', 'Database', 'Globe', 'PenTool', 'Layout', 'TrendingUp', 'PieChart'
];

interface IconSelectorProps {
  value: string;
  onChange: (val: string) => void;
  language: string;
}

export function IconSelector({ value, onChange, language }: IconSelectorProps) {
  const selectedIconName = value || '';
  const SelectedIcon = selectedIconName ? (LucideIcons as any)[selectedIconName] : null;

  return (
    <Listbox value={selectedIconName} onChange={onChange}>
      <div className="relative">
        <ListboxButton className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm">
          <span className="flex items-center gap-2 truncate">
            {SelectedIcon ? <SelectedIcon className="w-4 h-4 text-gray-500" /> : <div className="w-4 h-4" />}
            <span>{selectedIconName || (language === 'id' ? '-- Tanpa Ikon --' : '-- No Icon --')}</span>
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
          </span>
        </ListboxButton>
        <ListboxOptions className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          <ListboxOption
            value=""
            className="relative cursor-default select-none py-2 pl-10 pr-4 text-gray-900 data-[focus]:bg-blue-100 data-[focus]:text-blue-900"
          >
            {({ selected }) => (
              <>
                <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                  {language === 'id' ? '-- Tanpa Ikon --' : '-- No Icon --'}
                </span>
                {selected ? (
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                    <Check className="h-4 w-4" aria-hidden="true" />
                  </span>
                ) : null}
              </>
            )}
          </ListboxOption>
          {AVAILABLE_ICONS.map((iconName) => {
            const Icon = (LucideIcons as any)[iconName];
            return (
              <ListboxOption
                key={iconName}
                value={iconName}
                className="relative cursor-default select-none py-2 pl-10 pr-4 text-gray-900 data-[focus]:bg-blue-100 data-[focus]:text-blue-900"
              >
                {({ selected }) => (
                  <>
                    <span className={`flex items-center gap-2 truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                      {Icon && <Icon className="w-4 h-4 text-gray-500" />}
                      <span>{iconName}</span>
                    </span>
                    {selected ? (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                        <Check className="h-4 w-4" aria-hidden="true" />
                      </span>
                    ) : null}
                  </>
                )}
              </ListboxOption>
            );
          })}
        </ListboxOptions>
      </div>
    </Listbox>
  );
}
