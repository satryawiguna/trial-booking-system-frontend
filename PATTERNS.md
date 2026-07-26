# PATTERNS.md — Coding Standards & Patterns

**Applies to:** `trial-booking-system-frontend`
**Architecture:** Clean Architecture Monorepo
**Framework:** Next.js (App Router) + TypeScript + Tailwind CSS

---

## 1. Project Structure (Clean Architecture Monorepo)

```
trial-booking-system-frontend/
├── apps/
│   ├── web/                 # Next.js — Parent View
│   │   └── src/app/         # App Router segments
│   └── admin/               # Next.js — Admin View
│       └── src/app/         # App Router segments
├── libs/
│   └── shared/              # Shared library — NO imports from apps/
│       ├── components/      # Reusable UI components
│       ├── hooks/           # Custom React hooks
│       ├── services/        # API client & service modules
│       ├── types/           # Shared TypeScript types & enums
│       └── utils/           # Pure utility functions
├── CLAUDE.md
├── AGENTS.md
└── PATTERNS.md
```

### Dependency Direction

```
apps/web ─┐
          ├──> libs/shared
apps/admin ┘
```

- **`libs/shared`** — Pure TypeScript/React. Tidak boleh import dari `apps/*`
- **`apps/web`** — Import dari `libs/shared` saja. Tidak boleh import dari `apps/admin`
- **`apps/admin`** — Import dari `libs/shared` saja. Tidak boleh import dari `apps/web`

### Path Aliases (tsconfig paths)

```json
{
  "compilerOptions": {
    "paths": {
      "@shared/*": ["../../libs/shared/*"]
    }
  }
}
```

---

## 2. Component Pattern

Setiap komponen memiliki folder sendiri dengan file terpisah.

### Folder Structure

```
libs/shared/components/{ComponentName}/
├── {ComponentName}.tsx          # Component implementation
├── {ComponentName}.types.ts     # Props interface & types
├── {ComponentName}.test.tsx     # Unit test
├── {ComponentName}.module.css   # Styles (jika tidak pakai Tailwind)
└── index.ts                     # Barrel export
```

### Component Template

```typescript
// TrialCard/index.ts
export { TrialCard } from "./TrialCard";
export type { TrialCardProps } from "./TrialCard.types";
```

```typescript
// TrialCard/TrialCard.types.ts
import type { TrialClass } from "@shared/types";

export interface TrialCardProps {
  trialClass: TrialClass;
  isFull: boolean;
  onClick?: () => void;
}
```

```typescript
// TrialCard/TrialCard.tsx
import { TrialCardProps } from "./TrialCard.types";

export function TrialCard({ trialClass, isFull, onClick }: TrialCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4 shadow-sm transition-shadow",
        isFull
          ? "cursor-not-allowed opacity-60"
          : "cursor-pointer hover:shadow-md",
      )}
      onClick={isFull ? undefined : onClick}
      role="article"
      aria-label={`${trialClass.subject} - ${trialClass.seatsAvailable} seats available`}
    >
      <h3 className="text-lg font-semibold">{trialClass.subject}</h3>
      <p className="text-muted-foreground text-sm">{trialClass.description}</p>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-sm">
          {trialClass.seatsAvailable} / {trialClass.capacity} seats available
        </span>
        {isFull && (
          <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-600">
            Full
          </span>
        )}
      </div>
    </div>
  );
}
```

### Rules

- ✅ SELALU ada barrel export (`index.ts`)
- ✅ SELALU ada types file terpisah untuk props
- ✅ SELALU gunakan semantic HTML + ARIA attributes
- ✅ SELALU handle semua visual states (default, disabled, loading, error)
- ❌ JANGAN硬code string — gunakan constants dari `@shared/utils/constants`
- ❌ JANGAN import langsung dari apps — komponen harus reusable

---

## 3. Page Pattern (Next.js App Router)

Setiap route segment memiliki 4 file standar.

### File Structure per Route

```
apps/{web|admin}/src/app/{route}/
├── page.tsx          # Main page component (required)
├── layout.tsx        # Layout wrapper (optional, untuk shared shell)
├── loading.tsx       # Loading skeleton (optional)
└── error.tsx         # Error boundary (optional)
```

### Page Template

