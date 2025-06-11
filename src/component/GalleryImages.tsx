'use client';
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export function GalleryGrid({ images }: { images: string[] }) {
    const main = images[0];
    const thumbs = images.slice(1, 6); // up to 6

    return (
        <Dialog>
            {/* Grid */}
            <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[400px] rounded-xl overflow-hidden">
                {/* Main Image */}
                <div className="col-span-2 row-span-2">
                    <img src={main} alt="Main" className="w-full h-full object-cover rounded-xl" />
                </div>

                {/* Thumbnails */}
                {thumbs.map((src, i) => (
                    <div key={i} className="relative">
                        <img src={src} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover rounded-xl" />

                        {/* If last visible thumb & more images exist, show overlay trigger */}
                        {i === 4 && images.length > 6 && (
                            <DialogTrigger asChild>
                                <button className="absolute inset-0 bg-black/50 text-white text-sm font-semibold flex items-center justify-center rounded-xl">
                                    See all photos ({images.length})
                                </button>
                            </DialogTrigger>
                        )}
                    </div>
                ))}
            </div>

            {/* Full Gallery Dialog */}
            <DialogContent className="max-w-5xl">
                <DialogHeader>
                    <DialogTitle>Gallery</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[70vh] overflow-y-auto py-4">
                    {images.map((img, i) => (
                        <img
                            key={i}
                            src={img}
                            alt={`Image ${i}`}
                            className="w-full h-48 object-cover rounded-lg"
                        />
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
