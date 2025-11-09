// import { Brush, Scissors, ShoppingBag, Utensils, Flower2 } from "lucide-react";

// const services = [
//   {
//     icon: Scissors,
//     title: "Gown / Suit Rental",
//     description:
//       "Elegant gowns and suits for rent — perfect for weddings, debuts, and formal events.",
//   },
//   {
//     icon: ShoppingBag,
//     title: "Attire Purchase",
//     description:
//       "Custom-made or ready-to-wear dresses and suits tailored to your taste and style.",
//   },
//   {
//     icon: Brush,
//     title: "Makeup",
//     description:
//       "Professional makeup services to make you shine beautifully for any occasion.",
//   },
//   {
//     icon: Utensils,
//     title: "Catering",
//     description:
//       "Delicious and beautifully presented dishes for your special gatherings.",
//   },
//   {
//     icon: Flower2,
//     title: "Venue Decoration",
//     description:
//       "Elegant floral and venue designs that bring your dream event to life.",
//   },
// ];

// const ServicesSection = () => {
//   return (
//     <section className="relative bg-[#f9f7f8] py-20 px-6 lg:px-20">
//       <div className="max-w-7xl mx-auto">
//         {/* Grid Layout (3 columns, 2 rows) */}
//         <div className="grid gap-6 lg:grid-cols-3">
//           {/* Section Header */}
//           <div className="bg-transparent p-6 rounded-2xl">
//             <h2 className="text-3xl font-heading font-bold text-gray-800">
//               Our Services
//             </h2>
//             <p className="mt-2 text-gray-600 font-body">
//               Discover what Ramil’s Creation can do to make your celebration truly unforgettable.
//             </p>
//             <button className="mt-6 bg-[#BE3144] text-white font-heading px-5 py-2 rounded-lg hover:bg-[#A52C3A] transition">
//               Let's Talk
//             </button>
//           </div>

//           {/* First Row - Gown/Suit Rental & Attire Purchase */}
//           {[services[0], services[1]].map((service, index) => {
//             const Icon = service.icon;
//             return (
//               <div
//                 key={index}
//                 className="rounded-2xl p-6 bg-white text-gray-800 border border-gray-200 shadow-md transform transition-all duration-500 hover:-translate-y-2 hover:rotate-1 hover:shadow-2xl hover:scale-105"
//               >
//                 <div className="flex items-center mb-4">
//                   <Icon className="w-8 h-8 text-pink-600" />
//                   <h3 className="ml-3 text-lg font-semibold font-heading">
//                     {service.title}
//                   </h3>
//                 </div>
//                 <p className="font-body text-sm leading-relaxed">
//                   {service.description}
//                 </p>
//                 <button className="mt-4 text-sm font-semibold underline text-pink-600">
//                   Read more
//                 </button>
//               </div>
//             );
//           })}

//           {/* Second Row - Makeup, Catering, Venue Decoration */}
//           {[services[2], services[3], services[4]].map((service, index) => {
//             const Icon = service.icon;
//             return (
//               <div
//                 key={index}
//                 className="rounded-2xl p-6 bg-white text-gray-800 border border-gray-200 shadow-md transform transition-all duration-500 hover:-translate-y-2 hover:-rotate-1 hover:shadow-2xl hover:scale-105"
//               >
//                 <div className="flex items-center mb-4">
//                   <Icon className="w-8 h-8 text-pink-600" />
//                   <h3 className="ml-3 text-lg font-semibold font-heading">
//                     {service.title}
//                   </h3>
//                 </div>
//                 <p className="font-body text-sm leading-relaxed">
//                   {service.description}
//                 </p>
//                 <button className="mt-4 text-sm font-semibold underline text-pink-600">
//                   Read more
//                 </button>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default ServicesSection;
'use client';

import { motion, Variants } from 'framer-motion';
import ButtonPrimary from '@/components/home/ButtonPrimary';
import { Brush, Flower2, Scissors, ShoppingBag, Utensils } from 'lucide-react';

