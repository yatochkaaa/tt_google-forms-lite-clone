import { FormsService } from './forms.service';
import { QuestionType } from './models/question.model';

describe('FormsService', () => {
  let service: FormsService;

  beforeEach(() => {
    service = new FormsService();
  });

  // ─── create ───────────────────────────────────────────────────────────────

  describe('create', () => {
    it('assigns a unique id and createdAt', () => {
      const form = service.create({ title: 'My Form', questions: [] });
      expect(form.id).toBeDefined();
      expect(form.createdAt).toBeInstanceOf(Date);
    });

    it('persists title, description, and questions verbatim', () => {
      const form = service.create({
        title: 'Survey',
        description: 'Quick survey',
        questions: [
          { type: QuestionType.MULTIPLE_CHOICE, label: 'Colour?', required: false, order: 0, options: ['Red', 'Blue'] },
        ],
      });
      expect(form.title).toBe('Survey');
      expect(form.description).toBe('Quick survey');
      expect(form.questions[0].options).toEqual(['Red', 'Blue']);
    });

    it('assigns distinct ids to every question in a form', () => {
      const form = service.create({
        title: 'Q Types',
        questions: [
          { type: QuestionType.TEXT, label: 'Name', required: true, order: 0 },
          { type: QuestionType.DATE, label: 'Birthday', required: false, order: 1 },
        ],
      });
      expect(form.questions[0].id).toBeDefined();
      expect(form.questions[1].id).toBeDefined();
      expect(form.questions[0].id).not.toBe(form.questions[1].id);
    });

    it('assigns distinct ids to questions with identical labels', () => {
      const form = service.create({
        title: 'Duplicates',
        questions: [
          { type: QuestionType.TEXT, label: 'Same', required: false, order: 0 },
          { type: QuestionType.TEXT, label: 'Same', required: false, order: 1 },
        ],
      });
      expect(form.questions[0].id).not.toBe(form.questions[1].id);
    });

    it('preserves question type, required, and order fields', () => {
      const form = service.create({
        title: 'Fields test',
        questions: [
          { type: QuestionType.MULTIPLE_CHOICE, label: 'Pick', required: true, order: 3, options: ['A', 'B'] },
        ],
      });
      const q = form.questions[0];
      expect(q.type).toBe(QuestionType.MULTIPLE_CHOICE);
      expect(q.required).toBe(true);
      expect(q.order).toBe(3);
    });

    it('generates distinct ids for two separate forms', () => {
      const a = service.create({ title: 'A', questions: [] });
      const b = service.create({ title: 'B', questions: [] });
      expect(a.id).not.toBe(b.id);
    });

    it('created form is immediately visible via findOneById', () => {
      const form = service.create({ title: 'Persist', questions: [] });
      expect(service.findOneById(form.id)).toBe(form);
    });

    it('created form is immediately included in findAll', () => {
      const form = service.create({ title: 'Persist', questions: [] });
      expect(service.findAll().some((f) => f.id === form.id)).toBe(true);
    });
  });

  // ─── findAll ─────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('returns empty array before any forms are created', () => {
      expect(service.findAll()).toEqual([]);
    });

    it('list grows by one each time a form is created', () => {
      expect(service.findAll()).toHaveLength(0);
      service.create({ title: 'A', questions: [] });
      expect(service.findAll()).toHaveLength(1);
      service.create({ title: 'B', questions: [] });
      expect(service.findAll()).toHaveLength(2);
      service.create({ title: 'C', questions: [] });
      expect(service.findAll()).toHaveLength(3);
    });

    it('returns all forms regardless of title similarity', () => {
      service.create({ title: 'Form', questions: [] });
      service.create({ title: 'Form', questions: [] });
      expect(service.findAll()).toHaveLength(2);
    });

    it('contains every created form id', () => {
      const ids = [
        service.create({ title: 'X', questions: [] }).id,
        service.create({ title: 'Y', questions: [] }).id,
        service.create({ title: 'Z', questions: [] }).id,
      ];
      const allIds = service.findAll().map((f) => f.id);
      ids.forEach((id) => expect(allIds).toContain(id));
    });
  });

  // ─── findOneById ─────────────────────────────────────────────────────────

  describe('findOneById', () => {
    it('returns undefined for an unknown id', () => {
      expect(service.findOneById('non-existent')).toBeUndefined();
    });

    it('returns the correct form among many', () => {
      service.create({ title: 'Noise 1', questions: [] });
      const target = service.create({ title: 'Target', questions: [] });
      service.create({ title: 'Noise 2', questions: [] });
      expect(service.findOneById(target.id)?.title).toBe('Target');
    });

    it('returns undefined after looking up an id that was never stored', () => {
      service.create({ title: 'Only one', questions: [] });
      expect(service.findOneById('fake-id')).toBeUndefined();
    });
  });
});
