'use client';

import { motion, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

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
        { value: 500, suffix: '+', label: 'Happy Clients' },
        { value: 30, suffix: '+', label: 'Years of Experience' },
        { value: 300, suffix: '+', label: 'Events Styled' },
    ];

    return (
        <section id="about" className="relative overflow-hidden px-6 py-24 pt-16 lg:px-24 lg:pt-0">
            <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
                {/* LEFT CONTENT */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="z-10 order-2 text-center lg:order-1 lg:text-left"
                >
                    <h2 className="heading-3 mb-6 font-heading">About Us</h2>
                    <p className="body-medium mb-10 font-body text-gray-800">
                        Ramil’s Creation began with a passion for beauty, creativity, and celebration. From simple dressmaking to full event styling,
                        our goal has always been to make every moment unforgettable. With years of experience in gowns, makeup, and event
                        coordination, we continue to bring elegance and confidence to every client we serve. <br />
                        <br />
                        What makes us different is our heart for personalization — every design, look, and setup is made with care to reflect each
                        client’s story. At Ramil’s Creation, we don’t just create looks; we create memories that last.
                    </p>

                    {/* METRICS */}
                    <div className="flex flex-wrap justify-center gap-8 lg:justify-start">
                        {metrics.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.2 }}
                                className="w-36 rounded-2xl bg-white/70 p-6 text-center shadow-md backdrop-blur-sm"
                            >
                                <h3 className="mb-2 font-heading text-3xl font-bold text-red-800">
                                    <Counter end={item.value} />
                                    {item.suffix}
                                </h3>
                                <p className="font-body text-sm text-gray-600">{item.label}</p>
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
                    <img src="/images/wedding6.webp" alt="Ramil’s Creation Studio" className="h-[450px] w-full rounded-3xl object-cover shadow-lg" />
                </motion.div>
            </div>
        </section>
    );
};

export default AboutUs;
