import { useGetFormsQuery } from "../api/generated";

export const useForms = () => {
  const { data, isLoading, error } = useGetFormsQuery();

  return {
    forms: data?.forms ?? [],
    isLoading,
    error,
  };
};
