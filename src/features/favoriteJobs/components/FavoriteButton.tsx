import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

type Props = {
  jobListingId: string;
  isFavorite: boolean;
  onChangeFavorites: (item: string) => void
};

export function FavoriteButton({ jobListingId, isFavorite, onChangeFavorites }: Props) {
  return (
    <Button 
      size="icon" 
      variant="ghost" 
      onClick={e => {
        e.preventDefault();
        e.stopPropagation();
        onChangeFavorites(jobListingId);
      }}
      className="group w-fit h-fit hover:bg-transparent hover:cursor-pointer"
    >
      <Heart className={`size-4 ${isFavorite ? 'fill-current' : ''} group-hover:fill-current`} />
      <span className="sr-only">
        {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      </span>
    </Button>
  );
}