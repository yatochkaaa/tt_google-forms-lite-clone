/**
 * Integration tests for critical user flows.
 *
 * These tests use a real Redux store and mock only the network layer
 * (the GraphQL client's request method). This is the only level at which
 * RTK Query cache invalidation can be verified — unit tests that mock
 * the RTK hooks themselves bypass the entire caching mechanism and cannot
 * catch bugs like "entity created but not visible in the list."
 *
 * Each test maps to a concrete user scenario:
 *   - user creates a form → it must appear in the home page list
 *   - user submits a response → it must appear on the responses page
 */
import { vi, describe, it, expect, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { type ReactNode } from "react";

// vi.hoisted ensures mockRequest is initialised before vi.mock's factory runs,
// since vi.mock itself is hoisted above all import statements by Vitest.
const mockRequest = vi.hoisted(() => vi.fn());

vi.mock("graphql-request", () => ({
  // Must be a regular function — arrow functions cannot be used as constructors.
  GraphQLClient: vi.fn(function () {
    return { request: mockRequest };
  }),
}));

// Importing api triggers the GraphQLClient constructor (now mocked).
// Importing generated triggers api.injectEndpoints for all operations.
import { api } from "./baseApi";
import {
  useGetFormsQuery,
  useCreateFormMutation,
  useGetResponsesQuery,
  useSubmitResponseMutation,
} from "../api/generated";

// Replicate the enhanceEndpoints config from main.tsx.
// This is the production wiring being tested — omitting or misconfiguring
// tags here is exactly the class of bug these tests are designed to catch.
api.enhanceEndpoints({
  endpoints: {
    GetForms: { providesTags: ["Form"] },
    CreateForm: { invalidatesTags: ["Form"] },
    GetResponses: { providesTags: ["Response"] },
    SubmitResponse: { invalidatesTags: ["Response"] },
  },
});

const makeStore = () =>
  configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (gDM) => gDM().concat(api.middleware),
  });

type Store = ReturnType<typeof makeStore>;

// Each test gets its own store so cache state never leaks between tests.
const wrap = (store: Store) =>
  function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  };

