import { Link } from "react-router";
import { useForms } from "../hooks/useForms";
import { Header } from "../components/Header";

function HomePage() {
  const { forms, isLoading, error } = useForms();

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        right={
          <Link
            to="/forms/new"
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-1.5 rounded-md transition-colors"
          >
            New form
          </Link>
        }
      />

      <main className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-5">
          Your forms
        </h1>

        {isLoading && (
          <p className="text-sm text-slate-400">Loading...</p>
        )}

        {error && (
          <p className="text-sm text-red-500">
            Failed to load forms. Check your server connection.
          </p>
        )}

        {!isLoading && !error && forms.length === 0 && (
          <div className="border border-dashed border-slate-300 rounded-lg p-10 text-center">
            <p className="text-sm text-slate-400">No forms yet.</p>
            <Link
              to="/forms/new"
              className="mt-3 inline-block text-sm text-indigo-600 hover:underline"
            >
              Create your first →
            </Link>
          </div>
        )}

        <ul className="space-y-2">
          {forms.map((form) => (
            <li
              key={form.id}
              className="bg-white border border-slate-200 border-l-4 border-l-indigo-500 rounded-lg px-5 py-4 flex items-center justify-between hover:shadow-sm transition-shadow"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">
                  {form.title}
                </p>
                {form.description && (
                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                    {form.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4 ml-6 shrink-0">
                <Link
                  to={`/forms/${form.id}/fill`}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                >
                  Fill out
                </Link>
                <Link
                  to={`/forms/${form.id}/responses`}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Responses
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

export default HomePage;
