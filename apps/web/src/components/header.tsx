"use client";

import { Separator } from "@persona-chat/ui/components/separator";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ModeToggle } from "./mode-toggle";

export default function Header() {
	const pathname = usePathname();
	const links = [{ to: "/", label: "Persona Chat" }] as const;

	return (
		<header>
			<div className="flex flex-row items-center justify-between px-2 py-1">
				<nav aria-label="Primary" className="flex gap-4 text-lg">
					{links.map(({ to, label }) => (
						<Link
							aria-current={pathname === to ? "page" : undefined}
							href={to}
							key={to}
						>
							{label}
						</Link>
					))}
				</nav>
				<div className="flex items-center gap-2">
					<ModeToggle />
				</div>
			</div>
			<Separator />
		</header>
	);
}
