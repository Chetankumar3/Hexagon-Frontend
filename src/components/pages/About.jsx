import { GraduationCap, Lightbulb, Rocket, Users, BookOpen, Globe } from "lucide-react";

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white text-center pt-0">

            {/* Hero Section */}
            <div 
                className="w-full flex flex-col items-center justify-center relative h-[110vh] sm:min-h-[600px]"
                style={{
                    backgroundImage: 'url(/campus.jpeg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                {/* Overlay for better text readability */}
                <div className="absolute inset-0 bg-black/40"></div>
                
                {/* Content */}
                <div className="max-w-6xl w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-20 relative z-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-black/80 rounded-full mb-6 backdrop-blur-sm">
                        <GraduationCap className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-5xl font-bold text-white mb-6 drop-shadow-lg">
                        Redefining Education for the Future
                    </h1>
                    <p className="text-xl text-white/95 mx-auto leading-relaxed drop-shadow-md">
                        Welcome to a revolutionary platform where you design your own degree.
                        Break free from traditional constraints and create a multidisciplinary
                        education that matches your unique vision.
                    </p>
                </div>
            </div>

            {/* Stats Section */}
            <div className="w-full flex flex-col items-center justify-center bg-white">
                <div className="max-w-6xl w-full px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 sm:grid-cols-4 gap-8">
                    {[
                        { label: "Courses", value: "120+" },
                        { label: "Universities", value: "15+" },
                        { label: "Projects", value: "500+" },
                        { label: "Students", value: "50K+" },
                    ].map((stat, idx) => (
                        <div key={idx} className="text-center">
                            <p className="text-4xl font-bold text-gray-900">{stat.value}</p>
                            <p className="text-gray-600">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Mission Section */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
                <div>
                    <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
                    <p className="text-lg text-gray-600 mb-4 leading-relaxed">
                        Inspired by the National Education Policy 2020, we champion an education that is holistic,
                        multidisciplinary, and deeply rooted in India’s intellectual heritage.
                        Our mission is to nurture polymaths—learners who draw from science, art, technology, and philosophy
                        to create solutions that matter.
                    </p>
                    <p className="text-lg text-gray-600 mb-4 leading-relaxed">
                        We reject rigid academic silos. Instead, we celebrate freedom to explore.
                        Here, Computer Science can converse with Sanskrit, Engineering can collaborate with Fine Arts,
                        and Design can integrate with Environmental Studies.
                        Every learner becomes a creator of knowledge—self-reliant, purpose-driven, and globally competent.
                    </p>
                    <p className="text-lg text-gray-600 leading-relaxed">
                        This is education reimagined for Aatmanirbhar Bharat—modern yet rooted, innovative yet mindful.
                        Shaped by NEP 2020, powered by curiosity, and anchored in indigenous wisdom,
                        this is your journey to design the future, your way.
                    </p>

                </div>
            </div>


            <div className="w-full flex flex-col items-center justify-center bg-gray-50">
                <div className="max-w-6xl w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">
                        Why Choose This Platform
                    </h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
                        {[
                            {
                                icon: <Lightbulb className="w-10 h-10 text-gray-600" />,
                                title: "Custom Degree Path",
                                text: "Combine courses across disciplines to build your unique degree structure."
                            },
                            {
                                icon: <Users className="w-10 h-10 text-gray-600" />,
                                title: "Collaborative Learning",
                                text: "Connect with peers, professors, and mentors globally for interdisciplinary growth."
                            },
                            {
                                icon: <BookOpen className="w-10 h-10 text-gray-600" />,
                                title: "Modular Credits",
                                text: "Earn transferable credits through projects and verified assessments."
                            },
                            {
                                icon: <Rocket className="w-10 h-10 text-gray-600" />,
                                title: "Career Integration",
                                text: "Learn by doing through industry-linked internships and practical projects."
                            },
                            {
                                icon: <Globe className="w-10 h-10 text-gray-600" />,
                                title: "Global Access",
                                text: "Take part in courses offered by universities around the world."
                            },
                            {
                                icon: <GraduationCap className="w-10 h-10 text-gray-600" />,
                                title: "Outcome Driven",
                                text: "Graduate with a skill-based portfolio instead of rote-based exams."
                            },
                        ].map((item, idx) => (
                            <div
                                key={idx}
                                className="flex flex-col items-center text-center bg-white rounded-2xl shadow-md p-8 hover:shadow-lg transition-all"
                            >
                                {item.icon}
                                <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">
                                    {item.title}
                                </h3>
                                <p className="text-gray-600 text-sm">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer Section */}
            <div className="w-full flex flex-col items-center justify-center bg-black text-white py-6">
                <p className="text-sm">© 2025 Custom Degree Platform. All rights reserved.</p>
            </div>

        </div>
    );
}