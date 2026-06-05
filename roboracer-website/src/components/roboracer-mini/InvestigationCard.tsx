"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface InvestigationDetail {
    label: string;
    value: string;
}

export interface InvestigationCardProps {
    name: string;
    summary: string;
    status: string;
    details: InvestigationDetail[];
}

export default function InvestigationCard({
    name,
    summary,
    status,
    details,
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
                    </div>
                </div>
            </div>
        </div>
    );
}
