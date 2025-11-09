import React from "react";
import ResponsiveGalleryImage from "./ResponsiveGalleryImage";

const images = [
  "images/debut.webp",        // 0
  "images/cake.webp",     // 1
  "images/sweets.webp",        // 2
  "images/decorations4.webp",       // 3
  "images/flowergirl.webp",  // 4
  "images/gown4.webp",      // 5
  "images/prenup6.webp",        // 6
  "images/wedding6.webp",  // 7
  "images/maidofhonor.webp",      // 8
  "images/groom.webp",  // 9
  "images/bride5.webp",     // 10
  "images/cake2.webp",       // 11
  "images/decoration1.webp",      // 12
  "images/invitations3.webp",       // 13
];

const Gallery: React.FC = () => {
  return (
    <section id="gallery" className="pt-20 bg-white">
      <div className="max-w-8xl mx-auto px-6">
        {/* Responsive Grid Container */}
        <div className="grid grid-cols-1 grid-rows-33 gap-4 md:grid-cols-2 md:grid-rows-17 md:gap-4 lg:grid-cols-8 lg:grid-rows-6 lg:gap-4">
          {/* Item 1 */}
          <div className="col-start-1 col-span-1 row-start-1 row-span-2 md:col-start-1 md:col-span-1 md:row-start-1 md:row-span-2 lg:col-start-1 lg:col-span-1 lg:row-start-2 lg:row-span-2 rounded-2xl overflow-hidden shadow-lg h-[200px]">
            <ResponsiveGalleryImage
              src={images[0]}
              alt="Birthday celebration"
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>

          {/* Item 2 */}
          <div className="col-start-1 col-span-1 row-start-3 row-span-2 md:col-start-2 md:col-span-1 md:row-start-1 md:row-span-2 lg:col-start-1 lg:col-span-1 lg:row-start-4 lg:row-span-2 rounded-2xl overflow-hidden shadow-lg h-[200px]">
            <ResponsiveGalleryImage
              src={images[1]}
              alt="Wedding gown"
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>

          {/* Item 3 */}
          <div className="col-start-1 col-span-1 row-start-5 row-span-2 md:col-start-1 md:col-span-1 md:row-start-3 md:row-span-2 lg:col-start-2 lg:col-span-1 lg:row-start-1 lg:row-span-2 rounded-2xl overflow-hidden shadow-lg h-[200px]">
            <ResponsiveGalleryImage
              src={images[2]}
              alt="Sweets"
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>

          {/* Item 4 */}
          <div className="col-start-1 col-span-1 row-start-7 row-span-2 md:col-start-2 md:col-span-1 md:row-start-3 md:row-span-2 lg:col-start-2 lg:col-span-1 lg:row-start-3 lg:row-span-2 rounded-2xl overflow-hidden shadow-lg h-[200px]">
            <ResponsiveGalleryImage
              src={images[3]}
              alt="Venue decorations"
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>

          {/* Item 5 */}
          <div className="col-start-1 col-span-1 row-start-9 row-span-2 md:col-start-1 md:col-span-1 md:row-start-5 md:row-span-2 lg:col-start-2 lg:col-span-1 lg:row-start-5 lg:row-span-2 rounded-2xl overflow-hidden shadow-lg h-[200px]">
            <ResponsiveGalleryImage
              src={images[4]}
              alt="Wedding"
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>

          {/* Item 6 */}
          <div className="col-start-1 col-span-1 row-start-11 row-span-3 md:col-start-2 md:col-span-1 md:row-start-5 md:row-span-3 lg:col-start-3 lg:col-span-1 lg:row-start-2 lg:row-span-3 rounded-2xl overflow-hidden shadow-lg h-[310px]">
            <ResponsiveGalleryImage
              src={images[5]}
              alt="Bridesmaid"
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>

          {/* Item 7 */}
          <div className="col-start-1 col-span-1 row-start-14 row-span-3 md:col-start-1 md:col-span-1 md:row-start-7 md:row-span-3 lg:col-start-4 lg:col-span-1 lg:row-start-1 lg:row-span-3 rounded-2xl overflow-hidden shadow-lg h-[310px]">
            <ResponsiveGalleryImage
              src={images[6]}
              alt="Wedding"
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>

          {/* Item 8 */}
          <div className="col-start-1 col-span-1 row-start-17 row-span-3 md:col-start-2 md:col-span-1 md:row-start-8 md:row-span-3 lg:col-start-5 lg:col-span-1 lg:row-start-1 lg:row-span-3 rounded-2xl overflow-hidden shadow-lg h-[310px]">
            <ResponsiveGalleryImage
              src={images[7]}
              alt="Groom"
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>

          {/* Item 9 */}
          <div className="col-start-1 col-span-1 row-start-20 row-span-3 md:col-start-1 md:col-span-1 md:row-start-10 md:row-span-3 lg:col-start-6 lg:col-span-1 lg:row-start-2 lg:row-span-3 rounded-2xl overflow-hidden shadow-lg h-[310px]">
            <ResponsiveGalleryImage
              src={images[8]}
              alt="Bride"
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>

          {/* Item 10 */}
          <div className="col-start-1 col-span-1 row-start-23 row-span-2 md:col-start-2 md:col-span-1 md:row-start-11 md:row-span-2 lg:col-start-7 lg:col-span-1 lg:row-start-1 lg:row-span-2 rounded-2xl overflow-hidden shadow-lg h-[200px]">
            <ResponsiveGalleryImage
              src={images[9]}
              alt="Prenup"
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>

          {/* Item 11 */}
          <div className="col-start-1 col-span-1 row-start-25 row-span-2 md:col-start-1 md:col-span-1 md:row-start-13 md:row-span-2 lg:col-start-7 lg:col-span-1 lg:row-start-3 lg:row-span-2 rounded-2xl overflow-hidden shadow-lg h-[200px]">
            <ResponsiveGalleryImage
              src={images[10]}
              alt="Bride"
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>

          {/* Item 12 */}
          <div className="col-start-1 col-span-1 row-start-27 row-span-2 md:col-start-2 md:col-span-1 md:row-start-13 md:row-span-2 lg:col-start-7 lg:col-span-1 lg:row-start-5 lg:row-span-2 rounded-2xl overflow-hidden shadow-lg h-[200px]">
            <ResponsiveGalleryImage
              src={images[11]}
              alt="Cake"
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>

          {/* Item 13 */}
          <div className="col-start-1 col-span-1 row-start-29 row-span-2 md:col-start-1 md:col-span-1 md:row-start-15 md:row-span-2 lg:col-start-8 lg:col-span-1 lg:row-start-2 lg:row-span-2 rounded-2xl overflow-hidden shadow-lg h-[200px]">
            <ResponsiveGalleryImage
              src={images[12]}
              alt="Decoration"
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>

          {/* Item 14 */}
          <div className="col-start-1 col-span-1 row-start-31 row-span-2 md:col-start-2 md:col-span-1 md:row-start-15 md:row-span-2 lg:col-start-8 lg:col-span-1 lg:row-start-4 lg:row-span-2 rounded-2xl overflow-hidden shadow-lg h-[200px]">
            <ResponsiveGalleryImage
              src={images[13]}
              alt="Invitation"
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Gallery;