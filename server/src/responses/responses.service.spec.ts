import { ResponsesService } from './responses.service';

describe('ResponsesService', () => {
  let service: ResponsesService;

  beforeEach(() => {
    service = new ResponsesService();
  });

  describe('create', () => {
    it('assigns a unique id and createdAt', () => {
      const response = service.create({ formId: 'form-1', answers: [] });
      expect(response.id).toBeDefined();
      expect(response.createdAt).toBeInstanceOf(Date);
    });

    it('stores formId and answers from input', () => {
      const answers = [{ questionId: 'q-1', values: ['hello'] }];
      const response = service.create({ formId: 'form-42', answers });
      expect(response.formId).toBe('form-42');
      expect(response.answers).toEqual(answers);
    });

    it('generates distinct ids for two responses', () => {
      const a = service.create({ formId: 'form-1', answers: [] });
      const b = service.create({ formId: 'form-1', answers: [] });
      expect(a.id).not.toBe(b.id);
    });
  });

  describe('findAllByFormId', () => {
    it('returns empty array when no responses exist', () => {
      expect(service.findAllByFormId('form-1')).toEqual([]);
    });

    it('returns only responses matching the given formId', () => {
      service.create({ formId: 'form-1', answers: [] });
      service.create({ formId: 'form-1', answers: [] });
      service.create({ formId: 'form-2', answers: [] });

      expect(service.findAllByFormId('form-1')).toHaveLength(2);
      expect(service.findAllByFormId('form-2')).toHaveLength(1);
    });

    it('returns empty array for a formId with no responses', () => {
      service.create({ formId: 'form-1', answers: [] });
      expect(service.findAllByFormId('form-unknown')).toEqual([]);
    });

    it('includes all answer values for each response', () => {
      const answers = [
        { questionId: 'q-1', values: ['A', 'B'] },
        { questionId: 'q-2', values: ['C'] },
      ];
      service.create({ formId: 'form-1', answers });
      const [result] = service.findAllByFormId('form-1');
      expect(result.answers).toEqual(answers);
    });
  });
});
