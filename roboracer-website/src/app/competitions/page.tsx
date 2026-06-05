import Image from "next/image";
import { Award, ExternalLink, Github, Medal, Play, Trophy } from "lucide-react";

export default function CompetitionsPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero_background.png"
            alt="RoboRacer Competitions"
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
            Competitions
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            We compete in autonomous racing challenges worldwide — testing our
            algorithms against the best teams in simulation and on the track.
          </p>
        </div>
      </section>

      <div className="bg-gradient-to-b from-brand-dark to-brand-[#ec4899]">
        {/* ICRA 2026 */}
        <section className="py-24 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <span className="text-xs uppercase tracking-widest px-3 py-1 rounded-full bg-brand-blue/10 text-brand-blue border border-brand-blue/30">
                Featured
              </span>
              <span className="text-gray-400">ICRA 2026</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              ICRA 2026 Simulation Competition
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl leading-relaxed mb-12">
              Penn RoboRacer Club participated in the ICRA 2026 autonomous
              racing simulation challenge — a global competition where teams
              develop and deploy racing agents in a high-fidelity simulator.
              Competing against universities from around the world, we placed{" "}
              <span className="text-white font-semibold">9th overall</span>.
            </p>

            {/* Results highlight */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
              <div className="p-8 rounded-3xl bg-white/5 border border-brand-blue/30 text-center">
                <Medal className="h-10 w-10 text-brand-blue mx-auto mb-4" />
                <p className="text-4xl font-bold text-white mb-2">9th</p>
                <p className="text-sm uppercase tracking-wider text-gray-400">
                  Overall Placement
                </p>
              </div>
              <div className="p-8 rounded-3xl bg-white/5 border border-brand-magenta/30 text-center">
                <Trophy className="h-10 w-10 text-brand-magenta mx-auto mb-4" />
                <p className="text-4xl font-bold text-white mb-2">Global</p>
                <p className="text-sm uppercase tracking-wider text-gray-400">
                  International Field
                </p>
              </div>
              <div className="p-8 rounded-3xl bg-white/5 border border-white/10 text-center">
                <Award className="h-10 w-10 text-brand-blue mx-auto mb-4" />
                <p className="text-4xl font-bold text-white mb-2">Sim</p>
                <p className="text-sm uppercase tracking-wider text-gray-400">
                  Racing Challenge
                </p>
              </div>
            </div>

            {/* About the competition */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-bold mb-6">The Challenge</h3>
                <p className="text-lg text-gray-400 leading-relaxed mb-4">
                  Teams built autonomous racing stacks spanning perception,
                  localization, planning, and control — all running in simulation
                  against complex track layouts and competitive opponents.
                </p>
                <p className="text-lg text-gray-400 leading-relaxed">
                  The competition pushed us to iterate quickly on algorithm
                  design, tune for race-day performance, and document our
                  approach for reproducibility.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-6">Our Approach</h3>
                <p className="text-lg text-gray-400 leading-relaxed mb-4">
                  Our stack combined robust perception pipelines with adaptive
                  planning strategies tuned for high-speed racing scenarios.
                  Simulation let us test edge cases and race strategies before
                  committing to hardware.
                </p>
                <p className="text-lg text-gray-400 leading-relaxed">
                  Finishing 9th overall validated months of collaborative
                  engineering — and gave us a strong foundation to carry into
                  RoboRacer-mini and future competitions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Resources */}
        <section className="py-24 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Resources</h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Documentation, code, and footage from our competition run.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-10 rounded-3xl bg-brand-dark border-2 border-brand-blue/30">
                <div className="w-14 h-14 rounded-xl bg-brand-blue/10 flex items-center justify-center mb-6">
                  <Github className="h-8 w-8 text-brand-blue" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Tech Stack & Documentation</h3>
                <p className="text-lg text-gray-400 mb-6">
                  Our full competition stack — architecture, setup guides, and
                  implementation details — will be published on GitHub.
                </p>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 text-brand-blue hover:text-brand-blue-hover font-medium transition-colors"
                >
                  GitHub repository
                  <ExternalLink size={16} />
                </a>
                <p className="text-sm text-gray-500 mt-3">Link coming soon</p>
              </div>

              <div className="p-10 rounded-3xl bg-brand-dark border-2 border-brand-magenta/30">
                <div className="w-14 h-14 rounded-xl bg-brand-magenta/10 flex items-center justify-center mb-6">
                  <Play className="h-8 w-8 text-brand-magenta" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Competition Run Videos</h3>
                <p className="text-lg text-gray-400 mb-6">
                  Watch our agents navigate the track — qualifying laps, race
                  highlights, and key moments from the ICRA 2026 simulation run.
                </p>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 text-brand-magenta hover:text-brand-magenta-hover font-medium transition-colors"
                >
                  View videos
                  <ExternalLink size={16} />
                </a>
                <p className="text-sm text-gray-500 mt-3">Links coming soon</p>
              </div>
            </div>
          </div>
        </section>

        {/* Future competitions */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">What&apos;s Next</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              We are preparing for upcoming simulation and physical racing events.
              As we lock in new competitions, they will be added here — along with
              results, repos, and race footage.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
