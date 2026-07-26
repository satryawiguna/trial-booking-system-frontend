import { apiClient, ApiClientError } from "./apiClient";

function mockFetchOnce(response: Partial<Response>) {
  global.fetch = jest.fn().mockResolvedValue(response) as unknown as typeof fetch;
}

describe("apiClient", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns parsed JSON on a successful GET request", async () => {
    mockFetchOnce({
      ok: true,
      status: 200,
      json: async () => ({ id: "1", title: "Beginner Piano" }),
    });

    const result = await apiClient.get<{ id: string; title: string }>(
      "/trial-classes/1",
    );

    expect(result).toEqual({ id: "1", title: "Beginner Piano" });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/trial-classes/1"),
      expect.objectContaining({ headers: expect.any(Object) }),
    );
  });

  it("sends a JSON body on POST and omits the body when none is given", async () => {
    mockFetchOnce({
      ok: true,
      status: 200,
      json: async () => ({ bookingId: "1", status: "CONFIRMED" }),
    });

    await apiClient.post("/bookings/1/payments");

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ method: "POST" }),
    );
    const callOptions = (global.fetch as jest.Mock).mock.calls[0][1];
    expect(callOptions.body).toBeUndefined();
  });

  it("throws an ApiClientError with the backend's statusCode/errorCode/message on a non-2xx response", async () => {
    mockFetchOnce({
      ok: false,
      status: 409,
      statusText: "Conflict",
      json: async () => ({
        statusCode: 409,
        errorCode: "CAPACITY_EXCEEDED",
        message: "This class is already full.",
      }),
    });

    await expect(apiClient.get("/trial-classes/1")).rejects.toMatchObject({
      statusCode: 409,
      errorCode: "CAPACITY_EXCEEDED",
      message: "This class is already full.",
    });
  });

  it("falls back to UNKNOWN_ERROR when the error body is not valid JSON", async () => {
    mockFetchOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: async () => {
        throw new Error("not json");
      },
    });

    await expect(apiClient.get("/trial-classes/1")).rejects.toMatchObject({
      statusCode: 500,
      errorCode: "UNKNOWN_ERROR",
    });
  });

  it("wraps network failures in a NETWORK_ERROR ApiClientError", async () => {
    global.fetch = jest.fn().mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(apiClient.get("/trial-classes")).rejects.toBeInstanceOf(
      ApiClientError,
    );
    await expect(apiClient.get("/trial-classes")).rejects.toMatchObject({
      errorCode: "NETWORK_ERROR",
    });
  });
});
