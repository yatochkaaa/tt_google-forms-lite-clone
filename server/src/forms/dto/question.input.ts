import { Field, InputType, Int } from '@nestjs/graphql';
import { QuestionType } from '../models/question.model';

@InputType()
export class QuestionInput {
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