```typescript
// apps/web/src/app/trial-classes/page.tsx
import { TrialClassList } from "@shared/components/TrialClassList";
import { trialClassService } from "@shared/services/trialClassService";

export default async function TrialClassesPage() {
  const trialClasses = await trialClassService.getAll();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Available Trial Classes</h1>
      <TrialClassList trialClasses={trialClasses} />
    </div>
  );
}
```

### Error Page Template

```typescript
// apps/web/src/app/trial-classes/error.tsx
"use client";

export default function Error({ error, reset }: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-muted-foreground text-sm">
        {error.message || "Failed to load trial classes. Please try again."}
      </p>
      <button
        onClick={() => reset()}
        className="rounded bg-primary px-4 py-2 text-white"
      >
        Try again
      </button>
    </div>
  );
}
```

### Loading Page Template

```typescript
// apps/web/src/app/trial-classes/loading.tsx
export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 h-8 w-64 animate-pulse rounded bg-gray-200" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    </div>
  );
}
```

### Rules

- ✅ SELALU sediakan `loading.tsx` untuk setiap route segment dengan data fetching
- ✅ SELALU sediakan `error.tsx` untuk setiap route segment
- ✅ Layout `layout.tsx` hanya untuk shared shell (navbar, footer)
- ✅ Client components yang perlu interaktivitas: gunakan `"use client"`
- ❌ JANGAN fetch data di client jika bisa di server (RSC)
- ❌ JANGAN gunakan `useEffect` untuk data fetching — prefer RSC atau React Query/SWR

---

## 4. API Service Pattern

### apiClient — Base HTTP Client

```typescript
// libs/shared/services/apiClient.ts
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

interface ApiError {
  statusCode: number;
  errorCode: string;
  message: string;
}

class ApiClientError extends Error {
  constructor(
    public statusCode: number,
    public errorCode: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new ApiClientError(error.statusCode, error.errorCode, error.message);
  }

  return response.json();
}

export const apiClient = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }),
};
```

### Service Module Pattern

```typescript
// libs/shared/services/trialClassService.ts
import { apiClient } from "./apiClient";
import type { TrialClass } from "@shared/types";

export const trialClassService = {
  getAll: () => apiClient.get<TrialClass[]>("/trial-classes"),

  getById: (id: string) => apiClient.get<TrialClass>(`/trial-classes/${id}`),

  getRoster: (id: string) =>
    apiClient.get<TrialClassRosterEntry[]>(`/trial-classes/${id}/roster`),
};
```

```typescript
// libs/shared/services/bookingService.ts
import { apiClient } from "./apiClient";
import type { Booking, CreateBookingInput, PaymentInput } from "@shared/types";

export const bookingService = {
  create: (input: CreateBookingInput) =>
    apiClient.post<Booking>("/bookings", input),

  getById: (id: string) => apiClient.get<Booking>(`/bookings/${id}`),

  submitPayment: (bookingId: string, input: PaymentInput) =>
    apiClient.post<Booking>(`/bookings/${bookingId}/payments`, input),

  cancel: (bookingId: string) =>
    apiClient.post<Booking>(`/bookings/${bookingId}/cancel`),
};
```

### Rules

- ✅ SELALU gunakan `apiClient` — jangan panggil `fetch()` langsung
- ✅ SELALU handle error dengan `ApiClientError` (punya `errorCode`)
- ✅ SELALU typed — response generic `<T>`
- ✅ Satu service file per domain entity
- ❌ JANGAN taruh logic bisnis di service layer
- ❌ JANGAN hardcode base URL

---

## 5. Error Handling Pattern

### Error Boundary (per route segment)

```typescript
// apps/web/src/app/error.tsx
"use client";

export default function GlobalError({ error, reset }: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isApiError = error instanceof ApiClientError;

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16" role="alert">
      <h2 className="text-xl font-semibold">
        {isApiError ? getErrorMessage(error.errorCode) : "Something went wrong"}
      </h2>
      <p className="text-muted-foreground text-sm">{error.message}</p>
      <button onClick={() => reset()} className="btn-primary">
        Try again
      </button>
    </div>
  );
}
```

### Error Message Mapping