const services = [
  {
    icon: Scissors,
    title: 'Gown / Suit Rental',
    description: 'Elegant gowns and suits for rent — perfect for weddings, debuts, and formal events.',
    image: '/images/gown.jpg',
  },
  {
    icon: ShoppingBag,
    title: 'Attire Purchase',
    description: 'Custom-made or ready-to-wear dresses and suits tailored to your taste and style.',
    image: '/images/debut.jpg',
  },
  {
    icon: Brush,
    title: 'Makeup',
    description: 'Professional makeup services to make you shine beautifully for any occasion.',
    image: '/images/makeup.jpg',
  },
  {
    icon: Utensils,
    title: 'Catering',
    description: 'Delicious and beautifully presented dishes for your special gatherings.',
    image: '/images/sweets.jpg',
  },
  {
    icon: Flower2,
    title: 'Venue Decoration',
    description: 'Elegant floral and venue designs that bring your dream event to life.',
    image: '/images/decoration.jpg',
  },
];

// Smooth scroll helper
const scrollToSection = (id: string) => {
  const section = document.querySelector(id);
  if (section) {
    const yOffset = -70;
    const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  } else {
    window.location.href = `/home${id}`;
  }
};

// ✅ Fixed type-safe variants
const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } }, // easeOut cubic-bezier
};

