import { StarIcon } from "./icons";

export default function RatingStars({ rating }: { rating: number }) {
  return (
    <span
      className="flex items-center gap-1 text-slate-700"
      aria-label={`Rated ${rating} out of 5`}
    >
      <StarIcon className="h-3.5 w-3.5" filled />
      <span className="font-mono text-xs">{rating.toFixed(1)}</span>
    </span>
  );
}