describe("Critical user flows — entity visibility after action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── form creation ────────────────────────────────────────────────────────

  it("created form immediately appears in the forms list", async () => {
    const store = makeStore();
    const FORM = {
      id: "f-1",
      title: "Feedback",
      description: "",
      createdAt: new Date().toISOString(),
    };

    // Request 1 — initial GetForms fetch: list is empty
    mockRequest.mockResolvedValueOnce({ forms: [] });

    const { result: formsHook } = renderHook(() => useGetFormsQuery(), {
      wrapper: wrap(store),
    });

    await waitFor(() => expect(formsHook.current.isSuccess).toBe(true));
    expect(formsHook.current.data?.forms).toHaveLength(0);

    // Request 2 — CreateForm mutation
    // Request 3 — GetForms refetch triggered by "Form" cache invalidation
    mockRequest
      .mockResolvedValueOnce({ createForm: { id: FORM.id, title: FORM.title } })
      .mockResolvedValueOnce({ forms: [FORM] });

    const { result: createHook } = renderHook(() => useCreateFormMutation(), {
      wrapper: wrap(store),
    });

    await act(async () => {
      await createHook.current[0]({
        input: { title: "Feedback", questions: [] },
      }).unwrap();
    });

    await waitFor(() =>
      expect(formsHook.current.data?.forms).toHaveLength(1),
    );
    expect(formsHook.current.data?.forms[0].id).toBe("f-1");
  });

  it("forms list grows by one for each created form", async () => {
    const store = makeStore();
    const ts = new Date().toISOString();
    const FORM_A = { id: "f-a", title: "Form A", description: "", createdAt: ts };
    const FORM_B = { id: "f-b", title: "Form B", description: "", createdAt: ts };

    // Initial fetch → empty
    mockRequest.mockResolvedValueOnce({ forms: [] });
    const { result: formsHook } = renderHook(() => useGetFormsQuery(), {
      wrapper: wrap(store),
    });
    await waitFor(() => expect(formsHook.current.isSuccess).toBe(true));

    const { result: createHook } = renderHook(() => useCreateFormMutation(), {
      wrapper: wrap(store),
    });

    // Create first form
    mockRequest
      .mockResolvedValueOnce({ createForm: { id: FORM_A.id, title: FORM_A.title } })
      .mockResolvedValueOnce({ forms: [FORM_A] });

    await act(async () => {
      await createHook.current[0]({
        input: { title: "Form A", questions: [] },
      }).unwrap();
    });
    await waitFor(() => expect(formsHook.current.data?.forms).toHaveLength(1));

    // Create second form
    mockRequest
      .mockResolvedValueOnce({ createForm: { id: FORM_B.id, title: FORM_B.title } })
      .mockResolvedValueOnce({ forms: [FORM_A, FORM_B] });

    await act(async () => {
      await createHook.current[0]({
        input: { title: "Form B", questions: [] },
      }).unwrap();
    });
    await waitFor(() => expect(formsHook.current.data?.forms).toHaveLength(2));

    const ids = formsHook.current.data!.forms.map((f) => f.id);
    expect(ids).toContain("f-a");
    expect(ids).toContain("f-b");
  });

  // ─── response submission ──────────────────────────────────────────────────

  it("submitted response immediately appears in the responses list", async () => {
    const store = makeStore();
    const RESPONSE = {
      id: "r-1",
      formId: "form-1",
      createdAt: new Date().toISOString(),
      answers: [{ questionId: "q-1", values: ["Alice"] }],
    };

    // Request 1 — initial GetResponses fetch: empty
    mockRequest.mockResolvedValueOnce({ responses: [] });

    const { result: responsesHook } = renderHook(
      () => useGetResponsesQuery({ formId: "form-1" }),
      { wrapper: wrap(store) },
    );

    await waitFor(() => expect(responsesHook.current.isSuccess).toBe(true));
    expect(responsesHook.current.data?.responses).toHaveLength(0);

    // Request 2 — SubmitResponse mutation
    // Request 3 — GetResponses refetch triggered by "Response" cache invalidation
    mockRequest
      .mockResolvedValueOnce({ submitResponse: { id: "r-1", formId: "form-1" } })
      .mockResolvedValueOnce({ responses: [RESPONSE] });

    const { result: submitHook } = renderHook(() => useSubmitResponseMutation(), {
      wrapper: wrap(store),
    });

    await act(async () => {
      await submitHook.current[0]({
        input: {
          formId: "form-1",
          answers: [{ questionId: "q-1", values: ["Alice"] }],
        },
      }).unwrap();
    });

    await waitFor(() =>
      expect(responsesHook.current.data?.responses).toHaveLength(1),
    );
    expect(responsesHook.current.data?.responses[0].id).toBe("r-1");
  });

  it("responses list grows by one for each submission", async () => {
    const store = makeStore();
    const ts = new Date().toISOString();
    const R1 = { id: "r-1", formId: "form-1", createdAt: ts, answers: [] };
    const R2 = { id: "r-2", formId: "form-1", createdAt: ts, answers: [] };

    mockRequest.mockResolvedValueOnce({ responses: [] });
    const { result: responsesHook } = renderHook(
      () => useGetResponsesQuery({ formId: "form-1" }),
      { wrapper: wrap(store) },
    );
    await waitFor(() => expect(responsesHook.current.isSuccess).toBe(true));

    const { result: submitHook } = renderHook(() => useSubmitResponseMutation(), {
      wrapper: wrap(store),
    });

    // First submission
    mockRequest
      .mockResolvedValueOnce({ submitResponse: { id: "r-1", formId: "form-1" } })
      .mockResolvedValueOnce({ responses: [R1] });

    await act(async () => {
      await submitHook.current[0]({
        input: { formId: "form-1", answers: [] },
      }).unwrap();
    });
    await waitFor(() => expect(responsesHook.current.data?.responses).toHaveLength(1));

    // Second submission
    mockRequest
      .mockResolvedValueOnce({ submitResponse: { id: "r-2", formId: "form-1" } })
      .mockResolvedValueOnce({ responses: [R1, R2] });

    await act(async () => {
      await submitHook.current[0]({
        input: { formId: "form-1", answers: [] },
      }).unwrap();
    });
    await waitFor(() => expect(responsesHook.current.data?.responses).toHaveLength(2));
  });

  it("responses for form-A do not appear when viewing form-B", async () => {
    const store = makeStore();
    const ts = new Date().toISOString();
    const R_A = { id: "r-a", formId: "form-a", createdAt: ts, answers: [] };

    // Invalidating "Response" refetches ALL active Response queries simultaneously,
    // so call order is non-deterministic. Use mockImplementation that dispatches
    // on variables instead of relying on mockResolvedValueOnce ordering.
    //
    // graphql-request-base-query v2 calls client.request({ document, variables, ... })
    // as a single object — NOT client.request(document, variables).
    let submitted = false;
    mockRequest.mockImplementation(
      async ({ variables }: { variables?: Record<string, unknown> }) => {
        if (variables && "input" in variables) {
          submitted = true;
          return { submitResponse: { id: "r-a", formId: "form-a" } };
        }
        const formId = variables?.formId as string | undefined;
        return {
          responses: submitted && formId === "form-a" ? [R_A] : [],
        };
      },
    );

    const { result: formBHook } = renderHook(
      () => useGetResponsesQuery({ formId: "form-b" }),
      { wrapper: wrap(store) },
    );
    const { result: formAHook } = renderHook(
      () => useGetResponsesQuery({ formId: "form-a" }),
      { wrapper: wrap(store) },
    );

    await waitFor(() => expect(formBHook.current.isSuccess).toBe(true));
    await waitFor(() => expect(formAHook.current.isSuccess).toBe(true));

    const { result: submitHook } = renderHook(() => useSubmitResponseMutation(), {
      wrapper: wrap(store),
    });

    await act(async () => {
      await submitHook.current[0]({
        input: { formId: "form-a", answers: [] },
      }).unwrap();
    });

    await waitFor(() =>
      expect(formAHook.current.data?.responses).toHaveLength(1),
    );
    expect(formBHook.current.data?.responses).toHaveLength(0);
  });
});
