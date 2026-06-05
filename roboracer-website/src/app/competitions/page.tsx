import PageHero from "@/components/layout/PageHero";
import {
  Crosshair,
  ExternalLink,
  Github,
  Map,
  Medal,
  Route,
  ScanLine,
  SlidersHorizontal,
  Trophy,
} from "lucide-react";

const pipelineSteps = [
  {
    step: 1,
    title: "LiDAR Scans",
    icon: ScanLine,
    description: "Laser range scans capture the track layout in real time.",
  },
  {
    step: 2,
    title: "Scan Matching",
    icon: Crosshair,
    description: "Consecutive scans are aligned to estimate how the car is moving.",
  },
  {
    step: 3,
    title: "SLAM Toolbox",
    icon: Map,
    description: "Matched scans are fused into a full map of the track.",
  },
  {
    step: 4,
    title: "Particle Filter Localization",
    icon: Crosshair,
    description: "ROS particle filters track the car's pose on that map during the race.",
  },
  {
    step: 5,
    title: "Raceline Optimization",
    icon: Route,
    description: "The fastest racing line around the track is computed.",
  },
  {
    step: 6,
    title: "Pure Pursuit Control",
    icon: SlidersHorizontal,
    description: "Steering and throttle follow a lookahead point on the raceline.",
  },
];

export default function CompetitionsPage() {
  return (
    <div className="flex flex-col">
      <PageHero
        title="Competitions"
        subtitle="We compete in autonomous racing challenges worldwide, testing our algorithms against the best teams in simulation and on the track."
        compact
      />

      <div className="bg-gradient-to-b from-brand-dark to-brand-[#ec4899]">
        <section className="py-14 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto space-y-12">

            {/* ICRA 2026 */}
            <div>
              <p className="text-sm uppercase tracking-widest text-brand-blue mb-3">ICRA 2026</p>
              <h2 className="text-3xl md:text-4xl font-bold mb-5">
                Simulation Competition
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed mb-6">
                The ICRA 2026 autonomous racing simulation challenge asks teams to
                build a complete racing agent and deploy it in a high-fidelity
                simulator. Each team submits a Docker container that must perceive
                the track, localize on it, plan a racing line, and control the
                vehicle without human input.
              </p>

              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-brand-blue/30 text-sm">
                  <Medal className="h-4 w-4 text-brand-blue" />
                  <span className="font-semibold text-white">9th</span>
                  <span className="text-gray-400">overall</span>
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-brand-magenta/30 text-sm">
                  <Trophy className="h-4 w-4 text-brand-magenta" />
                  <span className="text-gray-300">Teams worldwide</span>
                </span>
              </div>
            </div>

            {/* Video */}
            <div>
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10">
                <iframe
                  src="https://www.youtube.com/embed/pZyWX06vMJg"
                  title="ICRA 2026 Simulation Competition Run"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
              <a
                href="https://www.youtube.com/watch?v=pZyWX06vMJg"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-brand-magenta hover:text-brand-magenta-hover font-medium transition-colors text-sm"
              >
                Watch on YouTube
                <ExternalLink size={14} />
              </a>
            </div>

            {/* Tech stack */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-5">Our Tech Stack</h2>
              <p className="text-lg text-gray-300 leading-relaxed mb-4">
                Our submission is a ROS-based autonomy stack packaged as a Docker
                container. All nodes, from sensor drivers through planning and
                control, run inside that container and plug into the competition
                simulator on race day.
              </p>
              <p className="text-lg text-gray-400 leading-relaxed mb-8">
                Data flows from raw LiDAR through mapping and localization, then
                into raceline planning and pure pursuit control. The pipeline below
                is what powers our agent on track.
              </p>

              <div className="rounded-2xl bg-white/5 border border-white/10 divide-y divide-white/10">
                {pipelineSteps.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.step} className="p-5 flex gap-4">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-blue/20 text-brand-blue text-sm font-bold shrink-0">
                        {item.step}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="h-4 w-4 text-brand-magenta" />
                          <h3 className="font-bold">{item.title}</h3>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Resources & next */}
            <div className="space-y-8 pt-4 border-t border-white/10">
              <div className="flex items-start gap-4">
                <Github className="h-6 w-6 text-brand-blue shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold mb-1">GitHub</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-3">
                    Full stack documentation and implementation details coming soon.
                  </p>
                  <a
                    href="#"
                    className="inline-flex items-center gap-2 text-brand-blue hover:text-brand-blue-hover font-medium transition-colors text-sm"
                  >
                    Repository
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>

              <p className="text-gray-500 text-sm leading-relaxed">
                More competitions on the way. Results, repos, and footage will be
                posted here as we compete.
              </p>
            </div>

          </div>
        </section>
      </div>
    </div>
  );
}
