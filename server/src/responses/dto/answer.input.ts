import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class AnswerInput {
  @Field(() => ID)
  questionId!: string;

  @Field(() => [String])
  values!: string[];
}
