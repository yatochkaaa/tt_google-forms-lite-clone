import { useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router";
import {
  useGetFormQuery,
  useSubmitResponseMutation,
  QuestionType,
} from "../api/generated";

type AnswerMap = { [questionId: string]: string | string[] };
type FormFillValues = { answers: AnswerMap };

export const useFormFill = () => {
  const { id } = useParams<{ id: string }>();
  const [submitted, setSubmitted] = useState(false);

  const { data, isLoading: formLoading, error: formError } = useGetFormQuery({ id: id! });
  const [submitResponse, { isLoading: submitting, error: submitError }] =
    useSubmitResponseMutation();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FormFillValues>({ defaultValues: { answers: {} } });

  const toggleCheckbox = (questionId: string, option: string, current: string[]) => {
    const next = current.includes(option)
      ? current.filter((v) => v !== option)
      : [...current, option];
    setValue(`answers.${questionId}`, next);
    if (next.length > 0) {
      clearErrors(`answers.${questionId}`);
    }
  };

  const onSubmit = handleSubmit(async ({ answers }) => {
    const form = data?.form;
    if (!form) return;

    let hasError = false;
    for (const q of form.questions) {
      if (q.type === QuestionType.Checkbox && q.required) {
        const raw = answers[q.id] as string[] | undefined;
        if (!raw || raw.filter(Boolean).length === 0) {
          setError(`answers.${q.id}`, { message: "This field is required" });
          hasError = true;
        }
      }
    }
    if (hasError) return;

    await submitResponse({
      input: {
        formId: id!,
        answers: form.questions.map((q) => {
          const raw = answers[q.id];
          const values =
            q.type === QuestionType.Checkbox
              ? ((raw as string[] | undefined) ?? []).filter(Boolean)
              : raw
              ? [raw as string]
              : [];
          return { questionId: q.id, values };
        }),
      },
    }).unwrap();

    setSubmitted(true);
  });

  return {
    form: data?.form,
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
  };
};
