import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function SplashScreen() {
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Simulate loading process
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleGetStarted = () => {
    // Start exit animation
    setIsExiting(true);
    
    // Navigate after animation completes
    setTimeout(() => {
      navigate("/auth");
    }, 800); // Match this with the exit animation duration
  };

  return (
    <AnimatePresence>
      {!isExiting ? (
        <motion.div 
          className="min-h-screen bg-gradient-to-b from-primary/10 to-primary/5 flex flex-col items-center justify-center p-4"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            filter: "blur(10px)",
            transition: { duration: 0.8 }
          }}
        >
          <div className="w-full max-w-md flex flex-col items-center">
            {/* Logo with animation */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-8 w-44 h-44 rounded-full overflow-hidden shadow-lg"
            >
              <img
                src="/images/nasi-go-logo.jpeg"
                alt="Nasi Go Logo"
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* App name with animation - Fixed text without gradient blur */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-4xl font-bold mb-2 text-center text-primary"
            >
              Nasi Go
            </motion.h1>

            {/* Tagline with animation */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-xl text-neutral-600 mb-8 text-center"
            >
              Food Delivery in Papua, Indonesia
            </motion.p>

            {/* Get Started button with animation */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="w-full"
            >
              <Button
                onClick={handleGetStarted}
                className="w-full py-6 text-lg rounded-full bg-primary hover:opacity-90 transition-opacity"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </div>
                ) : (
                  "Get Started"
                )}
              </Button>
            </motion.div>

            {/* App version */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="mt-8 text-xs text-neutral-500"
            >
              Version 1.0.0
            </motion.p>
          </div>
        </motion.div>
      ) : (
        <div className="min-h-screen bg-white"></div>
      )}
    </AnimatePresence>
  );
}