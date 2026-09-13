import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
	return new ImageResponse(
		(
			<div
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					background: "linear-gradient(135deg, #4f46e5 0%, #22d3ee 100%)",
					borderRadius: 7,
					color: "#ffffff",
					fontSize: 20,
					fontWeight: 700,
					fontFamily: "sans-serif",
				}}>
				L
			</div>
		),
		size
	);
}
