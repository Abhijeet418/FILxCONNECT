'use client';
import { useState } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { ArrowRight, Shield, Zap, ChevronDown, Globe, Clock, MessageSquare, CheckCircle, Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import logo from '../../public/logo.png';
export default function Landing() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const router=useRouter();

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        element?.scrollIntoView({ behavior: 'smooth' });
        setIsMenuOpen(false);
    };

    const stats = [
        { number: '100+', label: 'Active Users' },
        // { number: '50+', label: 'Countries' },
        { number: '99.9%', label: 'Uptime' },
        { number: 'FIL GGN', label: 'Exclusive' },
        { number: '100%', label: 'Satisfaction' }
    ];

    const features = [
        { title: 'Organization Reach', description: 'Connect with teams across the organization.', icon: <Globe className="h-6 w-6" /> },
        { title: 'Real-time Collaboration', description: 'Work together seamlessly', icon: <Clock className="h-6 w-6" /> },
        { title: 'Instant Messaging', description: 'Quick and efficient communication', icon: <MessageSquare className="h-6 w-6" /> },
        { title: 'Enterprise Security', description: 'Your data is safe with us', icon: <Shield className="h-6 w-6" /> },
    ];

    const handleAdminLogin = () => {
        window.location.href = 'http://localhost:3000';
      };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
            {/* Navigation */}
            <nav className="fixed w-full px-4 sm:px-6 lg:px-8 top-0 z-50 bg-transparent">
                <div className="max-w-7xl mx-auto pt-4">
                    <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-sm">
                        <div className="flex justify-between h-16 items-center px-4">
                            <div className="flex items-center space-x-3">
                                <img
                                    src="/logo.png"
                                    alt="FILxCONNECT"
                                    className="h-14 w-auto"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.onerror = null;
                                        target.src = '/'; // Optional fallback
                                    }}
                                />
                                <span className="text-2xl font-bold text-blue-600">FILxCONNECT</span>
                            </div>

                            {/* Desktop Navigation */}
                            <div className="hidden md:flex items-center space-x-4">
                                <button onClick={() => scrollToSection('about')} className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                    About
                                </button>
                                <button onClick={() => scrollToSection('features')} className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                    Features
                                </button>
                                <button onClick={() => scrollToSection('team')} className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                    Team
                                </button>
                                <button onClick={()=>router.push("/signup")} className="bg-blue-100 text-blue-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors">
                                    User Signup
                                </button>
                                <button onClick={handleAdminLogin} className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                                Admin Login
                                </button>
                            </div>

                            {/* Mobile Menu Button */}
                            <div className="md:hidden">
                                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 hover:text-gray-900">
                                    {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Navigation */}
                    <AnimatePresence>
                        {isMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="md:hidden mt-2 bg-white/60 backdrop-blur-md rounded-xl shadow-lg"
                            >
                                <div className="px-4 py-2 space-y-1">
                                    <button onClick={() => scrollToSection('about')} className="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
                                        About
                                    </button>
                                    <button onClick={() => scrollToSection('features')} className="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
                                        Features
                                    </button>
                                    <button onClick={() => scrollToSection('team')} className="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
                                        Team
                                    </button>
                                    <button className="block w-full px-3 py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200">
                                        User Signup
                                    </button>
                                    <button className="block w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                        Admin Login
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </nav>

            {/* Hero Section with Background */}
            <section
                className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative min-h-screen flex items-center"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=2940")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-blue-900/70 to-blue-900/90" />
                <div className="max-w-7xl mx-auto relative w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center"
                    >
                        <motion.h1
                            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 overflow-hidden"
                        >
                            {["Connect","Collaborate","Create"].map((word, index) => (
                                <motion.span
                                    key={index}
                                    className="inline-block mr-4"
                                    initial={{ x: 100, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{
                                        duration: 0.8,
                                        delay: index * 0.2,
                                        type: "spring",
                                        stiffness: 100
                                    }}
                                >
                                    {word.split("").map((char, charIndex) => (
                                        <motion.span
                                            key={charIndex}
                                            className="inline-block"
                                            initial={{ x: 50, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{
                                                duration: 0.5,
                                                delay: index * 0.2 + charIndex * 0.05,
                                                type: "spring",
                                                stiffness: 120
                                            }}
                                        >
                                            {char}
                                        </motion.span>
                                    ))}
                                </motion.span>
                            ))}
                        </motion.h1>
                        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                        FilxConnect simplifies professional networking, enabling seamless collaboration and meaningful connections within our organization
                        </p>
                        <div className="flex justify-center">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={()=>router.push("/signup")}
                                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                            >
                                Get Started
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </motion.button>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
                        >
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                                        className="text-3xl font-bold text-white mb-2"
                                    >
                                        {stat.number}
                                    </motion.div>
                                    <div className="text-blue-200">{stat.label}</div>
                                </div>
                            ))}
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.2, duration: 0.8 }}
                            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                        >
                            <button
                                onClick={() => scrollToSection('about')}
                                className="text-white animate-bounce"
                            >
                                <ChevronDown className="h-8 w-8" />
                            </button>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">About FILxCONNECT</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">FILxCONNECT is a platform that connects individuals for seamless interaction and knowledge sharing. It enables meaningful discussions, mentorship, and collaboration within a dynamic community. With engaging features, it fosters learning and professional growth</p>
                    </motion.div>

                    <div className="mt-16">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {['Security', 'Performance', 'Reliability'].map((tab, index) => (
                                <motion.button
                                    key={index}
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => setActiveTab(index)}
                                    className={`p-4 rounded-lg transition-colors ${activeTab === index
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {tab}
                                </motion.button>
                            ))}
                        </div>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="mt-8 p-6 bg-gray-50 rounded-lg"
                            >
                                {activeTab === 0 && (
                                    <div className="flex items-start space-x-4">
                                        <Shield className="h-6 w-6 text-blue-600 mt-1" />
                                        <div>
                                            <h3 className="text-lg font-semibold mb-2">Enterprise-Grade Security</h3>
                                            <p className="text-gray-600">
                                            FilxConnect keeps your data safe with strong encryption, secure login methods, and strict access controls.
                                             It constantly monitors for threats, protects stored data, and prevents unauthorized access to ensure privacy and security.
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {activeTab === 1 && (
                                    <div className="flex items-start space-x-4">
                                        <Zap className="h-6 w-6 text-blue-600 mt-1" />
                                        <div>
                                            <h3 className="text-lg font-semibold mb-2">Lightning Fast Performance</h3>
                                            <p className="text-gray-600">
                                            FilxConnect is optimized for speed and efficiency, ensuring seamless interactions and quick response times. 
                                            With a scalable architecture, it delivers a smooth experience even under high user traffic.
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {activeTab === 2 && (
                                    <div className="flex items-start space-x-4">
                                        <CheckCircle className="h-6 w-6 text-blue-600 mt-1" />
                                        <div>
                                            <h3 className="text-lg font-semibold mb-2">99.9% Uptime Guarantee</h3>
                                            <p className="text-gray-600">
                                            FilxConnect ensures uninterrupted access with a robust infrastructure, maintaining high availability and minimal downtime. 
                                                Our platform is built to handle failures gracefully, keeping your connections secure and active at all times.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                    >
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                whileHover={{ y: -5 }}
                                className="p-6 bg-white rounded-xl shadow-md"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <div className="mb-4 text-blue-600">{feature.icon}</div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Team Section */}
            <section id="team" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center"
                    >
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Visionaries</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
                            Meet the talented individuals who are revolutionizing team collaboration
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
                            {[
                                "/Divyansh_photo1[1].jpg",
                                "/Sanskar Sisodia.png",
                                "/passport photo.jpg",
                                "/IMG_3941.PNG",
                                "/abhijeet1.png"
                            ].map((image, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    whileHover={{ scale: 1.1 }}
                                    className="relative group"
                                >
                                    <div className="aspect-square rounded-full overflow-hidden shadow-lg">
                                        <img
                                            src={image}
                                            alt={`Team member ${index + 1}`}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                        />
                                    </div>
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        whileHover={{ opacity: 1 }}
                                        className="absolute inset-0 bg-blue-600/80 rounded-full flex items-center justify-center"
                                    >
                                        <div className="text-white text-center p-4">
                                            <p className="font-semibold">
                                                {index === 0 ? "Divyansh Goyal" : 
                                                 index === 1 ? "Sanskar Sisodia" : 
                                                 index === 2 ? "Aarnab Dutta" :
                                                 index === 3 ? "Asmitha Bhavya" :
                                                 index === 4 ? "Abhijeet Chatterjee" : "Team Member"}
                                            </p>
                                            <p className="text-sm">
                                                {index === 0 ? "Database/Project Manager" : 
                                                 index === 1 ? "Backend, Testing & Deployment" : 
                                                 index === 2 ? "Team Lead & Frontend Developer" :
                                                 index === 3 ? "Frontend Developer" :
                                                 index === 4 ? "Backend & Integration" : "Role"}
                                            </p>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-blue-600 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-blue-400 to-blue-600" />
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                            Ready to transform your workflow?
                        </h2>
                        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                            Join thousands of teams already using FILxCONNECT to streamline their projects.
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={()=>router.push("/signup")}
                            className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors"
                        >
                            Get Started
                        </motion.button>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
