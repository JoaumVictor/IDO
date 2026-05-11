import Image from "next/image";

interface IDOAvatarProps {
  size?: number;
  className?: string;
  alt?: string;
  priority?: boolean;
}

export function IDOAvatar({
  size = 40,
  className = "",
  alt = "IDO",
  priority,
}: IDOAvatarProps) {
  return (
    <div
      className={`rounded-full bg-black overflow-hidden inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src="/ido-default.png"
        alt={alt}
        width={size}
        height={size}
        className="object-cover w-full h-full"
        priority={priority ?? size >= 96}
      />
    </div>
  );
}
