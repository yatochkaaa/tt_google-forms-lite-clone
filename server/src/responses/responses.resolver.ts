import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { FormResponse } from './models/response.model';
import { ResponsesService } from './responses.service';
import { ResponseInput } from './dto/response.input';

@Resolver(() => FormResponse)
export class ResponsesResolver {
  constructor(private responsesService: ResponsesService) {}

  @Mutation(() => FormResponse)
  submitResponse(@Args('input') input: ResponseInput) {
    return this.responsesService.create(input);
  }

  @Query(() => [FormResponse], { name: 'responses' })
  getResponsesByFormId(@Args('formId', { type: () => ID }) formId: string) {
    return this.responsesService.findAllByFormId(formId);
  }
}
