// import { motion } from 'framer-motion';
// export default function WavesBackground() {
//     return (
//         <div className="relative w-full h-58">
//             <img 
//                 className="absolute top-0 left-0 w-full rotate-180 z-0" 
//                 src="/images/Vector1.svg" 
//                 alt="wave 1" 
//             />
//             <img 
//                 className="absolute top-0 left-0 w-full rotate-180 z-10" 
//                 src="/images/Vector2.svg" 
//                 alt="wave 2" 
//             />
//             <img 
//                 className="absolute top-0 left-0 w-full rotate-180 z-20" 
//                 src="/images/Vector3.svg" 
//                 alt="wave 3" 
//             />
//         </div>
//     );
// }

'use client';

import { motion } from 'framer-motion';
import React from 'react';

const WavesBackground: React.FC = () => {
  return (
    <div className="relative w-full h-48 overflow-hidden bg-transparent rotate-180">
      {/* Wave 1 */}
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 170"
        className="absolute bottom-0 left-0 w-full h-full"
        preserveAspectRatio="none"
      >
        <motion.path
          fill="#FFB7C1"
          d="M1440 0.5L1392 27.962C1332 59.0512 1200 58.0149 1080 70.4505C960 82.8861 840 45.5792 720 39.3614C600 33.1436 480 58.0149 360 58.0149C240 58.0149 263.5 13.9719 141 5.16337L0 13.9719V157.5H1440V0.5Z"
          animate={{
            d: [
              "M1440 0.5L1392 27.962C1332 59.0512 1200 58.0149 1080 70.4505C960 82.8861 840 45.5792 720 39.3614C600 33.1436 480 58.0149 360 58.0149C240 58.0149 263.5 13.9719 141 5.16337L0 13.9719V157.5H1440V0.5Z",
              "M1440 2L1392 25C1332 55 1200 60 1080 68C960 76 840 48 720 42C600 36 480 60 360 60C240 60 263.5 15 141 8L0 14V157.5H1440V2Z",
              "M1440 0.5L1392 27.962C1332 59.0512 1200 58.0149 1080 70.4505C960 82.8861 840 45.5792 720 39.3614C600 33.1436 480 58.0149 360 58.0149C240 58.0149 263.5 13.9719 141 5.16337L0 13.9719V157.5H1440V0.5Z",
            ],
          }}
          transition={{
            duration: 2.5,
            ease: 'easeInOut',
            repeat: Infinity,
          }}
        />
      </motion.svg>

      {/* Wave 2 */}
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 170"
        className="absolute bottom-0 left-0 w-full h-full"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF8596" />
            <stop offset="100%" stopColor="#ED4A60" />
          </linearGradient>
        </defs>

        <motion.path
          fill="url(#waveGradient)"
          d="M0 21.9138L39.6 35.922C80.4 49.9302 159.6 77.9466 240 67.4405C320.4 56.9343 399.6 7.9056 480 0.901493C560.4 -6.10261 639.6 28.9179 720 63.9384C800.4 98.9589 879.6 113.869 960 113.869C1040.4 113.869 1119.6 98.9589 1200 88.4528C1280.4 77.9466 1359.6 91.9548 1400.4 98.9589L1440 105.963V169H0V21.9138Z"
          animate={{
            d: [
              "M0 21.9138L39.6 35.922C80.4 49.9302 159.6 77.9466 240 67.4405C320.4 56.9343 399.6 7.9056 480 0.901493C560.4 -6.10261 639.6 28.9179 720 63.9384C800.4 98.9589 879.6 113.869 960 113.869C1040.4 113.869 1119.6 98.9589 1200 88.4528C1280.4 77.9466 1359.6 91.9548 1400.4 98.9589L1440 105.963V169H0V21.9138Z",
              "M0 25L39.6 40C80.4 55 159.6 82 240 72C320.4 62 399.6 10 480 4C560.4 -2 639.6 30 720 65C800.4 100 879.6 115 960 115C1040.4 115 1119.6 100 1200 90C1280.4 80 1359.6 95 1400.4 100L1440 110V169H0V25Z",
              "M0 21.9138L39.6 35.922C80.4 49.9302 159.6 77.9466 240 67.4405C320.4 56.9343 399.6 7.9056 480 0.901493C560.4 -6.10261 639.6 28.9179 720 63.9384C800.4 98.9589 879.6 113.869 960 113.869C1040.4 113.869 1119.6 98.9589 1200 88.4528C1280.4 77.9466 1359.6 91.9548 1400.4 98.9589L1440 105.963V169H0V21.9138Z",
            ],
          }}
          transition={{
            duration: 2.5,
            ease: 'easeInOut',
            repeat: Infinity,
          }}
        />
      </motion.svg>

      {/* Wave 3 */}
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 170"
        className="absolute top-25 left-0 w-full h-full z-10"
        preserveAspectRatio="none"
      >
        <motion.path
          fill="#FFECEC"
          d="M1440 39.7806L1380 44.8025C1320 49.8244 1200 59.8683 1080 56.5204C960 53.1724 840 36.4326 720 33.0846C600 29.7367 480 49.768 360 34.7586C240 19.7492 122.5 27.6489 70 16.9279L0 0V90H60C120 90 240 90 360 90C480 90 600 90 720 90C840 90 960 90 1080 90C1200 90 1320 90 1380 90H1440V39.7806Z"
          animate={{
            d: [
              "M1440 39.7806L1380 44.8025C1320 49.8244 1200 59.8683 1080 56.5204C960 53.1724 840 36.4326 720 33.0846C600 29.7367 480 49.768 360 34.7586C240 19.7492 122.5 27.6489 70 16.9279L0 0V90H1440V39.7806Z",
              "M1440 44L1380 48C1320 52 1200 62 1080 59C960 56 840 40 720 36C600 32 480 52 360 37C240 22 122.5 29 70 18L0 0V90H1440V44Z",
              "M1440 39.7806L1380 44.8025C1320 49.8244 1200 59.8683 1080 56.5204C960 53.1724 840 36.4326 720 33.0846C600 29.7367 480 49.768 360 34.7586C240 19.7492 122.5 27.6489 70 16.9279L0 0V90H1440V39.7806Z",
            ],
          }}
          transition={{
            duration: 2,
            ease: 'easeInOut',
            repeat: Infinity,
          }}
        />
      </motion.svg>
    </div>
  );
};

export default WavesBackground;
