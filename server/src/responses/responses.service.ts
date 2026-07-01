import { Injectable } from '@nestjs/common';
import { FormResponse } from './models/response.model';
import { ResponseInput } from './dto/response.input';

@Injectable()
export class ResponsesService {
  private readonly responses = new Map<string, FormResponse>();

  create({ formId, answers }: ResponseInput): FormResponse {
    const formResponse: FormResponse = {
      id: crypto.randomUUID(),
      formId,
      answers,
      createdAt: new Date(),
    };
    this.responses.set(formResponse.id, formResponse);
    return formResponse;
  }

  findAllByFormId(formId: string): FormResponse[] {
    return [...this.responses.values()].filter((r) => r.formId === formId);
  }
}
