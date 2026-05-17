export function DemoVideoSection() {
	return (
		<section className="border-b border-border/40 py-10">
			<div className="rounded-2xl bg-secondary p-2">
				<div
					className="relative w-full overflow-hidden rounded-xl bg-card"
					style={{ aspectRatio: "16/9" }}
				>
					<iframe
						src="https://www.youtube-nocookie.com/embed/W3Pb3v_GpoE?si=wL6WVed66oAbpXB-&controls=0"
						title="YouTube video player"
						frameBorder="0"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						referrerPolicy="strict-origin-when-cross-origin"
						allowFullScreen
						className="absolute inset-0 h-full w-full"
					/>
				</div>
			</div>
		</section>
	);
}
