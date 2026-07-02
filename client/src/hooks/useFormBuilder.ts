import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useNavigate } from "react-router";
import {
  useCreateFormMutation,
  QuestionType,
  type CreateFormInput,
  type QuestionInput,
} from "../api/generated";

export type QuestionDraft = Omit<QuestionInput, "options"> & { options: string[] };
export type FormBuilderValues = Omit<CreateFormInput, "questions"> & {
  questions: QuestionDraft[];
};

export const useFormBuilder = () => {
  const [createForm, { isLoading }] = useCreateFormMutation();
  const [saveError, setSaveError] = useState(false);
  const { register, control, handleSubmit, setValue, formState: { errors } } = useForm<FormBuilderValues>({
    defaultValues: {
      title: "Untitled form",
      description: "",
      questions: [],
    },
  });
  const { fields, append, remove, update, move } = useFieldArray({
    control,
    name: "questions",
  });
  const navigate = useNavigate();

  const addQuestion = (type: QuestionType) => {
    const needsOptions =
      type === QuestionType.MultipleChoice || type === QuestionType.Checkbox;
    append({
      type,
      label: "",
      required: false,
      order: fields.length,
      options: needsOptions ? ["Option 1"] : [],
    });
  };

  const removeQuestion = (index: number) => remove(index);

  const addOption = (questionIndex: number) => {
    const question = fields[questionIndex];
    update(questionIndex, {
      ...question,
      options: [...question.options, `Option ${question.options.length + 1}`],
    });
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const question = fields[questionIndex];
    update(questionIndex, {
      ...question,
      options: question.options.filter((_, i) => i !== optionIndex),
    });
  };

  const onSubmit = handleSubmit(async ({ title, description, questions }) => {
    setSaveError(false);
    try {
      const input = {
        title,
        description: description?.trim() || undefined,
        questions: questions.map(({ type, label, required, options }, i) => ({
          type,
          label,
          required,
          options,
          order: i,
        })),
      };
      await createForm({ input }).unwrap();
      navigate("/");
    } catch (err) {
      console.error("[FormBuilder] save failed:", err);
      setSaveError(true);
    }
  });

  return {
    register,
    setValue,
    control,
    errors,
    onSubmit,
    fields,
    move,
    addQuestion,
    removeQuestion,
    addOption,
    removeOption,
    isLoading,
    error: saveError,
  };
};
