import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Calendar } from "lucide-react";

interface SearchFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  colorFilter?: string;
  onColorChange?: (value: string) => void;
  locationFilter?: string;
  onLocationChange?: (value: string) => void;
  dateFrom?: string;
  onDateFromChange?: (value: string) => void;
  dateTo?: string;
  onDateToChange?: (value: string) => void;
}

const SearchFilters = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  categoryFilter,
  onCategoryChange,
  colorFilter,
  onColorChange,
  locationFilter,
  onLocationChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
}: SearchFiltersProps) => {
  return (
    <div className="bg-card rounded-lg p-6 shadow-sm space-y-4">
      <div className="relative">
        <Label htmlFor="search" className="sr-only">
          Search items
        </Label>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id="search"
          placeholder="Search by title or description..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={categoryFilter} onValueChange={onCategoryChange}>
            <SelectTrigger id="category">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="electronics">Electronics</SelectItem>
              <SelectItem value="clothing">Clothing</SelectItem>
              <SelectItem value="accessories">Accessories</SelectItem>
              <SelectItem value="books">Books</SelectItem>
              <SelectItem value="keys">Keys</SelectItem>
              <SelectItem value="bags">Bags</SelectItem>
              <SelectItem value="documents">Documents</SelectItem>
              <SelectItem value="sports">Sports</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {onColorChange && (
          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <Input
              id="color"
              placeholder="e.g., Black, Blue, Red"
              value={colorFilter || ""}
              onChange={(e) => onColorChange(e.target.value)}
            />
          </div>
        )}

        {onLocationChange && (
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g., Library, Student Union"
              value={locationFilter || ""}
              onChange={(e) => onLocationChange(e.target.value)}
            />
          </div>
        )}
      </div>

      {onDateFromChange && onDateToChange && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dateFrom">
              <Calendar className="inline h-4 w-4 mr-1" />
              Date From (optional)
            </Label>
            <Input
              id="dateFrom"
              type="date"
              value={dateFrom || ""}
              onChange={(e) => onDateFromChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateTo">
              <Calendar className="inline h-4 w-4 mr-1" />
              Date To (optional)
            </Label>
            <Input
              id="dateTo"
              type="date"
              value={dateTo || ""}
              onChange={(e) => onDateToChange(e.target.value)}
            />
          </div>
        </div>
      )}
      
      <p className="text-xs text-muted-foreground">
        💡 Tip: Enter any details you remember. Even partial information helps find your item!
      </p>
    </div>
  );
};

export default SearchFilters;
