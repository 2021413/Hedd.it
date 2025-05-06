import Image from "next/image";

interface AvatarProps {
  src?: string;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: { size: 32, text: "text-xs" },
  md: { size: 48, text: "text-sm" },
  lg: { size: 64, text: "text-lg" },
  xl: { size: 128, text: "text-3xl" },
};

export default function Avatar({ src, alt, size = "md", className = "" }: AvatarProps) {
  const { size: dimensions, text } = sizeMap[size];
  
  return (
    <div 
      className={`rounded-full overflow-hidden bg-gray-200 ${className}`}
      style={{ width: dimensions, height: dimensions }}
    >
      {src ? (
        <Image 
          src={src} 
          alt={alt} 
          width={dimensions} 
          height={dimensions} 
          className="object-cover"
        />
      ) : (
        <div className={`flex items-center justify-center h-full ${text} text-gray-400`}>
          {alt.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
} 