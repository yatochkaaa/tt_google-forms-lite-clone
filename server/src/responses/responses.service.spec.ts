import { ResponsesService } from './responses.service';

describe('ResponsesService', () => {
  let service: ResponsesService;

  beforeEach(() => {
    service = new ResponsesService();
  });

  // ─── create ──────────────────────────────────────────────────────────────

  describe('create', () => {
    it('assigns a unique id and createdAt', () => {
      const r = service.create({ formId: 'f1', answers: [] });
      expect(r.id).toBeDefined();
      expect(r.createdAt).toBeInstanceOf(Date);
    });

    it('stores formId and answers from input', () => {
      const answers = [{ questionId: 'q-1', values: ['hello'] }];
      const r = service.create({ formId: 'f42', answers });
      expect(r.formId).toBe('f42');
      expect(r.answers).toEqual(answers);
    });

    it('stores multi-value checkbox answers faithfully', () => {
      const answers = [{ questionId: 'q-cb', values: ['Cheese', 'Peppers', 'Onions'] }];
      const r = service.create({ formId: 'f1', answers });
      expect(r.answers[0].values).toEqual(['Cheese', 'Peppers', 'Onions']);
    });

    it('stores answers spanning multiple questions', () => {
      const answers = [
        { questionId: 'q-1', values: ['Alice'] },
        { questionId: 'q-2', values: ['5'] },
        { questionId: 'q-3', values: ['A', 'B'] },
      ];
      const r = service.create({ formId: 'f1', answers });
      expect(r.answers).toHaveLength(3);
    });

    it('generates distinct ids for two responses to the same form', () => {
      const a = service.create({ formId: 'f1', answers: [] });
      const b = service.create({ formId: 'f1', answers: [] });
      expect(a.id).not.toBe(b.id);
    });

    it('created response is immediately visible via findAllByFormId', () => {
      const r = service.create({ formId: 'f1', answers: [] });
      const results = service.findAllByFormId('f1');
      expect(results.some((x) => x.id === r.id)).toBe(true);
    });
  });

  // ─── findAllByFormId ─────────────────────────────────────────────────────

  describe('findAllByFormId', () => {
    it('returns empty array when no responses exist', () => {
      expect(service.findAllByFormId('f1')).toEqual([]);
    });

    it('list grows by one each time a response is submitted', () => {
      expect(service.findAllByFormId('f1')).toHaveLength(0);
      service.create({ formId: 'f1', answers: [] });
      expect(service.findAllByFormId('f1')).toHaveLength(1);
      service.create({ formId: 'f1', answers: [] });
      expect(service.findAllByFormId('f1')).toHaveLength(2);
    });

    it('responses for different forms do not cross-contaminate', () => {
      service.create({ formId: 'f1', answers: [] });
      service.create({ formId: 'f1', answers: [] });
      service.create({ formId: 'f2', answers: [] });

      expect(service.findAllByFormId('f1')).toHaveLength(2);
      expect(service.findAllByFormId('f2')).toHaveLength(1);
      expect(service.findAllByFormId('f3')).toHaveLength(0);
    });

    it('accumulates many responses correctly', () => {
      for (let i = 0; i < 10; i++) {
        service.create({ formId: 'f1', answers: [{ questionId: 'q', values: [String(i)] }] });
      }
      expect(service.findAllByFormId('f1')).toHaveLength(10);
    });

    it('contains answer values from each individual response', () => {
      service.create({ formId: 'f1', answers: [{ questionId: 'q', values: ['A'] }] });
      service.create({ formId: 'f1', answers: [{ questionId: 'q', values: ['B'] }] });

      const results = service.findAllByFormId('f1');
      const values = results.map((r) => r.answers[0].values[0]);
      expect(values).toContain('A');
      expect(values).toContain('B');
    });

    it('returns empty for unknown formId even with many responses stored', () => {
      for (let i = 0; i < 5; i++) {
        service.create({ formId: 'f1', answers: [] });
      }
      expect(service.findAllByFormId('unknown')).toEqual([]);
    });
  });
});
