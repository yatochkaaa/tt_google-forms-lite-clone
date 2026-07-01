import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Form } from './models/form.model';
import { FormsService } from './forms.service';
import { CreateFormInput } from './dto/create-form.input';

@Resolver(() => Form)
export class FormsResolver {
  constructor(private formsService: FormsService) {}

  @Mutation(() => Form)
  createForm(@Args('input') input: CreateFormInput) {
    return this.formsService.create(input);
  }

  @Query(() => Form, { name: 'form', nullable: true })
  getForm(@Args('id', { type: () => ID }) id: string) {
    return this.formsService.findOneById(id);
  }

  @Query(() => [Form], { name: 'forms' })
  getForms() {
    return this.formsService.findAll();
  }
}
