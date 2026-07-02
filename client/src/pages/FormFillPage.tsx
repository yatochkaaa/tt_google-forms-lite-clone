import { useWatch, type Control } from "react-hook-form";
import { useFormFill } from "../hooks/useFormFill";
import { QuestionType } from "../api/generated";
import { Header } from "../components/Header";

type AnswerMap = { [questionId: string]: string | string[] };

type CheckboxGroupProps = {
  control: Control<{ answers: AnswerMap }>;
  questionId: string;
  options: string[];
  onToggle: (option: string, current: string[]) => void;
};

function CheckboxGroup({ control, questionId, options, onToggle }: CheckboxGroupProps) {
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
    toggleCheckbox,
    onSubmit,
    submitting,
    submitError,
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
          {questions.map((question) => (
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
                <input
                  {...register(`answers.${question.id}`)}
                  placeholder="Your answer"
                  className="w-full text-sm text-slate-600 placeholder:text-slate-300 outline-none border-b border-slate-200 pb-1.5 focus:border-indigo-400 transition-colors"
                />
              )}

              {question.type === QuestionType.Date && (
                <input
                  type="date"
                  {...register(`answers.${question.id}`)}
                  className="text-sm text-slate-600 outline-none border border-slate-200 rounded px-3 py-1.5 focus:border-indigo-400 transition-colors"
                />
              )}

              {question.type === QuestionType.MultipleChoice && (
                <div className="space-y-2">
                  {question.options?.map((option) => (
                    <label
                      key={option}
                      className="flex items-center gap-2.5 cursor-pointer"
                    >
                      <input
                        type="radio"
                        value={option}
                        {...register(`answers.${question.id}`)}
                        className="accent-indigo-500"
                      />
                      <span className="text-sm text-slate-600">{option}</span>
                    </label>
                  ))}
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
                />
              )}
            </div>
          ))}

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
