import { useRef, useState, type ChangeEvent } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';


interface FileUploadProps {
  label?: string;
  accept?: string;
  maxSizeMB?: number; // Maximum size in MB
  value?: File | string | null;
  onChange: (file: File | null) => void;
  error?: string;
  helperText?: string;
}

export function FileUpload({
  label = 'Upload File',
  accept = 'image/*',
  maxSizeMB = 5,
  value,
  onChange,
  error,
  helperText,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(
    typeof value === 'string' ? value : null
  );

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFile = (file: File): boolean => {
    // Check file type
    if (accept && accept !== '*') {
      const db = accept.split(',').map((t) => t.trim());
      const type = file.type;
      const ext = `.${file.name.split('.').pop()?.toLowerCase()}`;
      
      const isValid = db.some((t) => {
        if (t.endsWith('/*')) {
           return type.startsWith(t.replace('/*', ''));
        }
        return type === t || ext === t;
      });

      if (!isValid) {
        alert('Invalid file type');
        return false;
      }
    }

    // Check size
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`File size exceeds ${maxSizeMB}MB`);
      return false;
    }

    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        handleFileSelect(file);
      }
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        handleFileSelect(file);
      }
    }
  };

  const handleFileSelect = (file: File) => {
    onChange(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    onChange(null);
    setPreview(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const triggerSelect = () => {
    inputRef.current?.click();
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      {!preview && !value ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors cursor-pointer
            ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'}
            ${error ? 'border-red-500' : ''}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={triggerSelect}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept={accept}
            onChange={handleChange}
          />
          <div className="bg-gray-100 p-3 rounded-full mb-3">
             <Upload className="w-6 h-6 text-gray-500" />
          </div>
          <p className="text-sm font-medium text-gray-900 mb-1">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-gray-500">
            SVG, PNG, JPG or GIF (max. {maxSizeMB}MB)
          </p>
        </div>
      ) : (
        <div className="relative rounded-lg border border-gray-200 overflow-hidden group">
          <div className="aspect-video w-full bg-gray-100 flex items-center justify-center">
             {preview ? (
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="w-full h-full object-cover" 
                />
             ) : (
                <div className="text-gray-400 flex flex-col items-center">
                   <ImageIcon className="w-8 h-8 mb-2" />
                   <span className="text-sm">File uploaded</span>
                </div>
             )}
          </div>
          <button
            onClick={handleRemove}
            type="button"
            className="absolute top-2 right-2 p-1 bg-white/80 hover:bg-white text-gray-700 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Remove file"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {helperText && !error && (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      )}
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
