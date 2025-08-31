import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  items: {
    value: string;
    name: string;
  }[];
  placeholder: string;
  label: string;
  className?: string;
  onChange: (value: string) => void;
  value: string;
}

const Dropdown = ({ items, label, placeholder, className, onChange, value }: Props) => {
  return (
    <Select onValueChange={(value) => onChange(value)} value={value}>
      <SelectTrigger className={className}>
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
  );
};

export default Dropdown;
