export default function ShimmerCard() {
  return (
    <div className="flex-shrink-0 w-[160px] sm:w-[200px] md:w-[240px] group">
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gradient-to-br from-white/[0.03] via-white/[0.06] to-white/[0.03] border border-white/[0.05]">
        {/* Animated shimmer overlay */}
        <div className="absolute inset-0 shimmer-modern" />
        
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#EAB308]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Skeleton content */}
        <div className="absolute inset-0 p-4 flex flex-col justify-end">
          <div className="space-y-2">
            <div className="h-2 bg-white/10 rounded-full w-3/4 shimmer-pulse" />
            <div className="h-2 bg-white/5 rounded-full w-1/2 shimmer-pulse" style={{ animationDelay: '0.2s' }} />
          </div>
        </div>
      </div>
      
      {/* Title skeleton */}
      <div className="mt-3 space-y-2">
        <div className="h-4 bg-gradient-to-r from-white/10 via-white/5 to-white/10 rounded-lg w-4/5 shimmer-pulse" />
        <div className="h-3 bg-gradient-to-r from-white/5 via-white/[0.02] to-white/5 rounded-lg w-2/3 shimmer-pulse" style={{ animationDelay: '0.3s' }} />
      </div>
    </div>
  );
}

export function ShimmerHero() {
  return (
    <div className="relative h-[500px] sm:h-[600px] lg:h-[700px] overflow-hidden bg-gradient-to-br from-black via-[#0a0a0a] to-black">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#EAB308]/[0.03] via-transparent to-[#EAB308]/[0.02] shimmer-slow" />
      
      {/* Main shimmer effect */}
      <div className="absolute inset-0 shimmer-modern" />
      
      {/* Radial gradient overlays */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#EAB308]/[0.02] rounded-full blur-[100px] shimmer-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-[100px] shimmer-pulse" style={{ animationDelay: '1s' }} />
      
      {/* Content skeleton */}
      <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 lg:p-16 xl:p-20 space-y-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        {/* Category badge */}
        <div className="inline-block">
          <div className="h-6 w-24 bg-gradient-to-r from-white/10 via-white/5 to-white/10 rounded-full shimmer-pulse" />
        </div>
        
        {/* Title */}
        <div className="space-y-3">
          <div className="h-12 sm:h-16 lg:h-20 bg-gradient-to-r from-white/15 via-white/10 to-white/15 rounded-2xl w-3/4 max-w-3xl shimmer-pulse" />
          <div className="h-12 sm:h-16 lg:h-20 bg-gradient-to-r from-white/10 via-white/5 to-white/10 rounded-2xl w-2/3 max-w-2xl shimmer-pulse" style={{ animationDelay: '0.2s' }} />
        </div>
        
        {/* Description lines */}
        <div className="space-y-2 max-w-2xl">
          <div className="h-4 bg-gradient-to-r from-white/8 via-white/4 to-white/8 rounded-lg w-full shimmer-pulse" style={{ animationDelay: '0.3s' }} />
          <div className="h-4 bg-gradient-to-r from-white/6 via-white/3 to-white/6 rounded-lg w-5/6 shimmer-pulse" style={{ animationDelay: '0.4s' }} />
          <div className="h-4 bg-gradient-to-r from-white/4 via-white/2 to-white/4 rounded-lg w-3/4 shimmer-pulse" style={{ animationDelay: '0.5s' }} />
        </div>
        
        {/* Buttons */}
        <div className="flex flex-wrap gap-4 pt-4">
          <div className="h-14 w-40 bg-gradient-to-r from-[#EAB308]/20 via-[#EAB308]/10 to-[#EAB308]/20 rounded-xl shimmer-pulse border border-[#EAB308]/20" />
          <div className="h-14 w-40 bg-gradient-to-r from-white/10 via-white/5 to-white/10 rounded-xl shimmer-pulse border border-white/10" style={{ animationDelay: '0.2s' }} />
        </div>
      </div>
      
      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
    </div>
  );
}

export function ShimmerRow() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 xl:px-12 space-y-5">
      {/* Title skeleton with icon */}
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 bg-gradient-to-br from-[#EAB308]/20 to-[#EAB308]/10 rounded-lg shimmer-pulse border border-[#EAB308]/20" />
        <div className="h-7 bg-gradient-to-r from-white/15 via-white/10 to-white/15 rounded-xl w-56 shimmer-pulse" />
      </div>
      
      {/* Cards container */}
      <div className="flex gap-4 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ animationDelay: `${i * 0.1}s` }}>
            <ShimmerCard />
          </div>
        ))}
      </div>
    </div>
  );
}
