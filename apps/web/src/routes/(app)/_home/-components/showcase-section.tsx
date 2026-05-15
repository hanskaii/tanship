"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlayIcon } from "@hugeicons/core-free-icons";
import { Dialog, DialogContent, DialogTitle } from "@workspace/ui";

const YOUTUBE_ID = "dQw4w9WgXcQ";

export function ShowcaseSection() {
	const [isVideoOpen, setIsVideoOpen] = useState(false);

	return (
		<section className="py-16 border-b border-border/40">
			<div
				className="relative group cursor-pointer"
				onClick={() => setIsVideoOpen(true)}
			>
				<div className="bg-foreground rounded-[32px] overflow-hidden aspect-video relative shadow-2xl border border-border">
					<img
						src={`https://img.youtube.com/vi/${YOUTUBE_ID}/maxresdefault.jpg`}
						alt="Tanship Demo Video"
						className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-500"
					/>
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-black shadow-lg group-hover:scale-110 transition-transform duration-300">
							<HugeiconsIcon
								icon={PlayIcon}
								size={32}
								className="ml-1"
							/>
						</div>
					</div>
					<div className="absolute bottom-8 left-8 text-white">
						<h3 className="text-2xl font-bold">
							Tanship in Action
						</h3>
						<p className="opacity-80 text-sm mt-1">
							Watch the full walkthrough
						</p>
					</div>
				</div>
				<div className="absolute -inset-4 bg-primary rounded-[40px] opacity-10 -z-10 rotate-2 group-hover:rotate-1 transition-transform duration-300" />
			</div>

			<Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
				<DialogContent
					className="w-[90vw] sm:max-w-[1400px] p-4 bg-black border-0 rounded-[32px]"
					showCloseButton={false}
				>
					<DialogTitle className="sr-only">
						Tanship Demo Video
					</DialogTitle>
					<div className="relative aspect-video w-full rounded-[28px] overflow-hidden">
						{isVideoOpen && (
							<iframe
								src={`https://www.youtube.com/embed/${YOUTUBE_ID}?autoplay=1`}
								title="Tanship Demo Video"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
								allowFullScreen
								className="absolute inset-0 w-full h-full"
							/>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</section>
	);
}
