"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type WakeStatus = "checking" | "starting" | "running" | "timeout" | "error";

const POLL_INTERVAL_MS = 8000;
const MAX_WAIT_MS = 3 * 60 * 1000; // 3 minutes — generous for cold Postgres/Kafka/Kong boot

// Wraps the app and holds it behind a "waking up" screen until the backend VM (which
// deallocates itself when idle — see deploy/idle-shutdown.sh in the microservices-project
// repo) is confirmed actually responding, not just powered on. Fails open (renders children)
// if the wake API isn't configured, e.g. local dev.
export function BackendWakeGate({ children }: { children: React.ReactNode }) {
	const [status, setStatus] = useState<WakeStatus>("checking");
	const startedAtRef = useRef<number | null>(null);

	const checkOnce = useCallback(async () => {
		try {
			const res = await fetch("/api/wake", { cache: "no-store" });
			const data = await res.json();
			setStatus(data.status === "running" ? "running" : "starting");
		} catch {
			setStatus("error");
		}
	}, []);

	useEffect(() => {
		checkOnce();
	}, [checkOnce]);

	useEffect(() => {
		if (status === "running" || status === "error" || status === "timeout") return;

		if (startedAtRef.current === null) {
			startedAtRef.current = Date.now();
		}

		const interval = setInterval(() => {
			if (Date.now() - (startedAtRef.current ?? 0) > MAX_WAIT_MS) {
				setStatus("timeout");
				return;
			}
			checkOnce();
		}, POLL_INTERVAL_MS);

		return () => clearInterval(interval);
	}, [status, checkOnce]);

	if (status === "running") {
		return <>{children}</>;
	}

	if (status === "checking") {
		// Avoid a flash of the waking-up screen for the common case where it's already awake.
		return null;
	}

	const retry = () => {
		startedAtRef.current = null;
		setStatus("checking");
		checkOnce();
	};

	return (
		<div className="min-h-screen bg-background flex items-center justify-center px-4">
			<div className="text-center space-y-4 max-w-md">
				{status !== "timeout" && status !== "error" && (
					<div className="h-8 w-8 mx-auto rounded-full border-2 border-primary border-t-transparent animate-spin" />
				)}
				<p className="text-lg font-medium text-foreground">
					{status === "timeout" || status === "error"
						? "Taking longer than expected"
						: "Waking up the demo server…"}
				</p>
				<p className="text-sm text-muted-foreground">
					{status === "timeout" || status === "error"
						? "The backend is still starting. This can occasionally take a bit longer than usual — try again in a moment."
						: "This project sleeps when idle to keep hosting costs down. First load can take about a minute while the backend starts back up."}
				</p>
				{(status === "timeout" || status === "error") && (
					<button
						onClick={retry}
						className="text-sm underline text-primary underline-offset-4">
						Retry now
					</button>
				)}
			</div>
		</div>
	);
}
