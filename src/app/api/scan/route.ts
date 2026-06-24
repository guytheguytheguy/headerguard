import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Grade = "A+" | "A" | "B" | "C" | "D" | "F";

interface HeaderResult {
  name: string;
  key: string;
  value: string | null;
  grade: Grade;
  score: number;
  weight: number;
  message: string;
  description: string;
}

interface ScanSuccess {
  url: string;
  grade: Grade;
  score: number;
  headers: Omit<HeaderResult, "weight">[];
  scannedAt: string;
}

interface ScanError {
  error: string;
}

const GRADE_SCORES: Record<Grade, number> = {
  "A+": 100,
  A: 85,
  B: 70,
  C: 50,
  D: 30,
  F: 0,
};

function gradeHsts(value: string | null): { grade: Grade; message: string } {
  if (!value) {
    return {
      grade: "F",
      message: "Missing. Browsers may connect over insecure HTTP.",
    };
  }
  const lower = value.toLowerCase();
  const maxAgeMatch = lower.match(/max-age=(\d+)/);
  const maxAge = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : 0;
  const hasSubDomains = lower.includes("includesubdomains");
  const hasPreload = lower.includes("preload");

  if (maxAge >= 31536000 && hasSubDomains && hasPreload) {
    return {
      grade: "A+",
      message: "Excellent. Long max-age with includeSubDomains and preload.",
    };
  }
  if (maxAge > 0) {
    return {
      grade: "A",
      message: "Good. A max-age is set, enforcing HTTPS.",
    };
  }
  return {
    grade: "F",
    message: "Present but no valid max-age directive.",
  };
}

function gradeCsp(value: string | null): { grade: Grade; message: string } {
  if (!value) {
    return {
      grade: "F",
      message: "Missing. No defense against XSS and injection attacks.",
    };
  }
  const lower = value.toLowerCase();
  if (lower.includes("unsafe-inline") || lower.includes("unsafe-eval")) {
    return {
      grade: "C",
      message: "Present but weakened by unsafe-inline or unsafe-eval.",
    };
  }
  return {
    grade: "A",
    message: "Strong. Policy present without unsafe directives.",
  };
}

function gradeXFrameOptions(
  value: string | null
): { grade: Grade; message: string } {
  if (!value) {
    return {
      grade: "F",
      message: "Missing. Page can be embedded and clickjacked.",
    };
  }
  const upper = value.trim().toUpperCase();
  if (upper === "DENY") {
    return {
      grade: "A+",
      message: "Excellent. Framing fully denied (DENY).",
    };
  }
  if (upper === "SAMEORIGIN") {
    return {
      grade: "A",
      message: "Good. Framing restricted to same origin.",
    };
  }
  return {
    grade: "F",
    message: "Present but value is not DENY or SAMEORIGIN.",
  };
}

function gradeXContentTypeOptions(
  value: string | null
): { grade: Grade; message: string } {
  if (!value) {
    return {
      grade: "F",
      message: "Missing. Browser may MIME-sniff responses.",
    };
  }
  if (value.trim().toLowerCase() === "nosniff") {
    return {
      grade: "A",
      message: "Good. MIME-sniffing disabled with nosniff.",
    };
  }
  return {
    grade: "F",
    message: "Present but not set to nosniff.",
  };
}

function gradeReferrerPolicy(
  value: string | null
): { grade: Grade; message: string } {
  if (!value) {
    return {
      grade: "C",
      message: "Missing. Referrer data may leak to other sites.",
    };
  }
  const lower = value.trim().toLowerCase();
  if (lower === "strict-origin-when-cross-origin" || lower === "no-referrer") {
    return {
      grade: "A",
      message: "Good. Referrer leakage is well controlled.",
    };
  }
  return {
    grade: "C",
    message: "Present but a stricter policy is recommended.",
  };
}

function gradePermissionsPolicy(
  value: string | null
): { grade: Grade; message: string } {
  if (!value) {
    return {
      grade: "C",
      message: "Missing. Powerful browser features are not restricted.",
    };
  }
  return {
    grade: "A",
    message: "Good. Browser feature access is restricted.",
  };
}

