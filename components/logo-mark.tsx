import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
	return (
		<div
			className={cn(
				"flex items-center justify-center rounded-lg font-bold text-white",
				className
			)}
			style={{
				background: "linear-gradient(135deg, #4f46e5 0%, #22d3ee 100%)",
			}}>
			L
		</div>
	);
}
