"use client";

import { useState } from "react";
import { ChevronDown, ImageIcon, Play } from "lucide-react";

export interface InvestigationDetail {
    label: string;
    value: string;
}

export interface InvestigationCardProps {
    name: string;
    summary: string;
    status: string;
    details: InvestigationDetail[];
    photoSlots?: number;
    videoSlots?: number;
}

export default function InvestigationCard({
    name,
    summary,
    status,
    details,
    photoSlots = 2,
    videoSlots = 1,
}: InvestigationCardProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="rounded-3xl bg-white/5 border border-white/10 overflow-hidden transition-colors duration-300 hover:border-brand-blue/50">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-8 text-left flex items-start justify-between gap-4"
                aria-expanded={isOpen}
            >
                <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                        <h3 className="text-2xl font-bold">{name}</h3>
                        <span className="text-xs uppercase tracking-widest px-3 py-1 rounded-full bg-brand-blue/10 text-brand-blue border border-brand-blue/30">
                            {status}
                        </span>
                    </div>
                    <p className="text-gray-400 text-lg">{summary}</p>
                </div>
                <ChevronDown
                    className={`h-6 w-6 text-brand-blue shrink-0 mt-1 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                />
            </button>

            <div
                className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
            >
                <div className="overflow-hidden">
                    <div className="px-8 pb-8 pt-0 border-t border-white/10">
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                            {details.map((detail) => (
                                <div key={detail.label}>
                                    <dt className="text-sm uppercase tracking-wider text-gray-500 mb-1">
                                        {detail.label}
                                    </dt>
                                    <dd className="text-lg text-gray-200">{detail.value}</dd>
                                </div>
                            ))}
                        </dl>

                        <div className="mt-10 pt-8 border-t border-white/10">
                            <h4 className="text-sm uppercase tracking-wider text-gray-500 mb-4">
                                Photos &amp; Videos
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                                {Array.from({ length: photoSlots }).map((_, i) => (
                                    <div
                                        key={`photo-${i}`}
                                        className="aspect-video rounded-xl bg-white/5 border border-dashed border-white/20 flex flex-col items-center justify-center gap-2 text-gray-500"
                                    >
                                        <ImageIcon className="h-8 w-8 opacity-50" />
                                        <span className="text-xs">Photo {i + 1}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {Array.from({ length: videoSlots }).map((_, i) => (
                                    <div
                                        key={`video-${i}`}
                                        className="aspect-video rounded-xl bg-white/5 border border-dashed border-brand-magenta/30 flex flex-col items-center justify-center gap-2 text-gray-500"
                                    >
                                        <Play className="h-10 w-10 text-brand-magenta/50" />
                                        <span className="text-xs">Video {i + 1}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm text-gray-500 mt-3">Media coming soon</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
