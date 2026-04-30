import { cn } from "@persona-chat/ui/lib/utils";
import type * as React from "react";

type LabelProps = React.ComponentPropsWithoutRef<"label"> & {
	children: React.ReactNode;
	htmlFor: string;
};

function Label({ children, className, htmlFor, ...props }: LabelProps) {
	return (
		<label
			className={cn(
				"flex select-none items-center gap-2 text-xs leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50",
				className
			)}
			data-slot="label"
			htmlFor={htmlFor}
			{...props}
		>
			{children}
		</label>
	);
}

export { Label };
