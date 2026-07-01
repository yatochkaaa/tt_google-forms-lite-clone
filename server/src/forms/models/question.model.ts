import { ID, Field, ObjectType, Int, registerEnumType } from '@nestjs/graphql';

export enum QuestionType {
  TEXT = 'TEXT',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  CHECKBOX = 'CHECKBOX',
  DATE = 'DATE',
}

registerEnumType(QuestionType, { name: 'QuestionType' });

@ObjectType()
export class Question {
  @Field(() => ID)
  id!: string;

  @Field(() => QuestionType)
  type!: QuestionType;

  @Field()
  label!: string;

  @Field(() => [String], { nullable: true })
  options?: string[];

  @Field()
  required!: boolean;

  @Field(() => Int)
  order!: number;
}
