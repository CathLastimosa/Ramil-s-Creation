'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

const Counter = ({ end, duration = 2 }: { end: number; duration?: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const step = end / (duration * 60);
      const interval = setInterval(() => {
        start += step;
        if (start >= end) {
          start = end;
          clearInterval(interval);
        }
        setCount(Math.floor(start));
      }, 1000 / 60);
    }
  }, [isInView, end, duration]);

  return <span ref={ref}>{count}</span>;
};

const AboutUs = () => {
  const metrics = [
    { value: 500, suffix: "+", label: "Happy Clients" },
    { value: 30, suffix: "+", label: "Years of Experience" },
    { value: 300, suffix: "+", label: "Events Styled" },
  ];

  return (
    <section
      id="about"
      className="relative py-24 px-6 lg:px-24 overflow-hidden"
    >
      <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        {/* LEFT CONTENT */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center lg:text-left z-10 order-2 lg:order-1"
        >
          <h2 className="font-heading heading-3 mb-6">
            About Us
          </h2>
          <p className="text-gray-800 font-body body-medium mb-10">
            Ramil’s Creation began with a passion for beauty, creativity, and
            celebration. From simple dressmaking to full event styling, our goal
            has always been to make every moment unforgettable. With years of
            experience in gowns, makeup, and event coordination, we continue to
            bring elegance and confidence to every client we serve. <br /><br />
            What makes us different is our heart for personalization — every
            design, look, and setup is made with care to reflect each client’s
            story. At Ramil’s Creation, we don’t just create looks; we create
            memories that last.
          </p>

          {/* METRICS */}
          <div className="flex flex-wrap justify-center lg:justify-start gap-8">
            {metrics.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-md p-6 text-center w-36"
              >
                <h3 className="text-3xl font-heading text-red-800 font-bold mb-2">
                  <Counter end={item.value} />{item.suffix}
                </h3>
                <p className="text-sm font-body text-gray-600">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* RIGHT IMAGE */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative order-1 lg:order-2"
        >
          <img
            src="/images/wedding6.webp"
            alt="Ramil’s Creation Studio"
            className="rounded-3xl shadow-lg object-cover w-full h-[450px]"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default AboutUs;