export function ShowcaseSection() {
	return (
		<section className="py-16 border-b border-border/40">
			<div className="bg-background border border-border/50 p-2 sm:p-4 rounded-none">
				<div className="aspect-[16/9] w-full relative overflow-hidden bg-muted/30">
					<iframe
						className="absolute inset-0 w-full h-full"
						src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&loop=1"
						title="YouTube video player"
						frameBorder="0"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						allowFullScreen
					></iframe>
				</div>
			</div>
		</section>
	);
}
