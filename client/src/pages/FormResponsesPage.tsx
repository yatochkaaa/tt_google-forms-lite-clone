import { Link } from "react-router";
import { useFormResponses } from "../hooks/useFormResponses";
import { Header } from "../components/Header";

function FormResponsesPage() {
  const { form, responses, questionMap, isLoading, error } = useFormResponses();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-400">Loading...</p>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm text-red-500">Failed to load responses.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        breadcrumb={form.title}
        right={
          <Link
            to={`/forms/${form.id}/fill`}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Fill out →
          </Link>
        }
      />

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-4">
        <div className="bg-white border border-slate-200 border-l-4 border-l-indigo-500 rounded-lg px-6 py-5">
          <h1 className="text-lg font-semibold text-slate-800">{form.title}</h1>
          <p className="text-xs text-slate-400 mt-1">
            {responses.length === 0
              ? "No responses yet"
              : `${responses.length} response${responses.length === 1 ? "" : "s"}`}
          </p>
        </div>

        {responses.length === 0 && (
          <div className="border border-dashed border-slate-300 rounded-lg p-10 text-center">
            <p className="text-sm text-slate-400">No one has filled this form yet.</p>
            <Link
              to={`/forms/${form.id}/fill`}
              className="mt-3 inline-block text-sm text-indigo-600 hover:underline"
            >
              Be the first →
            </Link>
          </div>
        )}

        {responses.map((response, index) => (
          <div
            key={response.id}
            className="bg-white border border-slate-200 rounded-lg px-6 py-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">
                Response {index + 1}
              </span>
              <span className="text-xs text-slate-300">
                {new Date(response.createdAt).toLocaleString()}
              </span>
            </div>

            <div className="space-y-3">
              {response.answers.map((answer) => (
                <div key={answer.questionId} className="space-y-0.5">
                  <p className="text-xs text-slate-400">
                    {questionMap[answer.questionId] ?? answer.questionId}
                  </p>
                  <p className="text-sm text-slate-700">
                    {answer.values.length > 0 ? answer.values.join(", ") : "—"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

export default FormResponsesPage;
