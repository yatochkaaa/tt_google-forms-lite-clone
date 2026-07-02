import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { ResponsesResolver } from './responses.resolver';
import { ResponsesService } from './responses.service';
import type { FormResponse } from './models/response.model';

const makeResponse = (overrides: Partial<FormResponse> = {}): FormResponse => ({
  id: 'resp-1',
  formId: 'form-1',
  answers: [],
  createdAt: new Date(),
  ...overrides,
});

describe('ResponsesResolver', () => {
  let resolver: ResponsesResolver;
  let responsesService: jest.Mocked<ResponsesService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ResponsesResolver,
        {
          provide: ResponsesService,
          useValue: { create: jest.fn(), findAllByFormId: jest.fn() },
        },
      ],
    }).compile();

    resolver = module.get(ResponsesResolver);
    responsesService = module.get(ResponsesService) as jest.Mocked<ResponsesService>;
  });

  describe('getResponsesByFormId', () => {
    it('delegates to the service with the provided formId', () => {
      const responses = [makeResponse(), makeResponse({ id: 'resp-2' })];
      responsesService.findAllByFormId.mockReturnValue(responses);

      expect(resolver.getResponsesByFormId('form-1')).toBe(responses);
      expect(responsesService.findAllByFormId).toHaveBeenCalledWith('form-1');
    });

    it('returns empty array when no responses exist for the form', () => {
      responsesService.findAllByFormId.mockReturnValue([]);
      expect(resolver.getResponsesByFormId('form-1')).toEqual([]);
    });
  });

  describe('submitResponse', () => {
    it('passes input to the service and returns the created response', () => {
      const input = {
        formId: 'form-1',
        answers: [{ questionId: 'q-1', values: ['answer'] }],
      };
      const response = makeResponse({ answers: input.answers });
      responsesService.create.mockReturnValue(response);

      expect(resolver.submitResponse(input)).toBe(response);
      expect(responsesService.create).toHaveBeenCalledWith(input);
    });

    it('stores answers with multiple values correctly', () => {
      const input = {
        formId: 'form-1',
        answers: [{ questionId: 'q-1', values: ['A', 'B', 'C'] }],
      };
      const response = makeResponse({ answers: input.answers });
      responsesService.create.mockReturnValue(response);

      const result = resolver.submitResponse(input);
      expect(result.answers[0].values).toEqual(['A', 'B', 'C']);
    });
  });
});
