import { useWatch, type Control, type FieldErrors } from "react-hook-form";
import { Link } from "react-router";
import { useFormFill } from "../hooks/useFormFill";
import { QuestionType } from "../api/generated";
import { Header } from "../components/Header";

type AnswerMap = { [questionId: string]: string | string[] };
type FormErrors = FieldErrors<{ answers: AnswerMap }>;

type CheckboxGroupProps = {
  control: Control<{ answers: AnswerMap }>;
  questionId: string;
  options: string[];
  onToggle: (option: string, current: string[]) => void;
  error?: string;
};

function CheckboxGroup({ control, questionId, options, onToggle, error }: CheckboxGroupProps) {
  const selected =
    (useWatch({ control, name: `answers.${questionId}` }) as string[] | undefined) ?? [];

  return (
    <div className="space-y-2">
      {options.map((option) => (
        <label key={option} className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={selected.includes(option)}
            onChange={() => onToggle(option, selected)}
            className="accent-indigo-500"
          />
          <span className="text-sm text-slate-600">{option}</span>
        </label>
      ))}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function FormFillPage() {
  const {
    form,
    formLoading,
    formError,
    register,
    control,
    errors,
    toggleCheckbox,
    onSubmit,
    submitting,
    submitError,
    submitted,
  } = useFormFill();

  if (formLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-400">Loading...</p>
      </div>
    );
  }

  if (formError || !form) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm text-red-500">Form not found.</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header breadcrumb={form.title} />
        <div className="max-w-2xl mx-auto px-6 py-10">
          <div className="bg-white border border-slate-200 border-l-4 border-l-indigo-500 rounded-lg px-6 py-10 text-center">
            <p className="text-base font-semibold text-slate-800">
              Your response has been recorded.
            </p>
            <p className="text-sm text-slate-400 mt-1">Thank you for filling out this form.</p>
            <Link
              to="/"
              className="mt-6 inline-block text-sm text-indigo-600 hover:underline"
            >
              ← Back to all forms
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const answerErrors = (errors as FormErrors).answers;
  const questions = [...form.questions].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header breadcrumb={form.title} />

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-4">
        {submitError && (
          <p className="text-sm text-red-500">Failed to submit. Try again.</p>
        )}

        <div className="bg-white border border-slate-200 border-l-4 border-l-indigo-500 rounded-lg px-6 py-5">
          <h1 className="text-lg font-semibold text-slate-800">{form.title}</h1>
          {form.description && (
            <p className="text-sm text-slate-500 mt-1">{form.description}</p>
          )}
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {questions.map((question) => {
            const fieldError = answerErrors?.[question.id]?.message as string | undefined;
            return (
              <div
                key={question.id}
                className="bg-white border border-slate-200 border-l-4 border-l-indigo-300 rounded-lg px-6 py-5 space-y-3"
              >
                <p className="text-sm font-medium text-slate-800">
                  {question.label}
                  {question.required && (
                    <span className="text-red-400 ml-1">*</span>
                  )}
                </p>

                {question.type === QuestionType.Text && (
                  <div>
                    <input
                      {...register(`answers.${question.id}`, {
                        required: question.required ? "This field is required" : false,
                      })}
                      placeholder="Your answer"
                      className="w-full text-sm text-slate-600 placeholder:text-slate-300 outline-none border-b border-slate-200 pb-1.5 focus:border-indigo-400 transition-colors"
                    />
                    {fieldError && (
                      <p className="text-xs text-red-500 mt-1">{fieldError}</p>
                    )}
                  </div>
                )}

                {question.type === QuestionType.Date && (
                  <div>
                    <input
                      type="date"
                      {...register(`answers.${question.id}`, {
                        required: question.required ? "This field is required" : false,
                      })}
                      className="text-sm text-slate-600 outline-none border border-slate-200 rounded px-3 py-1.5 focus:border-indigo-400 transition-colors"
                    />
                    {fieldError && (
                      <p className="text-xs text-red-500 mt-1">{fieldError}</p>
                    )}
                  </div>
                )}

                {question.type === QuestionType.MultipleChoice && (
                  <div>
                    <div className="space-y-2">
                      {question.options?.map((option) => (
                        <label
                          key={option}
                          className="flex items-center gap-2.5 cursor-pointer"
                        >
                          <input
                            type="radio"
                            value={option}
                            {...register(`answers.${question.id}`, {
                              required: question.required ? "Please select an option" : false,
                            })}
                            className="accent-indigo-500"
                          />
                          <span className="text-sm text-slate-600">{option}</span>
                        </label>
                      ))}
                    </div>
                    {fieldError && (
                      <p className="text-xs text-red-500 mt-1">{fieldError}</p>
                    )}
                  </div>
                )}

                {question.type === QuestionType.Checkbox && (
                  <CheckboxGroup
                    control={control}
                    questionId={question.id}
                    options={question.options ?? []}
                    onToggle={(option, current) =>
                      toggleCheckbox(question.id, option, current)
                    }
                    error={fieldError}
                  />
                )}
              </div>
            );
          })}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-md transition-colors"
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default FormFillPage;
