import PageHero from "@/components/layout/PageHero";
import {
  Box,
  Crosshair,
  ExternalLink,
  Github,
  Map,
  Medal,
  Play,
  Route,
  ScanLine,
  SlidersHorizontal,
  Trophy,
} from "lucide-react";

const techStackSteps = [
  {
    step: 1,
    title: "LiDAR Scans",
    icon: ScanLine,
    summary: "Laser range scans of the track.",
    detail: "Walls, landmarks, track geometry.",
    color: "brand-blue",
  },
  {
    step: 2,
    title: "Scan Matching",
    icon: Crosshair,
    summary: "Align consecutive scans.",
    detail: "Estimate frame-to-frame motion.",
    color: "brand-magenta",
  },
  {
    step: 3,
    title: "SLAM Toolbox",
    icon: Map,
    summary: "Build the track map.",
    detail: "Full SLAM map from matched scans.",
    color: "brand-blue",
  },
  {
    step: 4,
    title: "Particle Filter Localization",
    icon: Crosshair,
    summary: "Localize on the map.",
    detail: "ROS particle filters for pose estimation.",
    color: "brand-magenta",
  },
  {
    step: 5,
    title: "Raceline Optimization",
    icon: Route,
    summary: "Compute the racing line.",
    detail: "Fast path balancing speed and curvature.",
    color: "brand-blue",
  },
  {
    step: 6,
    title: "Pure Pursuit Control",
    icon: SlidersHorizontal,
    summary: "Steer and throttle.",
    detail: "Follow lookahead point on the raceline.",
    color: "brand-magenta",
  },
];

export default function CompetitionsPage() {
  return (
    <div className="flex flex-col">
      <PageHero title="Competitions" />

      <div className="bg-gradient-to-b from-brand-dark to-brand-[#ec4899]">
        {/* ICRA 2026 */}
        <section className="py-16 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-sm uppercase tracking-widest text-gray-400 mb-3">ICRA 2026</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simulation Competition
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mb-10">
              Autonomous racing agents in a high-fidelity simulator.{" "}
              <span className="text-white font-medium">9th overall.</span>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl">
              <div className="p-6 rounded-3xl bg-white/5 border border-brand-blue/30 text-center">
                <Medal className="h-8 w-8 text-brand-blue mx-auto mb-3" />
                <p className="text-3xl font-bold text-white mb-1">9th</p>
                <p className="text-sm uppercase tracking-wider text-gray-400">
                  Overall
                </p>
              </div>
              <div className="p-6 rounded-3xl bg-white/5 border border-brand-magenta/30 text-center">
                <Trophy className="h-8 w-8 text-brand-magenta mx-auto mb-3" />
                <p className="text-lg font-bold text-white mb-1">Global field</p>
                <p className="text-sm uppercase tracking-wider text-gray-400">
                  Teams worldwide
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Competition video */}
        <section className="py-16 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">Competition Run</h2>

            <div className="max-w-4xl">
              <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-brand-magenta/30 shadow-2xl shadow-brand-magenta/10">
                <iframe
                  src="https://www.youtube.com/embed/pZyWX06vMJg"
                  title="ICRA 2026 Simulation Competition Run"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
              <p className="mt-4">
                <a
                  href="https://www.youtube.com/watch?v=pZyWX06vMJg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-brand-magenta hover:text-brand-magenta-hover font-medium transition-colors text-sm"
                >
                  Watch on YouTube
                  <ExternalLink size={14} />
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* Tech stack */}
        <section className="py-16 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Tech Stack</h2>
            <p className="text-gray-400 mb-10 max-w-2xl">
              <span className="text-white font-medium">ROS</span> stack, submitted as a{" "}
              <span className="text-white font-medium">Docker container</span>.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12 max-w-3xl">
              <div className="p-6 rounded-2xl bg-brand-dark border border-brand-blue/30 flex items-start gap-4">
                <Box className="h-5 w-5 text-brand-blue shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold mb-1">ROS</h3>
                  <p className="text-sm text-gray-400">
                    LiDAR, SLAM, localization, planning, control.
                  </p>
                </div>
              </div>
              <div className="p-6 rounded-2xl bg-brand-dark border border-brand-magenta/30 flex items-start gap-4">
                <Box className="h-5 w-5 text-brand-magenta shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold mb-1">Docker</h3>
                  <p className="text-sm text-gray-400">
                    Full stack packaged for the competition simulator.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {techStackSteps.map((item) => {
                const Icon = item.icon;
                const isBlue = item.color === "brand-blue";
                return (
                  <div
                    key={item.step}
                    className={`p-6 rounded-2xl bg-white/5 border ${isBlue ? "border-brand-blue/40" : "border-brand-magenta/40"}`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${isBlue ? "bg-brand-blue/20 text-brand-blue" : "bg-brand-magenta/20 text-brand-magenta"}`}
                      >
                        {item.step}
                      </span>
                      <Icon
                        className={`h-4 w-4 ${isBlue ? "text-brand-blue" : "text-brand-magenta"}`}
                      />
                      <h3 className="font-bold">{item.title}</h3>
                    </div>
                    <p className="text-gray-300 text-sm mb-1">{item.summary}</p>
                    <p className="text-xs text-gray-500">{item.detail}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 max-w-3xl p-6 rounded-2xl bg-brand-dark border border-white/10 text-center">
              <p className="text-sm text-gray-300">
                <span className="text-brand-blue font-medium">Sense</span>
                {" → "}
                <span className="text-brand-magenta font-medium">Map</span>
                {" → "}
                <span className="text-brand-blue font-medium">Localize</span>
                {" → "}
                <span className="text-brand-magenta font-medium">Plan</span>
                {" → "}
                <span className="text-brand-blue font-medium">Drive</span>
              </p>
              <p className="text-gray-500 mt-2 text-xs">
                LiDAR → SLAM Toolbox → Particle Filter → Raceline → Pure Pursuit
              </p>
            </div>
          </div>
        </section>

        {/* Resources */}
        <section className="py-16 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">Resources</h2>

            <div className="max-w-md p-8 rounded-2xl bg-brand-dark border border-brand-blue/30">
              <Github className="h-8 w-8 text-brand-blue mb-4" />
              <h3 className="text-lg font-bold mb-2">GitHub</h3>
              <p className="text-sm text-gray-400 mb-4">
                Stack docs and implementation details. Coming soon.
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
        </section>

        {/* Future competitions */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">What&apos;s Next</h2>
            <p className="text-gray-400 max-w-xl">
              More competitions coming. Results and repos will be posted here.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
