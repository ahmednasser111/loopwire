import { NextResponse } from "next/server";

// This is the "wake the backend" endpoint the frontend polls. The backend VM deallocates
// itself when idle (see deploy/idle-shutdown.sh in the microservices-project repo) to save
// cost on a project that's just a portfolio demo — this route detects that and starts it back
// up on the first visitor, rather than the site just being broken until someone starts it
// manually.
export const dynamic = "force-dynamic";

const {
	AZURE_TENANT_ID,
	AZURE_CLIENT_ID,
	AZURE_CLIENT_SECRET,
	AZURE_SUBSCRIPTION_ID,
	AZURE_RESOURCE_GROUP,
	AZURE_VM_NAME,
	NEXT_PUBLIC_GATEWAY_URL,
} = process.env;

const AZURE_CONFIGURED = Boolean(
	AZURE_TENANT_ID &&
		AZURE_CLIENT_ID &&
		AZURE_CLIENT_SECRET &&
		AZURE_SUBSCRIPTION_ID &&
		AZURE_RESOURCE_GROUP &&
		AZURE_VM_NAME
);

async function getAccessToken(): Promise<string> {
	const res = await fetch(
		`https://login.microsoftonline.com/${AZURE_TENANT_ID}/oauth2/v2.0/token`,
		{
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: new URLSearchParams({
				grant_type: "client_credentials",
				client_id: AZURE_CLIENT_ID!,
				client_secret: AZURE_CLIENT_SECRET!,
				scope: "https://management.azure.com/.default",
			}),
			cache: "no-store",
		}
	);
	if (!res.ok) {
		throw new Error(`Azure AD token request failed: ${res.status}`);
	}
	const data = await res.json();
	return data.access_token as string;
}

function vmUrl(action: string) {
	return `https://management.azure.com/subscriptions/${AZURE_SUBSCRIPTION_ID}/resourceGroups/${AZURE_RESOURCE_GROUP}/providers/Microsoft.Compute/virtualMachines/${AZURE_VM_NAME}/${action}?api-version=2023-09-01`;
}

async function getPowerState(token: string): Promise<string> {
	const res = await fetch(vmUrl("instanceView"), {
		headers: { Authorization: `Bearer ${token}` },
		cache: "no-store",
	});
	if (!res.ok) {
		throw new Error(`Instance view request failed: ${res.status}`);
	}
	const data = await res.json();
	const powerStatus = (data.statuses ?? []).find((s: { code?: string }) =>
		s.code?.startsWith("PowerState/")
	);
	return powerStatus?.code?.replace("PowerState/", "") ?? "unknown";
}

async function startVm(token: string): Promise<void> {
	await fetch(vmUrl("start"), {
		method: "POST",
		headers: { Authorization: `Bearer ${token}`, "Content-Length": "0" },
	});
}

// Power state "running" only means the OS is booting — Docker Compose (Postgres, Kafka,
// Kong, the app services) still takes roughly a minute after that to actually serve
// requests. Only report "running" once the real backend answers.
async function backendIsResponding(): Promise<boolean> {
	if (!NEXT_PUBLIC_GATEWAY_URL) return true; // nothing configured to check against
	try {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 5000);
		const res = await fetch(`${NEXT_PUBLIC_GATEWAY_URL}/auth/health`, {
			signal: controller.signal,
			cache: "no-store",
		});
		clearTimeout(timeout);
		return res.ok;
	} catch {
		return false;
	}
}

export async function GET() {
	if (!AZURE_CONFIGURED) {
		// Not set up (e.g. local dev) — don't block the app, assume it's already reachable.
		return NextResponse.json({ status: "running", reason: "azure-not-configured" });
	}

	try {
		const token = await getAccessToken();
		const power = await getPowerState(token);

		if (power !== "running") {
			if (power === "deallocated" || power === "stopped") {
				await startVm(token);
			}
			return NextResponse.json({ status: "starting", power });
		}

		const ready = await backendIsResponding();
		return NextResponse.json({ status: ready ? "running" : "starting", power });
	} catch (err) {
		console.error("wake check failed", err);
		return NextResponse.json({ status: "error" }, { status: 500 });
	}
}
