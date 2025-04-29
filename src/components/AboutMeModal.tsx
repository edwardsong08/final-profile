// src/components/AboutMeModal.tsx
import { motion, AnimatePresence } from 'framer-motion';

interface AboutMeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutMeModal({ isOpen, onClose }: AboutMeModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gray-800 text-gray-100 rounded-2xl shadow-lg max-w-3xl w-full mx-4 p-8 overflow-y-auto max-h-[90vh]"
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-6 text-gray-400 hover:text-white text-2xl"
            >
              &times;
            </button>

            <h2 className="text-3xl font-semibold text-center mb-8">About Me</h2>

            {/* First image placeholder */}
            <div className="w-32 h-32 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-gray-300">Photo</span>
            </div>
            <p className="text-lg text-gray-300 leading-relaxed mb-8 text-center">
              Before software development, I've had the opportunity to explore many of my interests,
              including an educational background in engineering and political science and a professional
              background in education, writing, and law.
            </p>

            {/* Second image placeholder */}
            <div className="w-32 h-32 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-gray-300">Photo</span>
            </div>
            <p className="text-lg text-gray-300 leading-relaxed mb-8 text-center">
              Teaching has always been a rewarding experience, and watching my students grow continues to inspire me.
              I will forever remain a teacher and a student—nurturing to others and unafraid to ask questions.
              The challenges I have faced in law have taught me that a methodical approach will always yield a solution,
              so I will apply this to every challenge that comes my way.
              Through writing comedy, I discovered that there are always new, valid perspectives,
              and I will remain vigilantly open-minded.
              Ultimately, these are the principles by which I live and approach software development.
            </p>

            {/* Third image placeholder */}
            <div className="w-32 h-32 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-gray-300">Photo</span>
            </div>
            <p className="text-lg text-gray-300 leading-relaxed text-center">
              I am passionate about political, educational, and judicial reforms.
              My free time is spent hiking with my dog, tampering as an amateur guitar luthier,
              reading, or exploring new foods in the area.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
