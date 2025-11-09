import React from "react";

interface ResponsiveGalleryImageProps {
  src: string;
  alt: string;
  className?: string;
}

const ResponsiveGalleryImage: React.FC<ResponsiveGalleryImageProps> = ({ src, alt, className }) => {
  const baseName = src.replace(".webp", "");

  return (
    <picture className="block w-full h-full">
      <source srcSet={`${baseName}-1600.webp`} media="(min-width: 1600px)" type="image/webp" />
      <source srcSet={`${baseName}-1024.webp`} media="(min-width: 1024px)" type="image/webp" />
      <source srcSet={`${baseName}-640.webp`} media="(min-width: 768px)" type="image/webp" />
      <source srcSet={`${baseName}-1024.webp`} media="(max-width: 767px)" type="image/webp" />
      
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={className || "w-full h-full object-cover"}
      />
    </picture>
  );
};

export default ResponsiveGalleryImage;
