'use client';

import { motion, Variants } from 'framer-motion';
import ButtonPrimary from '@/components/home/ButtonPrimary';
import { Brush, Flower2, Scissors, ShoppingBag, Utensils } from 'lucide-react';

const services = [
  {
    icon: Scissors,
    title: 'Gown / Suit Rental',
    description: 'Elegant gowns and suits for rent — perfect for weddings, debuts, and formal events.',
    image: '/images/rental.webp',
  },
  {
    icon: ShoppingBag,
    title: 'Attire Purchase',
    description: 'Custom-made or ready-to-wear dresses and suits tailored to your taste and style.',
    image: '/images/attire.webp',
  },
  {
    icon: Brush,
    title: 'Makeup',
    description: 'Professional makeup services to make you shine beautifully for any occasion.',
    image: '/images/makeup.webp',
  },
  {
    icon: Utensils,
    title: 'Catering',
    description: 'Delicious and beautifully presented dishes for your special gatherings.',
    image: '/images/catering.webp',
  },
  {
    icon: Flower2,
    title: 'Venue Decoration',
    description: 'Elegant floral and venue designs that bring your dream event to life.',
    image: '/images/venuedecoration.webp',
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
                  <picture className="block w-full h-[400px]">
                    <source srcSet={`${service.image.replace('.webp', '-1600.webp')}`} media="(min-width: 1024px)" type="image/webp" />
                    <source srcSet={`${service.image.replace('.webp', '-1024.webp')}`} media="(min-width: 768px)" type="image/webp" />
                    <source srcSet={`${service.image.replace('.webp', '-640.webp')}`} media="(max-width: 767px)" type="image/webp" />
                    <img
                      src={service.image}
                      alt={service.title}
                      loading="lazy"
                      className="h-[400px] w-full object-cover rounded-xl transition-transform duration-700 group-hover:scale-105"
                    />
                  </picture>
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