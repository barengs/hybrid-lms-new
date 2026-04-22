import { Plus, Trash2 } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';

interface DynamicListProps {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
}

export function DynamicList({
  label,
  items,
  onChange,
  placeholder = 'Add item...',
  error,
  helperText,
}: DynamicListProps) {
  const handleAdd = () => {
    onChange([...items, '']);
  };

  const handleRemove = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems);
  };

  const handleChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    onChange(newItems);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
         <label className="block text-sm font-medium text-gray-700">
           {label}
         </label>
         <Button
           type="button"
           variant="ghost"
           size="sm"
           onClick={handleAdd}
           className="text-primary hover:text-primary/80 h-auto p-0 text-xs font-semibold"
         >
           <Plus className="w-3 h-3 mr-1" />
           Add Item
         </Button>
      </div>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={item}
              onChange={(e) => handleChange(index, e.target.value)}
              placeholder={`${placeholder} ${index + 1}`}
              className="flex-1"
            />
            {items.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleRemove(index)}
                className="text-red-500 hover:bg-red-50 border-red-200 aspect-square p-2"
                aria-label="Remove item"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
        {items.length === 0 && (
           <div className="text-sm text-gray-500 italic border border-dashed border-gray-200 rounded-lg p-3 text-center bg-gray-50">
              No items added yet. Click &quot;Add Item&quot; to start.
           </div>
        )}
      </div>

      {helperText && !error && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
