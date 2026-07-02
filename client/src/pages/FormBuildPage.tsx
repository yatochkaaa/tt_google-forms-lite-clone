import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { UseFormRegister, UseFormSetValue, FieldArrayWithId } from "react-hook-form";
import { useFormBuilder, type FormBuilderValues } from "../hooks/useFormBuilder";
import { QuestionType } from "../api/generated";
import { Header } from "../components/Header";

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  [QuestionType.Text]: "Text",
  [QuestionType.MultipleChoice]: "Multiple choice",
  [QuestionType.Checkbox]: "Checkboxes",
  [QuestionType.Date]: "Date",
};

type FieldItem = FieldArrayWithId<FormBuilderValues, "questions", "id">;

type QuestionCardProps = {
  field: FieldItem;
  index: number;
  register: UseFormRegister<FormBuilderValues>;
  setValue: UseFormSetValue<FormBuilderValues>;
  onAddOption: () => void;
  onRemoveOption: (optionIndex: number) => void;
  onRemove: () => void;
};

function SortableQuestionCard({
  field,
  index,
  register,
  setValue,
  onAddOption,
  onRemoveOption,
  onRemove,
}: QuestionCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div className="bg-white border border-slate-200 border-l-4 border-l-indigo-300 rounded-lg px-6 py-5 space-y-3">
        <div className="flex items-start gap-3">
          <button
            type="button"
            className="mt-1 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-400 shrink-0"
            {...attributes}
            {...listeners}
          >
            <svg width="12" height="20" viewBox="0 0 12 20" fill="currentColor">
              <circle cx="4" cy="4" r="1.5" />
              <circle cx="4" cy="10" r="1.5" />
              <circle cx="4" cy="16" r="1.5" />
              <circle cx="9" cy="4" r="1.5" />
              <circle cx="9" cy="10" r="1.5" />
              <circle cx="9" cy="16" r="1.5" />
            </svg>
          </button>

          <div className="flex-1 flex items-start justify-between gap-4">
            <input
              {...register(`questions.${index}.label`)}
              placeholder="Question"
              className="flex-1 text-sm font-medium text-slate-800 placeholder:text-slate-300 outline-none border-b border-slate-100 pb-1.5 focus:border-indigo-400 transition-colors"
            />
            <select
              {...register(`questions.${index}.type`)}
              className="text-xs text-slate-500 border border-slate-200 rounded px-2 py-1 outline-none focus:border-indigo-400"
            >
              {Object.values(QuestionType).map((type) => (
                <option key={type} value={type}>
                  {QUESTION_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(field.type === QuestionType.MultipleChoice ||
          field.type === QuestionType.Checkbox) && (
          <div className="space-y-2 pl-6">
            {field.options.map((_, optionIndex) => (
              <div key={optionIndex} className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 border border-slate-300 shrink-0 ${
                    field.type === QuestionType.Checkbox ? "rounded-full" : "rounded-sm"
                  }`}
                />
                <input
                  {...register(`questions.${index}.options.${optionIndex}`, {
                    onBlur: (e) => {
                      if (!e.target.value.trim()) {
                        setValue(
                          `questions.${index}.options.${optionIndex}`,
                          `Option ${optionIndex + 1}`
                        );
                      }
                    },
                  })}
                  placeholder={`Option ${optionIndex + 1}`}
                  className="flex-1 text-xs text-slate-600 placeholder:text-slate-300 outline-none border-b border-slate-100 pb-1 focus:border-indigo-400 transition-colors"
                />
                {field.options.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemoveOption(optionIndex)}
                    className="text-slate-300 hover:text-red-400 text-xs transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={onAddOption}
              className="text-xs text-indigo-500 hover:text-indigo-700 mt-1"
            >
              + Add option
            </button>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 pl-6">
          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              {...register(`questions.${index}.required`)}
              className="accent-indigo-500"
            />
            Required
          </label>
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-slate-300 hover:text-red-400 transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

function FormBuildPage() {
  const {
    register,
    setValue,
    onSubmit,
    fields,
    move,
    addQuestion,
    removeQuestion,
    addOption,
    removeOption,
    isLoading,
    error,
  } = useFormBuilder();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const from = fields.findIndex((f) => f.id === active.id);
      const to = fields.findIndex((f) => f.id === over.id);
      move(from, to);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        breadcrumb="New form"
        right={
          <button
            onClick={onSubmit}
            disabled={isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-1.5 rounded-md transition-colors"
          >
            {isLoading ? "Saving..." : "Save form"}
          </button>
        }
      />

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-4">
        {error && (
          <p className="text-sm text-red-500">Failed to save form. Try again.</p>
        )}

        <div className="bg-white border border-slate-200 border-l-4 border-l-indigo-500 rounded-lg px-6 py-5 space-y-4">
          <input
            {...register("title", {
              onBlur: (e) => {
                if (!e.target.value.trim()) {
                  setValue("title", "Untitled form");
                }
              },
            })}
            placeholder="Form title"
            className="w-full text-lg font-semibold text-slate-800 placeholder:text-slate-300 outline-none border-b border-slate-100 pb-2 focus:border-indigo-400 transition-colors"
          />
          <input
            {...register("description")}
            placeholder="Description (optional)"
            className="w-full text-sm text-slate-500 placeholder:text-slate-300 outline-none"
          />
        </div>

        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <SortableContext
            items={fields.map((f) => f.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {fields.map((field, index) => (
                <SortableQuestionCard
                  key={field.id}
                  field={field}
                  index={index}
                  register={register}
                  setValue={setValue}
                  onAddOption={() => addOption(index)}
                  onRemoveOption={(optionIndex) => removeOption(index, optionIndex)}
                  onRemove={() => removeQuestion(index)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <div className="flex flex-wrap gap-2 pt-2">
          {Object.values(QuestionType).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => addQuestion(type)}
              className="text-xs border border-slate-200 bg-white text-slate-500 hover:border-indigo-400 hover:text-indigo-600 px-3 py-1.5 rounded-md transition-colors"
            >
              + {QUESTION_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

export default FormBuildPage;
