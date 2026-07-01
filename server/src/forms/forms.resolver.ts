import { Args, ID, Query, Resolver } from '@nestjs/graphql';
import { Form } from './models/form.model';
import { FormsService } from './forms.service';

@Resolver(() => Form)
export class FormsResolver {
  constructor(private formsService: FormsService) {}

  @Query(() => Form, { name: 'form' })
  async getForm(@Args('id', { type: () => ID }) id: string) {
    return this.formsService.findOneById(id);
  }
}
