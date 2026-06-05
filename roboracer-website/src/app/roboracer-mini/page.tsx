import Image from "next/image";
import { ArrowRight, Cpu, Trophy, Users, Ruler, DollarSign, Eye, Brain, GraduationCap, Zap, ScanLine } from "lucide-react";
import PageHero from "@/components/layout/PageHero";
import InvestigationCard from "@/components/roboracer-mini/InvestigationCard";

const carInvestigations = [
  {
    name: "Custom 1/18 RC Truck",
    summary:
      "Our in-house build. Customized 1/18-scale RC truck with Raspberry Pi 5 and Intel RealSense D435i.",
    status: "In Development",
    details: [
      { label: "Scale", value: "1/18th scale RC truck" },
      { label: "Chassis", value: "Customized RC truck platform" },
      { label: "Compute", value: "Raspberry Pi 5" },
      { label: "Camera", value: "Intel RealSense D435i" },
      { label: "Motor Control", value: "Custom ESC (model TBD)" },
      { label: "Software Stack", value: "ROS 2 / custom autonomy stack (TBD)" },
      { label: "Notes", value: "Fully custom integration. Chassis, ESC, and sensor mounting designed by the club." },
    ],
    photoSlots: 3,
    videoSlots: 2,
  },
  {
    name: "Lehigh E116",
    summary:
      "E116 from Lehigh University. 1/16-scale Traxxas chassis with Jetson and RealSense D435i.",
    status: "Reference Platform",
    details: [
      { label: "Origin", value: "Lehigh University, E116 platform" },
      { label: "Scale", value: "1/16th scale" },
      { label: "Chassis", value: "Traxxas RC chassis" },
      { label: "Compute", value: "NVIDIA Jetson" },
      { label: "Camera", value: "Intel RealSense D435i" },
      { label: "Notes", value: "Established reference design we are studying for RoboRacer-mini hardware and software choices." },
    ],
    photoSlots: 2,
    videoSlots: 1,
  },
  {
    name: "Waveshare PiRacer Pro",
    summary:
      "Commercial DonkeyCar-ready racer. 4WD, RC380 motor, open-source ecosystem on Raspberry Pi 4.",
    status: "Investigating",
    details: [
      { label: "Platform", value: "Waveshare PiRacer Pro AI Kit" },
      { label: "Compute", value: "Raspberry Pi 4 Model B" },
      { label: "Software", value: "DonkeyCar (Keras/TensorFlow, OpenCV)" },
      { label: "OS", value: "Raspberry Pi OS (Raspbian), Python" },
      { label: "Camera (stock)", value: "5 MP HD, 160° FOV wide-angle" },
      { label: "Display", value: "0.91\" OLED (128×32). IP, memory, power." },
      { label: "Drive", value: "Ackermann steering, 4WD, front/rear differentials" },
      { label: "Suspension", value: "Adjustable oil-filled shocks, 4WD independent" },
      { label: "Motor", value: "RC380 carbon-brushed (~15,000 RPM idle)" },
      { label: "Servo", value: "6 kg·cm torque" },
      { label: "Power", value: "8.4 V, 4× 18650 (2S2P, batteries not included)" },
      { label: "Connectivity", value: "2.4 / 5 GHz WiFi, Bluetooth 5.0" },
      { label: "Wheelbase", value: "~174 mm (kit ~25.5 × 14 × 21.5 cm)" },
      { label: "Notes", value: "Off-the-shelf DonkeyCar stack; useful baseline for teaching and rapid prototyping." },
    ],
    photoSlots: 2,
    videoSlots: 2,
  },
];

