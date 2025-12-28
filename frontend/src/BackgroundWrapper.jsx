import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const BackgroundWrapper = ({ children }) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth spring animation for background movement
    const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
    const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            const { clientX, clientY } = e;
            const moveX = (clientX - window.innerWidth / 2) / 20;
            const moveY = (clientY - window.innerHeight / 2) / 20;
            mouseX.set(moveX);
            mouseY.set(moveY);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-slate-50 font-sans text-slate-900">
            {/* Aurora Background Layer */}
            <div className="fixed inset-0 z-0 opacity-60 pointer-events-none">
                <motion.div
                    style={{ x: springX, y: springY }}
                    className="absolute inset-0 w-[150%] h-[150%] -left-[25%] -top-[25%]"
                >
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.15),transparent_50%)] animate-pulse-slow" />
                    <div className="absolute top-[20%] left-[20%] w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-[100px] mix-blend-multiply animate-blob" />
                    <div className="absolute top-[20%] right-[20%] w-[500px] h-[500px] bg-purple-400/20 rounded-full blur-[100px] mix-blend-multiply animate-blob animation-delay-2000" />
                    <div className="absolute -bottom-[20%] left-[40%] w-[600px] h-[600px] bg-pink-400/20 rounded-full blur-[100px] mix-blend-multiply animate-blob animation-delay-4000" />
                </motion.div>
                <div className="absolute inset-0 bg-white/30 backdrop-blur-[100px]" />
            </div>

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};

export default BackgroundWrapper;
