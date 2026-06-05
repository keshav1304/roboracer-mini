import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Code2, FlaskConical, Trophy, Users, Zap } from "lucide-react";
import ClubHeroTitle from "@/components/home/ClubHeroTitle";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero_background.png"
            alt="Penn RoboRacer Club"
            fill
            className="object-cover opacity-60"
            priority
          />
          <div className="absolute inset-0 bg-brand-dark/50" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ClubHeroTitle />
          <p className="text-2xl md:text-3xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            A student robotics collective at the University of Pennsylvania
            building, racing, and open-sourcing autonomous racing platforms.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/competitions"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-brand-blue hover:bg-brand-blue-hover text-white font-semibold transition-colors duration-200"
            >
              Our Competitions
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/roboracer-mini"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full border border-white/20 hover:border-brand-magenta/50 hover:bg-white/5 text-white font-semibold transition-colors duration-200"
            >
              RoboRacer-mini Project
            </Link>
          </div>
        </div>
      </section>

      <div className="bg-gradient-to-b from-brand-dark to-brand-[#ec4899]">
        {/* About */}
        <section className="py-24 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">Who We Are</h2>
                <p className="text-xl text-gray-300 leading-relaxed mb-6">
                  Penn RoboRacer Club brings together students across engineering,
                  computer science, and robotics who share a passion for autonomous
                  vehicles and competitive racing.
                </p>
                <p className="text-lg text-gray-400 leading-relaxed">
                  We compete in international simulation challenges, develop
                  accessible hardware platforms for the next generation of
                  roboticists, and share everything we learn along the way.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-8 rounded-3xl bg-white/5 border border-brand-blue/30 text-center">
                  <p className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-blue to-brand-magenta mb-2">
                    9th
                  </p>
                  <p className="text-sm uppercase tracking-wider text-gray-400">
                    ICRA 2026 Sim
                  </p>
                </div>
                <div className="p-8 rounded-3xl bg-white/5 border border-brand-magenta/30 text-center">
                  <p className="text-4xl font-bold text-white mb-2">Open</p>
                  <p className="text-sm uppercase tracking-wider text-gray-400">
                    Source First
                  </p>
                </div>
                <div className="col-span-2 p-8 rounded-3xl bg-white/5 border border-white/10">
                  <p className="text-lg text-gray-300 text-center">
                    From simulation to real-world racing — we bridge research,
                    competition, and hands-on engineering at Penn.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What We Do */}
        <section className="py-24 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">What We Do</h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Three pillars that define how we operate as a club.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Link
                href="/competitions"
                className="group p-10 rounded-3xl bg-white/5 border border-brand-blue/50 hover:border-brand-blue transition-colors duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-brand-blue/10 flex items-center justify-center mb-8">
                  <Trophy className="h-8 w-8 text-brand-blue" />
                </div>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-brand-blue transition-colors">
                  Compete
                </h3>
                <p className="text-lg text-gray-400 mb-6">
                  We enter international autonomous racing competitions — pushing
                  our algorithms against teams from around the world.
                </p>
                <span className="inline-flex items-center gap-2 text-brand-blue font-medium">
                  View competitions <ArrowRight size={16} />
                </span>
              </Link>

              <Link
                href="/roboracer-mini"
                className="group p-10 rounded-3xl bg-white/5 border border-brand-magenta/50 hover:border-brand-magenta transition-colors duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-brand-magenta/10 flex items-center justify-center mb-8">
                  <FlaskConical className="h-8 w-8 text-brand-magenta" />
                </div>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-brand-magenta transition-colors">
                  Build
                </h3>
                <p className="text-lg text-gray-400 mb-6">
                  RoboRacer-mini is our open-source platform — a smaller, more
                  affordable autonomous racer for students everywhere.
                </p>
                <span className="inline-flex items-center gap-2 text-brand-magenta font-medium">
                  Explore the project <ArrowRight size={16} />
                </span>
              </Link>

              <Link
                href="/team"
                className="group p-10 rounded-3xl bg-white/5 border border-brand-blue/50 hover:border-brand-blue transition-colors duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-brand-blue/10 flex items-center justify-center mb-8">
                  <Users className="h-8 w-8 text-brand-blue" />
                </div>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-brand-blue transition-colors">
                  Collaborate
                </h3>
                <p className="text-lg text-gray-400 mb-6">
                  Workshops, hack nights, and shared documentation — we grow
                  together as a community of builders and racers.
                </p>
                <span className="inline-flex items-center gap-2 text-brand-blue font-medium">
                  Meet the team <ArrowRight size={16} />
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* Highlights */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Current Focus</h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Where the club is putting its energy right now.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-10 rounded-3xl bg-brand-dark border-2 border-brand-blue/30">
                <div className="flex items-center gap-4 mb-6">
                  <Zap className="h-8 w-8 text-brand-blue" />
                  <h3 className="text-2xl font-bold">ICRA 2026 Simulation</h3>
                </div>
                <p className="text-lg text-gray-400 mb-4">
                  We competed in the ICRA 2026 autonomous racing simulation
                  challenge, placing 9th overall among international teams.
                </p>
                <Link
                  href="/competitions"
                  className="text-brand-blue hover:text-brand-blue-hover font-medium inline-flex items-center gap-2"
                >
                  Read the full story <ArrowRight size={16} />
                </Link>
              </div>

              <div className="p-10 rounded-3xl bg-brand-dark border-2 border-brand-magenta/30">
                <div className="flex items-center gap-4 mb-6">
                  <Code2 className="h-8 w-8 text-brand-magenta" />
                  <h3 className="text-2xl font-bold">RoboRacer-mini Platform</h3>
                </div>
                <p className="text-lg text-gray-400 mb-4">
                  Developing a 1/16-scale, vision-based autonomous racer — open
                  hardware, open software, built for high-school and undergraduate
                  learners.
                </p>
                <Link
                  href="/roboracer-mini"
                  className="text-brand-magenta hover:text-brand-magenta-hover font-medium inline-flex items-center gap-2"
                >
                  See platform details <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
