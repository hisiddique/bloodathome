import { Search } from "lucide-react";
import { Input } from "./input";

interface LocationSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (data: { postcode: string; coordinates: [number, number] }) => void;
  placeholder?: string;
}

export function LocationSearch({
  value,
  onChange,
  onSelect,
  placeholder = "Enter postcode",
}: LocationSearchProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
      <Input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-10"
      />
    </div>
  );
}
