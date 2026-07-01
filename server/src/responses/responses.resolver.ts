import { Resolver } from '@nestjs/graphql';
import { FormResponse } from './models/response.model';

@Resolver(() => FormResponse)
export class ResponsesResolver {}
