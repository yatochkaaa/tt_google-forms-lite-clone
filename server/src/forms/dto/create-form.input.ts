import { Field, InputType } from '@nestjs/graphql';
import { QuestionInput } from './question.input';

@InputType()
export class CreateFormInput {
  @Field()
  title!: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [QuestionInput])
  questions!: QuestionInput[];
}
