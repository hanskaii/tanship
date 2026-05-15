"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlayIcon } from "@hugeicons/core-free-icons";
import { Dialog, DialogContent, DialogTitle } from "@workspace/ui";

const YOUTUBE_ID = "dQw4w9WgXcQ";

export function ShowcaseSection() {
	const [isVideoOpen, setIsVideoOpen] = useState(false);

	return (
		<section className="border-b border-border/40 py-16">
			{/* Video thumbnail */}
			<div
				className="group relative cursor-pointer overflow-hidden border border-border/50 bg-foreground shadow-2xl"
				onClick={() => setIsVideoOpen(true)}
			>
				<div className="aspect-video relative overflow-hidden">
					<img
						src={`https://img.youtube.com/vi/${YOUTUBE_ID}/maxresdefault.jpg`}
						alt="Tanship Demo Video"
						className="h-full w-full object-cover opacity-50 transition-opacity duration-500 group-hover:opacity-35"
					/>

					{/* Overlay gradient */}
					<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

					{/* Play button */}
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-black shadow-xl transition-transform duration-300 group-hover:scale-110">
							<HugeiconsIcon
								icon={PlayIcon}
								size={28}
								className="ml-1"
							/>
						</div>
					</div>

					{/* Caption */}
					<div className="absolute bottom-6 left-6 text-white">
						<h3 className="text-xl font-semibold tracking-tight">
							Tanship in Action
						</h3>
						<p className="mt-1 text-sm opacity-70">
							Watch the full walkthrough
						</p>
					</div>
				</div>
			</div>

			{/* Dialog */}
			<Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
				<DialogContent
					className="w-[90vw] sm:max-w-[1200px] border-0 bg-black p-3"
					showCloseButton={false}
				>
					<DialogTitle className="sr-only">
						Tanship Demo Video
					</DialogTitle>
					<div className="aspect-video w-full overflow-hidden">
						{isVideoOpen && (
							<iframe
								src={`https://www.youtube.com/embed/${YOUTUBE_ID}?autoplay=1`}
								title="Tanship Demo Video"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
								allowFullScreen
								className="h-full w-full"
							/>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</section>
	);
}
