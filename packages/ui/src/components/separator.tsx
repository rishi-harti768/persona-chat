import { cn } from "@persona-chat/ui/lib/utils";
import type * as React from "react";

function Separator({ className, ...props }: React.ComponentProps<"hr">) {
	return (
		<hr
			className={cn("h-px w-full shrink-0 bg-border", className)}
			data-slot="separator"
			{...props}
		/>
	);
}

export { Separator };
