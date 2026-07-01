import { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
import { api } from '../store/baseApi';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: string; output: string; }
};

export type Answer = {
  __typename?: 'Answer';
  questionId: Scalars['ID']['output'];
  values: Array<Scalars['String']['output']>;
};

export type AnswerInput = {
  questionId: Scalars['ID']['input'];
  values: Array<Scalars['String']['input']>;
};

export type CreateFormInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  questions: Array<QuestionInput>;
  title: Scalars['String']['input'];
};

export type Form = {
  __typename?: 'Form';
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  questions: Array<Question>;
  title: Scalars['String']['output'];
};

export type FormResponse = {
  __typename?: 'FormResponse';
  answers: Array<Answer>;
  createdAt: Scalars['DateTime']['output'];
  formId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createForm: Form;
  submitResponse: FormResponse;
};


export type MutationCreateFormArgs = {
  input: CreateFormInput;
};


export type MutationSubmitResponseArgs = {
  input: ResponseInput;
};

export type Query = {
  __typename?: 'Query';
  form?: Maybe<Form>;
  forms: Array<Form>;
  responses: Array<FormResponse>;
};


export type QueryFormArgs = {
  id: Scalars['ID']['input'];
};


export type QueryResponsesArgs = {
  formId: Scalars['ID']['input'];
};

export type Question = {
  __typename?: 'Question';
  id: Scalars['ID']['output'];
  label: Scalars['String']['output'];
  options?: Maybe<Array<Scalars['String']['output']>>;
  order: Scalars['Int']['output'];
  required: Scalars['Boolean']['output'];
  type: QuestionType;
};

export type QuestionInput = {
  label: Scalars['String']['input'];
  options?: InputMaybe<Array<Scalars['String']['input']>>;
  order: Scalars['Int']['input'];
  required: Scalars['Boolean']['input'];
  type: QuestionType;
};

export const QuestionType = {
  Checkbox: 'CHECKBOX',
  Date: 'DATE',
  MultipleChoice: 'MULTIPLE_CHOICE',
  Text: 'TEXT'
} as const;

export type QuestionType = typeof QuestionType[keyof typeof QuestionType];
export type ResponseInput = {
  answers: Array<AnswerInput>;
  formId: Scalars['ID']['input'];
};

export type GetFormsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetFormsQuery = { __typename?: 'Query', forms: Array<{ __typename?: 'Form', id: string, title: string, description?: string | null, createdAt: string }> };

export type GetFormQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetFormQuery = { __typename?: 'Query', form?: { __typename?: 'Form', id: string, title: string, description?: string | null, createdAt: string, questions: Array<{ __typename?: 'Question', id: string, type: QuestionType, label: string, options?: Array<string> | null, required: boolean, order: number }> } | null };

export type CreateFormMutationVariables = Exact<{
  input: CreateFormInput;
}>;


export type CreateFormMutation = { __typename?: 'Mutation', createForm: { __typename?: 'Form', id: string, title: string } };

export type GetResponsesQueryVariables = Exact<{
  formId: Scalars['ID']['input'];
}>;


export type GetResponsesQuery = { __typename?: 'Query', responses: Array<{ __typename?: 'FormResponse', id: string, formId: string, createdAt: string, answers: Array<{ __typename?: 'Answer', questionId: string, values: Array<string> }> }> };

export type SubmitResponseMutationVariables = Exact<{
  input: ResponseInput;
}>;


export type SubmitResponseMutation = { __typename?: 'Mutation', submitResponse: { __typename?: 'FormResponse', id: string, formId: string } };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}

export const GetFormsDocument = new TypedDocumentString(`
    query GetForms {
  forms {
    id
    title
    description
    createdAt
  }
}
    `);
export const GetFormDocument = new TypedDocumentString(`
    query GetForm($id: ID!) {
  form(id: $id) {
    id
    title
    description
    createdAt
    questions {
      id
      type
      label
      options
      required
      order
    }
  }
}
    `);
export const CreateFormDocument = new TypedDocumentString(`
    mutation CreateForm($input: CreateFormInput!) {
  createForm(input: $input) {
    id
    title
  }
}
    `);
export const GetResponsesDocument = new TypedDocumentString(`
    query GetResponses($formId: ID!) {
  responses(formId: $formId) {
    id
    formId
    createdAt
    answers {
      questionId
      values
    }
  }
}
    `);
export const SubmitResponseDocument = new TypedDocumentString(`
    mutation SubmitResponse($input: ResponseInput!) {
  submitResponse(input: $input) {
    id
    formId
  }
}
    `);

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    GetForms: build.query<GetFormsQuery, GetFormsQueryVariables | void>({
      query: (variables) => ({ document: GetFormsDocument as unknown as string, variables })
    }),
    GetForm: build.query<GetFormQuery, GetFormQueryVariables>({
      query: (variables) => ({ document: GetFormDocument as unknown as string, variables })
    }),
    CreateForm: build.mutation<CreateFormMutation, CreateFormMutationVariables>({
      query: (variables) => ({ document: CreateFormDocument as unknown as string, variables })
    }),
    GetResponses: build.query<GetResponsesQuery, GetResponsesQueryVariables>({
      query: (variables) => ({ document: GetResponsesDocument as unknown as string, variables })
    }),
    SubmitResponse: build.mutation<SubmitResponseMutation, SubmitResponseMutationVariables>({
      query: (variables) => ({ document: SubmitResponseDocument as unknown as string, variables })
    }),
  }),
});

export { injectedRtkApi as api };
export const { useGetFormsQuery, useLazyGetFormsQuery, useGetFormQuery, useLazyGetFormQuery, useCreateFormMutation, useGetResponsesQuery, useLazyGetResponsesQuery, useSubmitResponseMutation } = injectedRtkApi;