export default function RoboRacerMiniPage() {
  return (
    <div className="flex flex-col">
      <PageHero title="RoboRacer-mini" />

      <div className="bg-gradient-to-b from-brand-dark to-brand-[#ec4899]">
        {/* Flowchart Section */}
        <section className="py-24 relative z-20 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">How It Works</h2>
              <p className="text-2xl text-gray-400 max-w-3xl mx-auto">
                Master autonomous racing in three stages.
              </p>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-12 md:gap-8 relative">
              <div className="flex flex-col items-center text-center max-w-sm relative group">
                <div className="w-80 h-52 relative rounded-xl overflow-hidden border-2 border-brand-blue/30 mb-8 shadow-2xl shadow-brand-blue/10 group-hover:border-brand-blue transition-colors duration-300">
                  <Image
                    src="/images/car_chassis.png"
                    alt="Build a battery-powered car"
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300 mb-3">Build</h3>
                <p className="text-gray-300 text-xl font-medium">
                  Build a battery-powered car with a camera
                </p>
              </div>

              <div className="hidden md:flex items-center justify-center text-brand-blue/50 md:mt-[4.75rem]">
                <ArrowRight size={56} strokeWidth={1.5} />
              </div>
              <div className="md:hidden transform rotate-90 text-brand-blue/50 my-6">
                <ArrowRight size={56} strokeWidth={1.5} />
              </div>

              <div className="flex flex-col items-center text-center max-w-sm relative group">
                <div className="w-80 h-52 relative rounded-xl overflow-hidden border-2 border-brand-magenta/30 mb-8 shadow-2xl shadow-brand-magenta/10 group-hover:border-brand-magenta transition-colors duration-300">
                  <Image
                    src="/images/code_ros_2.png"
                    alt="Write autonomous racing algorithms in VS Code"
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300 mb-3">Code</h3>
                <p className="text-gray-300 text-xl font-medium">
                  Write autonomous racing algorithms
                </p>
              </div>

              <div className="hidden md:flex items-center justify-center text-brand-magenta/50 md:mt-[4.75rem]">
                <ArrowRight size={56} strokeWidth={1.5} />
              </div>
              <div className="md:hidden transform rotate-90 text-brand-magenta/50 my-6">
                <ArrowRight size={56} strokeWidth={1.5} />
              </div>

              <div className="flex flex-col items-center text-center max-w-sm relative group">
                <div className="w-80 h-52 relative rounded-xl overflow-hidden border-2 border-indigo-500/30 mb-8 shadow-2xl shadow-indigo-500/10 group-hover:border-indigo-500 transition-colors duration-300">
                  <Image
                    src="/images/race_cars.png"
                    alt="Autonomous cars racing on track"
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300 mb-3">Race</h3>
                <p className="text-gray-300 text-xl font-medium">
                  Compete in races with teams from across the world
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Evolution Section */}
        <section className="py-24 relative z-20 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">The Evolution</h2>
              <p className="text-2xl text-gray-400 max-w-3xl mx-auto">
                Reimagining autonomous racing to be accessible and powerful.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="bg-brand-dark rounded-3xl p-8 border-2 border-indigo-500/30 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent" />
                <div className="absolute top-0 right-0 p-4 opacity-20 text-indigo-500">
                  <ScanLine size={120} />
                </div>
                <div className="relative z-10">
                  <h3 className="text-3xl font-bold text-white mb-1">RoboRacer</h3>
                  <p className="text-sm text-indigo-400 uppercase tracking-widest mb-8">Professional Platform</p>

                  <div className="space-y-6">
                    <div className="flex items-center">
                      <div className="w-10 flex justify-center text-indigo-400"><Ruler size={24} /></div>
                      <div className="ml-4 flex-1">
                        <p className="text-sm uppercase tracking-wider text-gray-500">Scale</p>
                        <p className="text-xl font-bold text-gray-200">1/10th Scale</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-10 flex justify-center text-indigo-400"><DollarSign size={24} /></div>
                      <div className="ml-4 flex-1">
                        <p className="text-sm uppercase tracking-wider text-gray-500">Cost</p>
                        <p className="text-xl font-bold text-gray-200">~$3,500</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-10 flex justify-center text-indigo-400"><ScanLine size={24} /></div>
                      <div className="ml-4 flex-1">
                        <p className="text-sm uppercase tracking-wider text-gray-500">Sensors</p>
                        <p className="text-xl font-bold text-gray-200">Lidar-based</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-10 flex justify-center text-indigo-400"><Brain size={24} /></div>
                      <div className="ml-4 flex-1">
                        <p className="text-sm uppercase tracking-wider text-gray-500">AI Stack</p>
                        <p className="text-xl font-bold text-gray-200">Reinforcement Learning</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-10 flex justify-center text-indigo-400"><GraduationCap size={24} /></div>
                      <div className="ml-4 flex-1">
                        <p className="text-sm uppercase tracking-wider text-gray-500">Audience</p>
                        <p className="text-xl font-bold text-gray-200">Grad Students</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-brand-dark rounded-3xl p-8 border-2 border-brand-blue relative overflow-hidden shadow-2xl shadow-brand-blue/20 group transform md:-translate-x-4 lg:translate-x-0">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/10 to-transparent" />
                <div className="absolute top-0 right-0 p-4 opacity-20 text-brand-blue">
                  <Zap size={120} />
                </div>

                <div className="relative z-10">
                  <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-blue to-brand-magenta mb-1">RoboRacer-mini</h3>
                  <p className="text-sm text-brand-blue uppercase tracking-widest mb-8">The Future</p>

                  <div className="space-y-6">
                    <div className="flex items-center">
                      <div className="w-10 flex justify-center text-brand-blue"><Ruler size={24} /></div>
                      <div className="ml-4 flex-1">
                        <p className="text-sm uppercase tracking-wider text-gray-500">Scale</p>
                        <p className="text-2xl font-bold text-white">1/16th Scale</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-10 flex justify-center text-brand-blue"><DollarSign size={24} /></div>
                      <div className="ml-4 flex-1">
                        <p className="text-sm uppercase tracking-wider text-gray-500">Cost</p>
                        <p className="text-2xl font-bold text-white text-green-400">~$1,000</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-10 flex justify-center text-brand-blue"><Eye size={24} /></div>
                      <div className="ml-4 flex-1">
                        <p className="text-sm uppercase tracking-wider text-gray-500">Sensors</p>
                        <p className="text-2xl font-bold text-white">Vision-based</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-10 flex justify-center text-brand-blue"><Brain size={24} /></div>
                      <div className="ml-4 flex-1">
                        <p className="text-sm uppercase tracking-wider text-gray-500">AI Stack</p>
                        <p className="text-2xl font-bold text-white">LLMs + Gen AI Tool</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-10 flex justify-center text-brand-blue"><Users size={24} /></div>
                      <div className="ml-4 flex-1">
                        <p className="text-sm uppercase tracking-wider text-gray-500">Audience</p>
                        <p className="text-2xl font-bold text-white">High-school & Undergrad</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Chassis Investigation */}
        <section className="py-24 relative z-20 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Chassis Investigation</h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Three platforms we are building on or learning from. Custom 1/18
                truck, Lehigh reference car, DonkeyCar-ready kit. Expand each for
                specs, photos, and videos.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {carInvestigations.map((car) => (
                <InvestigationCard key={car.name} {...car} />
              ))}
            </div>
          </div>
        </section>

        {/* Why RoboRacer-mini? */}
        <section className="py-24 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Why RoboRacer-mini?</h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                We bridge the gap between theory and practice, providing a hands-on environment for future roboticists.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-10 rounded-3xl bg-white/5 border border-brand-blue/50 transition-colors duration-300">
                <div className="w-14 h-14 rounded-xl bg-brand-blue/10 flex items-center justify-center mb-8">
                  <Cpu className="h-8 w-8 text-brand-blue" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Hands-on Learning</h3>
                <p className="text-lg text-gray-400">
                  Real hardware and sensors. Full stack of autonomous systems: perception, planning, control.
                </p>
              </div>

              <div className="p-10 rounded-3xl bg-white/5 border border-brand-magenta/50 transition-colors duration-300">
                <div className="w-14 h-14 rounded-xl bg-brand-magenta/10 flex items-center justify-center mb-8">
                  <Users className="h-8 w-8 text-brand-magenta" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Community First</h3>
                <p className="text-lg text-gray-400">
                  Students, mentors, and industry experts passionate about robotics and AI.
                </p>
              </div>

              <div className="p-10 rounded-3xl bg-white/5 border border-brand-blue/50 transition-colors duration-300">
                <div className="w-14 h-14 rounded-xl bg-brand-blue/10 flex items-center justify-center mb-8">
                  <Trophy className="h-8 w-8 text-brand-blue" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Competitive Racing</h3>
                <p className="text-lg text-gray-400">
                  Test your algorithms on the track. Compete in tournaments and push your algorithms to the limit.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
