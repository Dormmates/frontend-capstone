import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Props {
  items: {
    value: string;
    name: string;
  }[];
  placeholder?: string;
  label?: string;
  className?: string;
  onChange: (value: string) => void;
  value: string;
  includeHeader?: boolean;
  disabled?: boolean;
  error?: string;
}

const Dropdown = ({ disabled, includeHeader, items, label, placeholder, className, onChange, value, error }: Props) => {
  return (
    <div className={`flex flex-col gap-3 w-full `}>
      {includeHeader && <Label>{label}</Label>}
      <Select onValueChange={(value) => onChange(value)} value={value}>
        <SelectTrigger disabled={disabled} className={`${className} ${error && "border-red"} `}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>{label}</SelectLabel>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {error && <p className="text-red text-sm">{error}</p>}
    </div>
  );
};

export default Dropdown;
