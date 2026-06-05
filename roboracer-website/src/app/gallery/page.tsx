export default function GalleryPage() {
    const images = Array.from({ length: 9 }).map((_, i) => ({
        id: i,
        alt: `Gallery Image ${i + 1}`,
        aspect: i % 2 === 0 ? "aspect-video" : "aspect-square"
    }));

    return (
        <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-brand-blue to-brand-magenta">
                        Gallery
                    </h1>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                        Highlights from our events, races, and build sessions.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {images.map((img) => (
                        <div
                            key={img.id}
                            className={`bg-white/5 rounded-xl overflow-hidden border border-white/10 relative hover:scale-[1.02] transition-transform duration-300 ${img.aspect}`}
                        >
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-gray-700">
                                <span className="text-lg font-medium">Image Placeholder {img.id + 1}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
