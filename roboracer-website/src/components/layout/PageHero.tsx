import Image from "next/image";

interface PageHeroProps {
    title: string;
    subtitle: string;
}

export default function PageHero({ title, subtitle }: PageHeroProps) {
    return (
        <section className="relative py-16 overflow-hidden">
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/hero_background.png"
                    alt={title}
                    fill
                    className="object-cover opacity-40"
                    priority
                />
                <div className="absolute inset-0 bg-brand-dark/70" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <p className="text-sm uppercase tracking-widest text-brand-blue mb-4">
                    Penn RoboRacer Club
                </p>
                <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-brand-blue to-brand-magenta">
                    {title}
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                    {subtitle}
                </p>
            </div>
        </section>
    );
}
