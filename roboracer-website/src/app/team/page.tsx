import { Github, Linkedin, Mail } from "lucide-react";

const teamMembers = [
    {
        name: "First Last",
        role: "Placeholder Role",
        image: "/api/placeholder/400/400", // Placeholder
        bio: "Electrical Engineering",
        socials: {
            github: "#",
            linkedin: "#",
            email: "#"
        }
    },
    {
        name: "First Last",
        role: "Placeholder Role",
        image: "/api/placeholder/400/400", // Placeholder
        bio: "Electrical Engineering",
        socials: {
            github: "#",
            linkedin: "#",
            email: "#"
        }
    },
    {
        name: "First Last",
        role: "Placeholder Role",
        image: "/api/placeholder/400/400", // Placeholder
        bio: "Electrical Engineering",
        socials: {
            github: "#",
            linkedin: "#",
            email: "#"
        }
    },
    {
        name: "First Last",
        role: "Placeholder Role",
        image: "/api/placeholder/400/400", // Placeholder
        bio: "Electrical Engineering",
        socials: {
            github: "#",
            linkedin: "#",
            email: "#"
        }
    },
];

export default function TeamPage() {
    return (
        <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-brand-blue to-brand-magenta">
                        Our Team
                    </h1>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                        The students driving RoboRacer-mini forward.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {teamMembers.map((member, index) => (
                        <div key={index} className="bg-white/5 rounded-2xl overflow-hidden border border-white/10 hover:border-brand-blue/50 transition-all duration-300 group">
                            <div className="aspect-square bg-gray-800 relative overflow-hidden">
                                {/* Placeholder for image */}
                                <div className="absolute inset-0 flex items-center justify-center text-gray-600 bg-gray-900">
                                    <span className="text-6xl font-bold opacity-20">{member.name[0]}</span>
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                                <p className="text-brand-blue text-sm mb-4">{member.role}</p>
                                <p className="text-gray-400 text-sm mb-6">{member.bio}</p>

                                <div className="flex space-x-4">
                                    <a href={member.socials.github} className="text-gray-500 hover:text-white transition-colors">
                                        <Github size={18} />
                                    </a>
                                    <a href={member.socials.linkedin} className="text-gray-500 hover:text-white transition-colors">
                                        <Linkedin size={18} />
                                    </a>
                                    <a href={member.socials.email} className="text-gray-500 hover:text-white transition-colors">
                                        <Mail size={18} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
