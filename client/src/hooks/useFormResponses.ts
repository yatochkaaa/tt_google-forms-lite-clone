import { useParams } from "react-router";
import { useGetFormQuery, useGetResponsesQuery } from "../api/generated";

export const useFormResponses = () => {
  const { id } = useParams<{ id: string }>();

  const { data: formData, isLoading: formLoading, error: formError } =
    useGetFormQuery({ id: id! });
  const { data: responsesData, isLoading: responsesLoading, error: responsesError } =
    useGetResponsesQuery({ formId: id! });

  const form = formData?.form;
  const responses = responsesData?.responses ?? [];

  const questionMap = Object.fromEntries(
    (form?.questions ?? []).map((q) => [q.id, q.label])
  );

  return {
    form,
    responses,
    questionMap,
    isLoading: formLoading || responsesLoading,
    error: formError ?? responsesError,
  };
};
