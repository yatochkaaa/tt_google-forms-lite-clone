import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router";
import {
  useGetFormQuery,
  useSubmitResponseMutation,
  QuestionType,
} from "../api/generated";

type AnswerMap = { [questionId: string]: string | string[] };
type FormFillValues = { answers: AnswerMap };

export const useFormFill = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading: formLoading, error: formError } = useGetFormQuery({ id: id! });
  const [submitResponse, { isLoading: submitting, error: submitError }] =
    useSubmitResponseMutation();

  const { register, handleSubmit, control, setValue } = useForm<FormFillValues>({
    defaultValues: { answers: {} },
  });

  const toggleCheckbox = (questionId: string, option: string, current: string[]) => {
    const next = current.includes(option)
      ? current.filter((v) => v !== option)
      : [...current, option];
    setValue(`answers.${questionId}`, next);
  };

  const onSubmit = handleSubmit(async ({ answers }) => {
    const form = data?.form;
    if (!form) return;

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
    navigate("/");
  });

  return {
    form: data?.form,
    formLoading,
    formError,
    register,
    control,
    toggleCheckbox,
    onSubmit,
    submitting,
    submitError,
  };
};