```typescript
// libs/shared/utils/errorMessages.ts
const ERROR_MESSAGES: Record<string, string> = {
  CAPACITY_EXCEEDED: "This class is already full. Please choose another class.",
  DUPLICATE_BOOKING: "You have already booked this class.",
  PAYMENT_REQUIRED: "Payment is required to confirm your booking.",
  INVALID_TRANSITION:
    "This action is not allowed for the current booking status.",
  NETWORK_ERROR:
    "Unable to connect to the server. Please check your connection.",
};

export function getErrorMessage(errorCode: string): string {
  return (
    ERROR_MESSAGES[errorCode] ||
    "An unexpected error occurred. Please try again."
  );
}
```

### Rules

- ✅ SELALU tampilkan user-friendly error messages (bukan technical error)
- ✅ SELALU map `errorCode` dari backend ke human-readable message
- ✅ SELALU sediakan "Try again" / retry action
- ✅ Gunakan `error.tsx` untuk route-level error boundary
- ❌ JANGAN expose internal error details ke user

---

## 6. Loading Pattern

### Loading States

| Level             | Implementation                               | File                               |
| ----------------- | -------------------------------------------- | ---------------------------------- | ----------------------------------- |
| **Route segment** | `loading.tsx` dengan skeleton                | `apps/{web                         | admin}/src/app/{route}/loading.tsx` |
| **Component**     | Skeleton component dari `@shared/components` | `libs/shared/components/Skeleton/` |
| **Button/Action** | Spinner + disabled state                     | Inline dalam component             |

### Skeleton Component

```typescript
// libs/shared/components/Skeleton/Skeleton.tsx
interface SkeletonProps {
  className?: string;
  variant?: "text" | "card" | "image" | "circle";
}

export function Skeleton({ className, variant = "text" }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded bg-gray-200",
        variant === "text" && "h-4 w-full",
        variant === "card" && "h-40 w-full rounded-lg",
        variant === "image" && "aspect-video w-full rounded-lg",
        variant === "circle" && "h-10 w-10 rounded-full",
        className,
      )}
      role="status"
      aria-label="Loading"
    />
  );
}
```

### Rules

- ✅ SELALU ada `loading.tsx` di setiap route yang fetch data
- ✅ Skeleton harus mirror layout konten yang akan tampil
- ✅ Loading state harus accessible (`role="status"`, `aria-label`)
- ❌ JANGAN gunakan spinner saja — prefer skeleton yang mirror konten

---

## 7. Custom Hooks Pattern

```typescript
// libs/shared/hooks/useTrialClasses.ts
import { useState, useEffect } from "react";
import { trialClassService } from "@shared/services/trialClassService";
import type { TrialClass } from "@shared/types";

interface UseTrialClassesResult {
  trialClasses: TrialClass[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTrialClasses(): UseTrialClassesResult {
  const [trialClasses, setTrialClasses] = useState<TrialClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await trialClassService.getAll();
      setTrialClasses(data);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? getErrorMessage(err.errorCode)
          : "Failed to load classes",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  return { trialClasses, isLoading, error, refetch: fetch };
}
```

### Rules

- ✅ SELALU return `{ data, isLoading, error, refetch }` pattern
- ✅ SELALU handle error dengan user-friendly message
- ✅ Gunakan custom hooks untuk encapsulate data fetching logic
- ❌ JANGAN gunakan hooks untuk business logic

---

## 8. Naming Conventions

| Layer                  | Convention                     | Contoh                                               |
| ---------------------- | ------------------------------ | ---------------------------------------------------- |
| **Component**          | PascalCase                     | `TrialCard`, `BookingForm`, `Navbar`                 |
| **Component file**     | PascalCase                     | `TrialCard.tsx`, `BookingForm.tsx`                   |
| **Page file**          | kebab-case                     | `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx` |
| **Hook**               | camelCase, `use` prefix        | `useTrialClasses`, `useBooking`                      |
| **Hook file**          | camelCase                      | `useTrialClasses.ts`, `useBooking.ts`                |
| **Service**            | camelCase                      | `trialClassService`, `bookingService`                |
| **Service file**       | camelCase                      | `trialClassService.ts`, `bookingService.ts`          |
| **Type/Interface**     | PascalCase                     | `TrialClass`, `Booking`, `TrialCardProps`            |
| **Type file**          | PascalCase                     | `TrialCard.types.ts`, `Booking.types.ts`             |
| **Enum**               | PascalCase, UPPER_SNAKE values | `BookingStatus.CONFIRMED`, `PaymentStatus.SUCCESS`   |
| **Route segment**      | kebab-case                     | `/trial-classes`, `/booking-status`                  |
| **Folder (component)** | PascalCase                     | `TrialCard/`, `BookingForm/`                         |
| **Folder (route)**     | kebab-case                     | `trial-classes/`, `booking/`                         |
| **CSS class**          | Tailwind utility               | `flex`, `text-lg`, `font-semibold`                   |

