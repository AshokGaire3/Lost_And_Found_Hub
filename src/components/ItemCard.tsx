import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

interface ItemCardProps {
  id: string;
  title: string;
  description: string;
  status: "lost" | "found" | "claimed" | "returned";
  category: string;
  location: string;
  dateLostFound: string;
  imageUrl?: string;
  color?: string | null;
  venue?: string | null;
}

const ItemCard = ({
  id,
  title,
  description,
  status,
  category,
  location,
  dateLostFound,
  imageUrl,
  color,
  venue,
}: ItemCardProps) => {
  const statusColors = {
    lost: "bg-destructive/10 text-destructive border-destructive/20",
    found: "bg-accent/10 text-accent border-accent/20",
    claimed: "bg-warning/10 text-warning border-warning/20",
    returned: "bg-success/10 text-success border-success/20",
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-all duration-300 group">
      <div className="relative h-48 bg-muted overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-16 w-16 text-muted-foreground/30" />
          </div>
        )}
        <Badge
          className={`absolute top-3 right-3 ${statusColors[status]} font-semibold`}
        >
          {status.toUpperCase()}
        </Badge>
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg line-clamp-1">{title}</h3>
          <Badge variant="outline" className="ml-2 shrink-0">
            {category}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {description}
        </p>

        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">{venue ? `${venue} - ${location}` : location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(dateLostFound), "MMM d, yyyy")}</span>
          </div>
          {color && (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full border" style={{backgroundColor: color.toLowerCase()}} />
              <span>{color}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button variant="outline" className="w-full" asChild>
          <Link to={`/item/${id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ItemCard;