function finalGrade(score: number): Grade {
  if (score >= 95) return "A+";
  if (score >= 80) return "A";
  if (score >= 65) return "B";
  if (score >= 50) return "C";
  if (score >= 35) return "D";
  return "F";
}

function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export async function POST(request: Request) {
  let body: { url?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<ScanError>(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  if (typeof body.url !== "string" || body.url.trim().length === 0) {
    return NextResponse.json<ScanError>(
      { error: "Please enter a URL to scan." },
      { status: 400 }
    );
  }

  const targetUrl = normalizeUrl(body.url);

  let parsed: URL;
  try {
    parsed = new URL(targetUrl);
  } catch {
    return NextResponse.json<ScanError>(
      { error: "That doesn't look like a valid URL." },
      { status: 400 }
    );
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return NextResponse.json<ScanError>(
      { error: "Only http and https URLs can be scanned." },
      { status: 400 }
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  let response: Response;
  try {
    response = await fetch(parsed.toString(), {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "HeaderGuard/1.0 (+https://headerguard.dev; security header scanner)",
        Accept: "text/html,application/xhtml+xml,*/*",
      },
    });
  } catch {
    clearTimeout(timeout);
    return NextResponse.json<ScanError>(
      { error: "Could not reach that URL. Check it's publicly accessible." },
      { status: 502 }
    );
  } finally {
    clearTimeout(timeout);
  }

  const h = response.headers;

  const definitions: Array<{
    name: string;
    key: string;
    weight: number;
    description: string;
    grader: (v: string | null) => { grade: Grade; message: string };
  }> = [
    {
      name: "Content-Security-Policy",
      key: "content-security-policy",
      weight: 3,
      description:
        "Controls which resources the browser may load, the primary defense against cross-site scripting.",
      grader: gradeCsp,
    },
    {
      name: "Strict-Transport-Security",
      key: "strict-transport-security",
      weight: 2,
      description:
        "Forces browsers to use HTTPS, preventing protocol-downgrade and man-in-the-middle attacks.",
      grader: gradeHsts,
    },
    {
      name: "X-Frame-Options",
      key: "x-frame-options",
      weight: 1,
      description:
        "Prevents your pages from being embedded in frames, protecting against clickjacking.",
      grader: gradeXFrameOptions,
    },
    {
      name: "X-Content-Type-Options",
      key: "x-content-type-options",
      weight: 1,
      description:
        "Stops the browser from MIME-sniffing responses away from the declared content type.",
      grader: gradeXContentTypeOptions,
    },
    {
      name: "Referrer-Policy",
      key: "referrer-policy",
      weight: 1,
      description:
        "Governs how much referrer information is shared when users navigate away from your site.",
      grader: gradeReferrerPolicy,
    },
    {
      name: "Permissions-Policy",
      key: "permissions-policy",
      weight: 1,
      description:
        "Restricts which powerful browser features (camera, geolocation, etc.) a page may use.",
      grader: gradePermissionsPolicy,
    },
  ];

  const headers: HeaderResult[] = definitions.map((def) => {
    const value = h.get(def.key);
    const { grade, message } = def.grader(value);
    return {
      name: def.name,
      key: def.key,
      value,
      grade,
      score: GRADE_SCORES[grade],
      weight: def.weight,
      message,
      description: def.description,
    };
  });

  const totalWeight = headers.reduce((sum, hr) => sum + hr.weight, 0);
  const weightedScore = headers.reduce(
    (sum, hr) => sum + hr.score * hr.weight,
    0
  );
  const score = Math.round(weightedScore / totalWeight);
  const grade = finalGrade(score);

  const payload: ScanSuccess = {
    url: parsed.toString(),
    grade,
    score,
    headers: headers.map(({ weight: _weight, ...rest }) => rest),
    scannedAt: new Date().toISOString(),
  };

  return NextResponse.json<ScanSuccess>(payload);
}
