import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { FormsResolver } from './forms.resolver';
import { FormsService } from './forms.service';
import { QuestionType } from './models/question.model';
import type { Form } from './models/form.model';

const makeForm = (overrides: Partial<Form> = {}): Form => ({
  id: 'form-1',
  title: 'Test Form',
  questions: [],
  createdAt: new Date(),
  ...overrides,
});

describe('FormsResolver', () => {
  let resolver: FormsResolver;
  let formsService: jest.Mocked<FormsService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        FormsResolver,
        {
          provide: FormsService,
          useValue: { create: jest.fn(), findOneById: jest.fn(), findAll: jest.fn() },
        },
      ],
    }).compile();

    resolver = module.get(FormsResolver);
    formsService = module.get(FormsService) as jest.Mocked<FormsService>;
  });

  describe('getForms', () => {
    it('returns all forms from the service', () => {
      const forms = [makeForm({ title: 'A' }), makeForm({ id: 'form-2', title: 'B' })];
      formsService.findAll.mockReturnValue(forms);
      expect(resolver.getForms()).toBe(forms);
    });

    it('returns empty array when no forms exist', () => {
      formsService.findAll.mockReturnValue([]);
      expect(resolver.getForms()).toEqual([]);
    });
  });

  describe('getForm', () => {
    it('delegates lookup to the service with the provided id', () => {
      const form = makeForm();
      formsService.findOneById.mockReturnValue(form);
      expect(resolver.getForm('form-1')).toBe(form);
      expect(formsService.findOneById).toHaveBeenCalledWith('form-1');
    });

    it('returns undefined for an unknown id', () => {
      formsService.findOneById.mockReturnValue(undefined);
      expect(resolver.getForm('unknown')).toBeUndefined();
    });
  });

  describe('createForm', () => {
    it('passes the input to the service and returns the result', () => {
      const input = {
        title: 'New Form',
        questions: [
          { type: QuestionType.TEXT, label: 'Name', required: true, order: 0 },
        ],
      };
      const form = makeForm({ title: 'New Form' });
      formsService.create.mockReturnValue(form);

      expect(resolver.createForm(input)).toBe(form);
      expect(formsService.create).toHaveBeenCalledWith(input);
    });
  });
});