---

## 9. Shared Types Pattern

```typescript
// libs/shared/types/booking.ts
export enum BookingStatus {
  PENDING_PAYMENT = "PENDING_PAYMENT",
  CONFIRMED = "CONFIRMED",
  PAYMENT_FAILED = "PAYMENT_FAILED",
  CANCELLED = "CANCELLED",
}

export enum PaymentStatus {
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

export interface Booking {
  id: string;
  studentId: string;
  trialClassId: string;
  status: BookingStatus;
  confirmedAt: string | null;
  createdAt: string;
}

export interface CreateBookingInput {
  studentId: string;
  trialClassId: string;
}

export interface PaymentInput {
  cardLastFour: string;
  amount: number;
}
```

```typescript
// libs/shared/types/trialClass.ts
export interface TrialClass {
  id: string;
  subject: string;
  description: string;
  teacherName: string;
  scheduledAt: string;
  capacity: number;
  seatsAvailable: number;
  isFull: boolean;
}

export interface TrialClassRosterEntry {
  studentName: string;
  parentName: string;
  confirmedAt: string;
}
```

### Rules

- ✅ SELALU gunakan `interface` untuk object types, `type` untuk unions/utility types
- ✅ SELALU export types dari barrel `libs/shared/types/index.ts`
- ✅ Enum values harus UPPER_SNAKE_CASE, konsisten dengan backend
- ❌ JANGAN duplikasi tipe — satu definisi di shared, reuse di apps

---

## 10. Testing Pattern

### Component Test

```typescript
// libs/shared/components/TrialCard/TrialCard.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { TrialCard } from "./TrialCard";
import type { TrialClass } from "@shared/types";

const mockTrialClass: TrialClass = {
  id: "1",
  subject: "Math Trial",
  description: "Fun math class for kids",
  teacherName: "Ms. Sarah",
  scheduledAt: "2026-08-01T10:00:00Z",
  capacity: 4,
  seatsAvailable: 2,
  isFull: false,
};

describe("TrialCard", () => {
  it("renders trial class information", () => {
    render(<TrialCard trialClass={mockTrialClass} isFull={false} />);
    expect(screen.getByText("Math Trial")).toBeInTheDocument();
    expect(screen.getByText(/2 \/ 4 seats available/)).toBeInTheDocument();
  });

  it("shows full state when isFull is true", () => {
    render(<TrialCard trialClass={{ ...mockTrialClass, isFull: true }} isFull />);
    expect(screen.getByText("Full")).toBeInTheDocument();
  });

  it("calls onClick when clicked and not full", () => {
    const handleClick = jest.fn();
    render(
      <TrialCard trialClass={mockTrialClass} isFull={false} onClick={handleClick} />,
    );
    fireEvent.click(screen.getByRole("article"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when full", () => {
    const handleClick = jest.fn();
    render(
      <TrialCard trialClass={{ ...mockTrialClass, isFull: true }} isFull onClick={handleClick} />,
    );
    fireEvent.click(screen.getByRole("article"));
    expect(handleClick).not.toHaveBeenCalled();
  });
});
```

### Integration Test

```typescript
// test/integration/web/trial-class-list.spec.ts
import { render, screen, waitFor } from "@testing-library/react";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

const server = setupServer(
  http.get("http://localhost:3000/api/v1/trial-classes", () => {
    return HttpResponse.json([
      { id: "1", subject: "Math Trial", seatsAvailable: 2, capacity: 4, isFull: false },
      { id: "2", subject: "Science Trial", seatsAvailable: 0, capacity: 4, isFull: true },
    ]);
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("Trial Class List Page", () => {
  it("displays list of available classes", async () => {
    render(<TrialClassesPage />);

    await waitFor(() => {
      expect(screen.getByText("Math Trial")).toBeInTheDocument();
      expect(screen.getByText("Science Trial")).toBeInTheDocument();
    });
  });

  it("shows full indicator for full classes", async () => {
    render(<TrialClassesPage />);

    await waitFor(() => {
      const fullCards = screen.getAllByText("Full");
      expect(fullCards).toHaveLength(1);
    });
  });
});
```

