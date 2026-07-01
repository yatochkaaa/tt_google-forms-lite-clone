import { Field, ID, InputType } from '@nestjs/graphql';
import { AnswerInput } from './answer.input';

@InputType()
export class ResponseInput {
  @Field(() => ID)
  formId!: string;

  @Field(() => [AnswerInput])
  answers!: AnswerInput[];
}
