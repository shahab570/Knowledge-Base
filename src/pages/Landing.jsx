import React from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Book, Shield, Zap, ArrowRight, Github } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import heroImage from '../assets/hero.png';
import '../styles/Landing.css';

const Landing = () => {
    const { login } = useAuth();

    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.8,
                ease: [0.21, 0.47, 0.32, 0.98]
            }
        })
    };

    const features = [
        {
            icon: <Book size={32} />,
            title: "Dynamic Organization",
            description: "Categorize and subcategorize your knowledge with an intuitive drag-and-drop interface."
        },
        {
            icon: <Zap size={32} />,
            title: "Lightning Fast",
            description: "Built with Vite and Firebase for real-time synchronization and instantaneous response."
        },
        {
            icon: <Shield size={32} />,
            title: "Secure & Private",
            description: "Your data is protected by Google Auth and dedicated Firebase security rules."
        }
    ];

    return (
        <div className="landing-page">
            <div className="bg-blobs">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
            </div>

            <nav className="landing-nav">
                <div className="nav-brand">
                    <BrainCircuit size={32} color="var(--color-accent)" />
                    <span>Knowledge Hub</span>
                </div>
                <button className="btn-hero secondary" style={{ padding: '0.6rem 1.5rem', fontSize: '1rem' }} onClick={login}>
                    Login
                </button>
            </nav>

            <header className="hero-section">
                <div className="hero-content">
                    <motion.div
                        custom={0}
                        initial="hidden"
                        animate="visible"
                        variants={fadeIn}
                        className="hero-badge"
                    >
                        Next-Gen Knowledge Management
                    </motion.div>

                    <motion.h1
                        custom={1}
                        initial="hidden"
                        animate="visible"
                        variants={fadeIn}
                        className="hero-title"
                    >
                        Organize Your <br />
                        <span style={{ color: 'var(--color-accent)' }}>Thoughts</span> with Style.
                    </motion.h1>

                    <motion.p
                        custom={2}
                        initial="hidden"
                        animate="visible"
                        variants={fadeIn}
                        className="hero-subtitle"
                    >
                        Experience the ultimate knowledge architecture. Minimalistic, powerful, and designed for the modern learner. All your notes, synced and structured perfectly.
                    </motion.p>

                    <motion.div
                        custom={3}
                        initial="hidden"
                        animate="visible"
                        variants={fadeIn}
                        className="hero-actions"
                    >
                        <button className="btn-hero primary" onClick={login}>
                            Get Started Free <ArrowRight size={20} />
                        </button>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="hero-visual"
                >
                    <div className="visual-container">
                        <img src={heroImage} alt="Future Knowledge Base" />
                        <div className="visual-overlay"></div>
                    </div>
                </motion.div>
            </header>

            <section className="features-section">
                <div className="section-header">
                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        Why Choose Knowledge Hub?
                    </motion.h2>
                    <p>Powerful features wrapped in a stunning interface.</p>
                </div>

                <div className="features-grid">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            custom={index}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeIn}
                            className="feature-card"
                        >
                            <div className="feature-icon">
                                {feature.icon}
                            </div>
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            <footer className="landing-footer">
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem' }}>
                    <a href="https://github.com/shahab570/Knowledge-Base" target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>
                        <Github size={24} />
                    </a>
                </div>
                <p>&copy; 2026 Knowledge Hub. Built for creators and learners.</p>
            </footer>
        </div>
    );
};

export default Landing;