### Rules

- ✅ Component test: render, assert rendering, assert interactions
- ✅ Integration test: mock API dengan MSW, test page flow
- ✅ Test all states: loading, empty, error, success, edge cases
- ✅ Gunakan `@testing-library/react` + `jest-dom` matchers
- ❌ JANGAN test implementation details (internal state, private methods)
- ❌ JANGAN gunakan real API — selalu mock

---

## 11. Form Validation Pattern

```typescript
// libs/shared/utils/validators.ts
export function isValidUUID(value: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

export function isValidCardNumber(value: string): boolean {
  return /^\d{16}$/.test(value.replace(/\s/g, ""));
}

export function isRequired(value: string): boolean {
  return value.trim().length > 0;
}
```

```typescript
// libs/shared/hooks/useForm.ts
interface ValidationRule {
  required?: boolean;
  pattern?: RegExp;
  message: string;
}

interface FieldState {
  value: string;
  error: string | null;
  touched: boolean;
}

export function useForm<T extends Record<string, string>>(
  initialValues: T,
  validations: Partial<Record<keyof T, ValidationRule[]>>,
) {
  // Returns: { values, errors, touched, handleChange, handleBlur, handleSubmit, isValid }
}
```

### Rules

- ✅ Client-side validation hanya untuk UX (format, required fields)
- ✅ Business validation (duplicate, capacity) tetap di backend
- ✅ Tampilkan error message di bawah field yang validasi gagal
- ✅ JANGAN submit form jika client-side validation gagal

---

## 12. CSS & Styling Pattern

- ✅ Gunakan Tailwind CSS utility classes
- ✅ Gunakan `cn()` utility untuk conditional class merging
- ✅ Design tokens (colors, spacing, typography) dari `design/design-system.md`
- ✅ Responsive: mobile-first dengan Tailwind breakpoints (`sm:`, `md:`, `lg:`, `xl:`)
- ❌ JANGAN gunakan inline styles kecuali untuk dynamic values
- ❌ JANGAN hardcode warna — gunakan Tailwind theme tokens

```typescript
// libs/shared/utils/cn.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## 13. Accessibility Pattern

- ✅ Setiap interactive element punya `role` yang sesuai
- ✅ Setiap form input punya `<label>` terkait
- ✅ Images punya `alt` text
- ✅ Color contrast memenuhi WCAG AA
- ✅ Keyboard navigation support (tabIndex, onKeyDown untuk Enter/Space)
- ✅ Gunakan `aria-label`, `aria-describedby`, `aria-live` untuk dynamic content
- ✅ Loading states gunakan `role="status"` + `aria-label`
- ✅ Error messages gunakan `role="alert"`

---

## 14. API Error Codes Reference

| Error Code           | HTTP | Frontend Handling                                 |
| -------------------- | ---- | ------------------------------------------------- |
| `CAPACITY_EXCEEDED`  | 409  | Tampilkan "Class is full", redirect ke class list |
| `DUPLICATE_BOOKING`  | 409  | Tampilkan "You have already booked this class"    |
| `PAYMENT_REQUIRED`   | 422  | Tampilkan "Payment required to confirm"           |
| `INVALID_TRANSITION` | 422  | Tampilkan "Action not allowed for current status" |
| `VALIDATION_ERROR`   | 400  | Tampilkan field-level validation errors           |
| `NOT_FOUND`          | 404  | Tampilkan "Resource not found" + redirect         |

---

## 15. Environment Variables

```bash
# apps/web/.env.example
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

```bash
# apps/admin/.env.example
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

### Rules

- ✅ Semua public env vars prefixed dengan `NEXT_PUBLIC_`
- ✅ Server-only env vars (secrets) TANPA prefix `NEXT_PUBLIC_`
- ✅ SELALU commit `.env.example` (jangan commit `.env`)
