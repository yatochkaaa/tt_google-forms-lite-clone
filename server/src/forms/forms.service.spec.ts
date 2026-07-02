import { FormsService } from './forms.service';
import { QuestionType } from './models/question.model';

describe('FormsService', () => {
  let service: FormsService;

  beforeEach(() => {
    service = new FormsService();
  });

  describe('create', () => {
    it('assigns a unique id and createdAt to the form', () => {
      const form = service.create({ title: 'My Form', questions: [] });
      expect(form.id).toBeDefined();
      expect(form.createdAt).toBeInstanceOf(Date);
    });

    it('assigns unique ids to each question', () => {
      const form = service.create({
        title: 'Quiz',
        questions: [
          { type: QuestionType.TEXT, label: 'Name', required: true, order: 0 },
          { type: QuestionType.DATE, label: 'Birthday', required: false, order: 1 },
        ],
      });
      expect(form.questions).toHaveLength(2);
      expect(form.questions[0].id).toBeDefined();
      expect(form.questions[1].id).toBeDefined();
      expect(form.questions[0].id).not.toBe(form.questions[1].id);
    });

    it('stores title, description, and questions from input', () => {
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

    it('persists the form so findOneById returns it', () => {
      const created = service.create({ title: 'Persist test', questions: [] });
      expect(service.findOneById(created.id)).toBe(created);
    });

    it('generates distinct ids for two separate forms', () => {
      const a = service.create({ title: 'A', questions: [] });
      const b = service.create({ title: 'B', questions: [] });
      expect(a.id).not.toBe(b.id);
    });
  });

  describe('findAll', () => {
    it('returns empty array when no forms have been created', () => {
      expect(service.findAll()).toEqual([]);
    });

    it('returns all created forms', () => {
      service.create({ title: 'A', questions: [] });
      service.create({ title: 'B', questions: [] });
      expect(service.findAll()).toHaveLength(2);
    });
  });

  describe('findOneById', () => {
    it('returns undefined for an unknown id', () => {
      expect(service.findOneById('non-existent')).toBeUndefined();
    });

    it('returns the correct form by id', () => {
      const form = service.create({ title: 'Target', questions: [] });
      service.create({ title: 'Other', questions: [] });
      expect(service.findOneById(form.id)?.title).toBe('Target');
    });
  });
});
