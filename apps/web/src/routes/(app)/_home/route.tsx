import { createFileRoute, Outlet } from "@tanstack/react-router";
import { HomeNav } from "./-components/home-nav";

export const Route = createFileRoute("/(app)/_home")({
	component: HomeLayout
});

function HomeLayout() {
	return (
		<>
			<HomeNav />
			<Outlet />
		</>
	);
}
