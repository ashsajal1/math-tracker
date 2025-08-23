import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { 
    DollarSign,
    CreditCard,
    Wallet,
    PieChart,
    TrendingUp,
    TrendingDown,
    WalletCards,
    Receipt
} from "lucide-react";

interface Particle {
    id: number;
    x: number;
    y: number;
    size: number;
    duration: number;
    delay: number;
    icon: JSX.Element;
    rotation: number;
}

export default function Particles() {
    const [particles, setParticles] = useState<Particle[]>([]);

    useEffect(() => {
        const icons = [
            <DollarSign key="dollar" className="w-6 h-6" />,
            <CreditCard key="credit-card" className="w-6 h-6" />,
            <Wallet key="wallet" className="w-6 h-6" />,
            <PieChart key="pie-chart" className="w-6 h-6" />,
            <TrendingUp key="trending-up" className="w-6 h-6" />,
            <TrendingDown key="trending-down" className="w-6 h-6" />,
            <WalletCards key="wallet-cards" className="w-6 h-6" />,
            <Receipt key="receipt" className="w-6 h-6" />
        ];

        // Generate particles with finance-related icons
        const newParticles = Array.from({ length: 15 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 16 + 12, // Increased size range
            duration: Math.random() * 20 + 15,
            delay: Math.random() * 5,
            icon: icons[Math.floor(Math.random() * icons.length)],
            rotation: Math.random() * 360
        }));
        setParticles(newParticles);
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((particle) => (
                <motion.div
                    key={particle.id}
                    className="absolute flex items-center justify-center"
                    style={{
                        width: particle.size * 2,
                        height: particle.size * 2,
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                    }}
                    animate={{
                        y: [0, -40, 0],
                        x: [0, Math.random() * 20 - 10, 0],
                        opacity: [0.3, 0.5, 0.3],
                        rotate: [particle.rotation, particle.rotation + 360],
                    }}
                    transition={{
                        duration: particle.duration,
                        delay: particle.delay,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                >
                    <div className="text-primary/40 drop-shadow-[0_0_8px_rgba(var(--primary),0.3)]">
                        {particle.icon}
                    </div>
                </motion.div>
            ))}
        </div>
    );
} 