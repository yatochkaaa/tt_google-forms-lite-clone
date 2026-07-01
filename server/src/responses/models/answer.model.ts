import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Answer {
  @Field(() => ID)
  questionId!: string;

  @Field(() => [String])
  values!: string[];
}
