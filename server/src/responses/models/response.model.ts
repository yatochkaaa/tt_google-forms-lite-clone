import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Answer } from './answer.model';

@ObjectType()
export class FormResponse {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  formId!: string;

  @Field(() => [Answer])
  answers!: Answer[];

  @Field(() => Date)
  createdAt!: Date;
}
