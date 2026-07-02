import { useForm, useFieldArray } from "react-hook-form";
import { useNavigate } from "react-router";
import {
  useCreateFormMutation,
  QuestionType,
  type CreateFormInput,
  type QuestionInput,
} from "../api/generated";

type QuestionDraft = Omit<QuestionInput, "options"> & { options: string[] };
type FormBuilderValues = Omit<CreateFormInput, "questions"> & {
  questions: QuestionDraft[];
};

export const useFormBuilder = () => {
  const [createForm, { isLoading, error }] = useCreateFormMutation();
  const { register, control, handleSubmit, setValue } = useForm<FormBuilderValues>({
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
    await createForm({
      input: {
        title,
        description,
        questions: questions.map((q, i) => ({ ...q, order: i })),
      },
    }).unwrap();
    navigate("/");
  });

  return {
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
  };
};