const ServicesSection = () => {
  return (
    <section id="services" className="relative px-6 py-30 lg:px-8">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 lg:grid-cols-2">
        {/* LEFT COLUMN */}
        <motion.div
          variants={fadeInVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          className="h-fit self-start lg:sticky lg:top-24 lg:pl-10"
        >
          <div>
            <h2 className="font-heading heading-3 text-black">Our Services</h2>
            <p className="mt-4 font-body body-medium text-gray-800">
              At Ramil’s Creation, we provide everything you need to bring your dream event to life — from attire and beauty to food and
              venue styling.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {[
              { label: 'Rentals', target: 'gown-suit-rental' },
              { label: 'Attire Purchase', target: 'attire-purchase' },
              { label: 'Hair & Makeup', target: 'makeup' },
              { label: 'Catering', target: 'catering' },
              { label: 'Venue Decoration', target: 'venue-decoration' },
            ].map((tag, i) => (
              <button
                key={i}
                onClick={() => {
                  const section = document.getElementById(tag.target);
                  if (section) {
                    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="body-xsmall rounded-full border border-pink-200 bg-pink-100 px-4 py-1.5 font-body text-pink-700 transition hover:bg-pink-200"
              >
                {tag.label}
              </button>
            ))}
          </div>

          <div className="body-medium w-full py-10 font-heading sm:flex-row sm:space-x-4">
            <ButtonPrimary onClick={() => scrollToSection('#packages')} className="w-full sm:mb-0 sm:w-auto">
              Explore Packages
            </ButtonPrimary>
          </div>
        </motion.div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col space-y-12">
          {services.map((service, index) => {
            const Icon = service.icon;
            const id = service.title.toLowerCase().replace(/[^a-z]+/g, '-');
            return (
              <motion.div
                key={index}
                id={id}
                variants={fadeInVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.2 }}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md transition-all duration-500 hover:shadow-2xl"
              >
                <div className="flex justify-center overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="h-[400px] w-full rounded-xl object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent transition duration-500 group-hover:from-black/70"></div>

                <div className="absolute bottom-0 transform p-6 text-white transition-all duration-500 group-hover:translate-y-[-5px]">
                  <div className="flex items-center gap-3">
                    <Icon className="h-7 w-7 text-pink-300" />
                    <h3 className="font-heading body-large font-semibold">{service.title}</h3>
                  </div>
                  <p className="mt-2 max-w-md font-body body-small text-gray-200">{service.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;



// 'use client';
// import { motion } from "framer-motion";
// import { Scissors, ShoppingBag, Brush, Utensils, Flower2 } from "lucide-react";

// const services = [
//   {
//     icon: Scissors,
//     title: "Gown / Suit Rental",
//     description:
//       "Elegant gowns and suits for rent — perfect for weddings, debuts, and formal events.",
//     image: "/images/gown.jpg",
//   },
//   {
//     icon: ShoppingBag,
//     title: "Attire Purchase",
//     description:
//       "Custom-made or ready-to-wear dresses and suits tailored to your taste and style.",
//     image: "/images/debut.jpg",
//   },
//   {
//     icon: Brush,
//     title: "Makeup",
//     description:
//       "Professional makeup services to make you shine beautifully for any occasion.",
//     image: "/images/makeup.jpg",
//   },
//   {
//     icon: Utensils,
//     title: "Catering",
//     description:
//       "Delicious and beautifully presented dishes for your special gatherings.",
//     image: "/images/sweets.jpg",
//   },
//   {
//     icon: Flower2,
//     title: "Venue Decoration",
//     description:
//       "Elegant floral and venue designs that bring your dream event to life.",
//     image: "/images/decoration.jpg",
//   },
// ];

// const fadeInVariants = {
//   hiddenLeft: { opacity: 0, x: -80 },
//   hiddenRight: { opacity: 0, x: 80 },
//   visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } },
// };

// const ServicesSection = () => {
//   return (
//     <section id="services" className="py-30 px-6 md:px-16 lg:px-28 relative overflow-hidden">
//       <div className="max-w-7xl mx-auto">
//         {/* Section Header */}
//         <div className="text-center mb-20">
//           <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-800">
//             Our Services
//           </h2>
//           <p className="text-gray-600 mt-4 max-w-2xl mx-auto font-body">
//             At Ramil’s Creation, every service is crafted to make your event
//             unforgettable — blending creativity, elegance, and quality.
//           </p>
//         </div>

//         {/* Services List */}
//         <div className="space-y-25">
//           {services.map((service, index) => {
//             const Icon = service.icon;
//             const isEven = index % 2 === 0;

//             return (
//               <motion.div
//                 key={index}
//                 className={`flex flex-col md:flex-row items-center gap-10 ${
//                   !isEven ? "md:flex-row-reverse" : ""
//                 }`}
//                 variants={fadeInVariants}
//                 initial={isEven ? "hiddenLeft" : "hiddenRight"}
//                 whileInView="visible"
//                 viewport={{ once: true, amount: 0.2 }}
//               >
//                 {/* Image */}
//                 <div className="w-full md:w-1/2 overflow-hidden rounded-3xl shadow-md group">
//                   <img
//                     src={service.image}
//                     alt={service.title}
//                     className="w-full h-[400px] object-cover rounded-3xl transition-transform duration-700 group-hover:scale-110"
//                   />
//                 </div>

//                 {/* Text Content */}
//                 <div className="w-full md:w-1/2">
//                   {/* Decorative background blur */}
//                   <div className="absolute -z-10 top-10 left-10 w-64 h-64 bg-pink-100 rounded-full blur-3xl opacity-40"></div>

//                   {/* Tagline */}
//                   <p className="text-red-700 italic font-body mb-2">
//                     “Elegance in every detail.”
//                   </p>

//                   <div className="flex items-center gap-3 mb-3 relative">
//                     <Icon className="w-7 h-7 text-red-700" />
//                     <h3 className="text-2xl md:text-3xl font-semibold font-heading text-gray-800 relative">
//                       {service.title}
//                       <span className="absolute -bottom-2 left-0 w-16 h-1 bg-[#BE3144] rounded-full"></span>
//                     </h3>
//                   </div>

//                   <p className="text-gray-600 font-body leading-relaxed">
//                     {service.description}
//                   </p>

//                   <button className="mt-6 bg-[#BE3144] text-white font-heading px-6 py-3 rounded-lg hover:bg-[#A52C3A] transition shadow-md hover:shadow-lg">
//                     Learn More
//                   </button>
//                 </div>
//               </motion.div>
//             );
//           })}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default ServicesSection;
