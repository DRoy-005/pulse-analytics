// ============================================================
// PulseAnalytics API Client
// ============================================================
//
// Central place for communicating with the PulseAnalytics
// backend.
//
// The frontend talks to the Next.js proxy using the same
// browser origin. Next.js then forwards the request to the
// Express backend.
//
// This avoids browser CORS problems during development.
//
// ============================================================

// ============================================================
// API Configuration
// ============================================================
//
// We intentionally use a relative path here.
//
// Browser:
//   http://localhost:3000/backend-api/...
//
// Next.js proxy:
//   http://localhost:5000/...
//
// ============================================================

const API_BASE_URL = "http://localhost:5000";

// ============================================================
// API Request Helper
// ============================================================

async function apiFetch(
  path: string,
  options?: RequestInit
) {
  const url = `${API_BASE_URL}${path}`;

  try {
    const response = await fetch(url, {
      ...options,

      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },

      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`
      );
    }

    return response;
  } catch (error) {
    console.error(
      `PulseAnalytics API request failed: ${url}`,
      error
    );

    throw error;
  }
}

// ============================================================
// Analytics Types
// ============================================================

export interface AnalyticsMetrics {
  totalUsers: number;
  totalEvents: number;
  activeSessions: number;
  conversionRate: number;
}

export interface AnalyticsOverviewResponse {
  success: boolean;

  data: {
    period: {
      days: number;
      startDate: string;
      endDate: string;
    };

    metrics: AnalyticsMetrics;
  };
}

// ============================================================
// Get Dashboard Overview
// ============================================================

export async function getAnalyticsOverview(
  workspaceId: string,
  days = 7
): Promise<AnalyticsOverviewResponse> {
  const params = new URLSearchParams({
    workspaceId,
    days: String(days),
  });

  const response = await apiFetch(
    `/api/analytics/overview?${params.toString()}`,
    {
      method: "GET",
    }
  );

  return response.json();
}

// ============================================================
// Traffic Data
// ============================================================

export interface TrafficDataPoint {
  date: string;
  events: number;
}

export interface TrafficResponse {
  success: boolean;
  data: TrafficDataPoint[];
}

// ============================================================
// Get Traffic Data
// ============================================================

export async function getTrafficData(
  workspaceId: string,
  days = 7
): Promise<TrafficResponse> {
  const params = new URLSearchParams({
    workspaceId,
    days: String(days),
  });

  const response = await apiFetch(
    `/api/analytics/traffic?${params.toString()}`,
    {
      method: "GET",
    }
  );

  return response.json();
}

// ============================================================
// Analytics Event
// ============================================================

export interface AnalyticsEvent {
  id: string;

  workspaceId?: string;

  userId?: string | null;

  sessionId?: string | null;

  name: string;

  properties?: Record<string, unknown> | null;

  pageUrl: string | null;

  pageTitle: string | null;

  timestamp: string;

  createdAt?: string;

  user: {
    id: string;
    externalId: string;
    email: string | null;
  } | null;

  session: {
    id: string;
    deviceType: string | null;
    browser: string | null;
    operatingSystem: string | null;
    country: string | null;
    city: string | null;
  } | null;
}

// ============================================================
// Events Pagination
// ============================================================

export interface EventsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ============================================================
// Events Response
// ============================================================

export interface EventsResponse {
  success: boolean;

  data: AnalyticsEvent[];

  pagination: EventsPagination;
}

// ============================================================
// Get Recent Events
// ============================================================
//
// Supports:
//
// - Server-side pagination
// - Search
// - Event type filtering
// - Device filtering
// - Country filtering
// - Date range filtering
//
// ============================================================

export async function getRecentEvents(
  workspaceId: string,
  page = 1,
  limit = 10,
  search = "",
  eventName = "",
  deviceType = "",
  country = "",
  startDate = "",
  endDate = ""
): Promise<EventsResponse> {
  const params = new URLSearchParams({
    workspaceId,
    page: String(page),
    limit: String(limit),
  });

  if (search.trim()) {
    params.set(
      "search",
      search.trim()
    );
  }

  if (eventName) {
    params.set(
      "eventName",
      eventName
    );
  }

  if (deviceType) {
    params.set(
      "deviceType",
      deviceType
    );
  }

  if (country) {
    params.set(
      "country",
      country
    );
  }

  if (startDate) {
    params.set(
      "startDate",
      startDate
    );
  }

  if (endDate) {
    params.set(
      "endDate",
      endDate
    );
  }

  const response = await apiFetch(
    `/api/events?${params.toString()}`,
    {
      method: "GET",
    }
  );

  return response.json();
}

// ============================================================
// Event Types
// ============================================================

export interface EventTypesResponse {
  success: boolean;
  data: string[];
}

// ============================================================
// Get Event Types
// ============================================================

export async function getEventTypes(
  workspaceId: string
): Promise<EventTypesResponse> {
  const params = new URLSearchParams({
    workspaceId,
  });

  const response = await apiFetch(
    `/api/events/types?${params.toString()}`,
    {
      method: "GET",
    }
  );

  return response.json();
}


// ============================================================
// Top Events
// ============================================================

export interface TopEvent {
  name: string;
  count: number;
  percentage: number;
}

export interface TopEventsResponse {
  success: boolean;

  data: TopEvent[];

  period: {
    days: number;
    startDate: string;
    endDate: string;
  };
}

// ============================================================
// Get Top Events
// ============================================================
//
// Returns the most frequently triggered events during
// the requested period.
//
// ============================================================

export async function getTopEvents(
  workspaceId: string,
  days = 7,
  limit = 5
): Promise<TopEventsResponse> {
  const params = new URLSearchParams({
    workspaceId,
    days: String(days),
    limit: String(limit),
  });

  const response = await apiFetch(
    `/api/analytics/top-events?${params.toString()}`,
    {
      method: "GET",
    }
  );

  return response.json();
}

// ============================================================
// Device Breakdown
// ============================================================

export interface DeviceBreakdownItem {
  name: string;
  count: number;
  percentage: number;
}

export interface DeviceBreakdownResponse {
  success: boolean;
  data: DeviceBreakdownItem[];
  period: {
    days: number;
    startDate: string;
    endDate: string;
  };
}

export async function getDeviceBreakdown(
  workspaceId: string,
  days = 7
): Promise<DeviceBreakdownResponse> {
  const params = new URLSearchParams({
    workspaceId,
    days: String(days),
  });

  const response = await apiFetch(
    `/api/analytics/devices?${params.toString()}`,
    {
      method: "GET",
    }
  );

  return response.json();
}


// ============================================================
// Location Breakdown
// ============================================================

export interface LocationBreakdownItem {
  city: string;
  country: string;
  count: number;
}

export interface LocationBreakdownResponse {
  success: boolean;
  data: LocationBreakdownItem[];
  period: {
    days: number;
    startDate: string;
    endDate: string;
  };
}

export async function getLocationBreakdown(
  workspaceId: string,
  days = 7,
  limit = 5
): Promise<LocationBreakdownResponse> {
  const params = new URLSearchParams({
    workspaceId,
    days: String(days),
    limit: String(limit),
  });

  const response = await apiFetch(
    `/api/analytics/locations?${params.toString()}`,
    {
      method: "GET",
    }
  );

  return response.json();
}

// ============================================================
// Analytics Insight
// ============================================================

export interface AnalyticsInsight {
  title: string;
  description: string;
  activityChange: number;
  topEvent: string;
  topEventCount: number;

  period: {
    days: number;
    currentStart: string;
    currentEnd: string;
    previousStart: string;
    previousEnd: string;
  };
}

export interface AnalyticsInsightResponse {
  success: boolean;
  data: AnalyticsInsight;
}

// ============================================================
// Get Analytics Insight
// ============================================================
//
// Retrieves a data-driven insight generated by the backend.
//
// ============================================================

export async function getAnalyticsInsight(
  workspaceId: string,
  days = 7
): Promise<AnalyticsInsightResponse> {
  const params = new URLSearchParams({
    workspaceId,
    days: String(days),
  });

  const response = await apiFetch(
    `/api/analytics/insights?${params.toString()}`,
    {
      method: "GET",
    }
  );

  return response.json();
}

// ============================================================
// Segments
// ============================================================

export interface SegmentUser {
  userId: string;
  externalId: string;
  email: string | null;
  eventCount: number;
  lastActivity: string;
  deviceTypes: string[];
  countries: string[];
}

export interface SegmentSummary {
  totalUsers: number;
  totalEvents: number;
  days: number;
  filters: {
    eventName: string | null;
    deviceType: string | null;
    country: string | null;
    minEvents: number;
  };
}

export interface SegmentUsersResponse {
  success: boolean;
  data: {
    users: SegmentUser[];
    summary: SegmentSummary;
  };
}

/**
 * Fetch users matching the selected segment filters.
 */
export async function getSegmentUsers(
  workspaceId: string,
  days = 30,
  eventName = "",
  deviceType = "",
  country = "",
  minEvents = 1
): Promise<SegmentUsersResponse> {
  const params = new URLSearchParams({
    workspaceId,
    days: String(days),
    minEvents: String(minEvents),
  });

  if (eventName) {
    params.set("eventName", eventName);
  }

  if (deviceType) {
    params.set("deviceType", deviceType);
  }

  if (country) {
    params.set("country", country);
  }

  const response = await apiFetch(
    `/api/segments/users?${params.toString()}`,
    {
      method: "GET",
    }
  );

  return response.json();
}

// ============================================================
// Analytics Anomalies
// ============================================================

export interface AnalyticsAnomaly {
  date: string;
  eventCount: number;
  expectedCount: number;
  changePercent: number;
  type: "spike" | "drop";
  severity: "low" | "medium" | "high";
}

export interface AnalyticsAnomaliesResponse {
  success: boolean;
  data: {
    anomalies: AnalyticsAnomaly[];
    averageDailyEvents: number;
    analyzedDays: number;
  };
}

export async function getAnalyticsAnomalies(
  workspaceId: string,
  days = 30
): Promise<AnalyticsAnomaliesResponse> {
  const params = new URLSearchParams({
    workspaceId,
    days: String(days),
  });

  const response = await apiFetch(
    `/api/analytics/anomalies?${params.toString()}`,
    {
      method: "GET",
    }
  );

  return response.json();
}
// ============================================================
// Analytics Forecast
// ============================================================

export interface AnalyticsForecastPoint {
  date: string;
  predictedEvents: number;
  lowerBound: number;
  upperBound: number;
}

export interface AnalyticsForecastResponse {
  success: boolean;
  data: {
    historical: {
      date: string;
      eventCount: number;
    }[];
    forecast: AnalyticsForecastPoint[];
    trend:
      | "increasing"
      | "decreasing"
      | "stable"
      | "insufficient_data";
    averageDailyEvents: number;
    dailyTrend: number;
    forecastDays: number;
  };
}

export async function getAnalyticsForecast(
  workspaceId: string,
  days = 30
): Promise<AnalyticsForecastResponse> {
  const params = new URLSearchParams({
    workspaceId,
    days: String(days),
  });

  const response = await apiFetch(
    `/api/analytics/forecast?${params.toString()}`,
    {
      method: "GET",
    }
  );

  return response.json();
}

// ============================================================
// Authentication
// ============================================================

export interface AuthUser {
  id: string;
  email: string | null;
}

export interface AuthWorkspace {
  id: string;
  name: string;
  slug: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    token: string;
    user: AuthUser;
    workspace: AuthWorkspace;
  };
}

export interface MeResponse {
  success: boolean;
  data: {
    user: AuthUser;
    workspace: AuthWorkspace;
  };
}

// Register a new account
export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const response = await apiFetch(
    "/api/auth/register",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    }
  );

  return response.json();
}

// Login an existing account
export async function loginUser(
  email: string,
  password: string
): Promise<AuthResponse> {
  const response = await apiFetch(
    "/api/auth/login",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    }
  );

  return response.json();
}

// Get the currently authenticated user
export async function getCurrentUser(
  token: string
): Promise<MeResponse> {
  const response = await apiFetch(
    "/api/auth/me",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.json();
}