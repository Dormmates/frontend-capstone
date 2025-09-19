import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ShowCardProps {
  genres: string[];
  title: string;
  showImage: string;
  description: string;
  className?: string;
}

const ShowCard = ({ genres, title, showImage, description, className }: ShowCardProps) => {
  return (
    <Card className={`w-fit ${className}`}>
      <CardHeader>
        <CardTitle>
          <h1 className="font-bold text-xl uppercase">{title}</h1>
        </CardTitle>
        <CardDescription className="flex gap-1 mt-2">
          {genres.map((name, index) => (
            <Badge key={index} variant="outline" className="rounded-full">
              {name}
            </Badge>
          ))}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex gap-5">
        <img className="w-[100px] h-[120px] object-contain bg-muted" src={showImage} alt="show image" />
        <p className="flex-1 text-sm text-muted-foreground ">{description}</p>
      </CardContent>
    </Card>
  );
};

export default ShowCard;
