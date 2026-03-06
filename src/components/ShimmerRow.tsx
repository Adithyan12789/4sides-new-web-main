import ShimmerCard from './ShimmerCard';

export default function ShimmerRow() {
  return (
    <div className="py-4">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 mb-8">
        <div className="h-10 w-48 bg-white/5 rounded-lg animate-pulse" />
      </div>
      <div className="flex gap-6 overflow-hidden px-4 sm:px-6 lg:px-8 xl:px-12">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex-shrink-0 w-[200px] sm:w-[250px] lg:w-[300px]">
            <ShimmerCard />
          </div>
        ))}
      </div>
    </div>
  );
}
