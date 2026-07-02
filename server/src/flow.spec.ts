/**
 * End-to-end flow tests: create form → submit responses → retrieve and verify.
 * These catch bugs where entities are created but not persisted, or where
 * filtering breaks isolation between forms.
 */
import { FormsService } from './forms/forms.service';
import { ResponsesService } from './responses/responses.service';
import { QuestionType } from './forms/models/question.model';

describe('Create form → submit responses → retrieve flow', () => {
  let forms: FormsService;
  let responses: ResponsesService;

  beforeEach(() => {
    forms = new FormsService();
    responses = new ResponsesService();
  });

  // ─── single form, single response ────────────────────────────────────────

  it('a submitted response appears in the list for its form', () => {
    const form = forms.create({ title: 'Feedback', questions: [] });
    const response = responses.create({ formId: form.id, answers: [] });

    const list = responses.findAllByFormId(form.id);
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(response.id);
  });

  it('response answers map back to form question ids', () => {
    const form = forms.create({
      title: 'Survey',
      questions: [
        { type: QuestionType.TEXT, label: 'Name', required: true, order: 0 },
        { type: QuestionType.MULTIPLE_CHOICE, label: 'Rating', required: true, order: 1, options: ['1', '2', '3', '4', '5'] },
        { type: QuestionType.CHECKBOX, label: 'Features', required: false, order: 2, options: ['Search', 'Export'] },
      ],
    });

    const [q1, q2, q3] = form.questions;

    responses.create({
      formId: form.id,
      answers: [
        { questionId: q1.id, values: ['Alice'] },
        { questionId: q2.id, values: ['5'] },
        { questionId: q3.id, values: ['Search', 'Export'] },
      ],
    });

    const [result] = responses.findAllByFormId(form.id);

    expect(result.answers.find((a) => a.questionId === q1.id)?.values).toEqual(['Alice']);
    expect(result.answers.find((a) => a.questionId === q2.id)?.values).toEqual(['5']);
    expect(result.answers.find((a) => a.questionId === q3.id)?.values).toEqual(['Search', 'Export']);
  });

  // ─── multiple responses accumulate ───────────────────────────────────────

  it('multiple responses for the same form all accumulate', () => {
    const form = forms.create({
      title: 'Vote',
      questions: [
        { type: QuestionType.MULTIPLE_CHOICE, label: 'Choice', required: true, order: 0, options: ['A', 'B', 'C'] },
      ],
    });
    const [q] = form.questions;

    responses.create({ formId: form.id, answers: [{ questionId: q.id, values: ['A'] }] });
    responses.create({ formId: form.id, answers: [{ questionId: q.id, values: ['B'] }] });
    responses.create({ formId: form.id, answers: [{ questionId: q.id, values: ['A'] }] });

    const list = responses.findAllByFormId(form.id);
    expect(list).toHaveLength(3);

    const counts = { A: 0, B: 0 };
    for (const r of list) {
      const val = r.answers[0].values[0];
      if (val === 'A') counts.A++;
      if (val === 'B') counts.B++;
    }
    expect(counts.A).toBe(2);
    expect(counts.B).toBe(1);
  });

  // ─── isolation between forms ─────────────────────────────────────────────

  it('responses for form-A do not appear when querying form-B', () => {
    const formA = forms.create({ title: 'Form A', questions: [] });
    const formB = forms.create({ title: 'Form B', questions: [] });

    responses.create({ formId: formA.id, answers: [] });
    responses.create({ formId: formA.id, answers: [] });
    responses.create({ formId: formB.id, answers: [] });

    expect(responses.findAllByFormId(formA.id)).toHaveLength(2);
    expect(responses.findAllByFormId(formB.id)).toHaveLength(1);
  });

  it('form with no responses returns empty list while other forms have responses', () => {
    const formA = forms.create({ title: 'Active', questions: [] });
    const formB = forms.create({ title: 'Empty', questions: [] });

    responses.create({ formId: formA.id, answers: [] });
    responses.create({ formId: formA.id, answers: [] });

    expect(responses.findAllByFormId(formB.id)).toEqual([]);
  });

  // ─── form retrieval after creation ───────────────────────────────────────

  it('form appears in findAll immediately after creation', () => {
    expect(forms.findAll()).toHaveLength(0);
    forms.create({ title: 'First', questions: [] });
    expect(forms.findAll()).toHaveLength(1);
    forms.create({ title: 'Second', questions: [] });
    expect(forms.findAll()).toHaveLength(2);
  });

  it('all created forms are retrievable by their individual ids', () => {
    const a = forms.create({ title: 'A', questions: [] });
    const b = forms.create({ title: 'B', questions: [] });
    const c = forms.create({ title: 'C', questions: [] });

    expect(forms.findOneById(a.id)?.title).toBe('A');
    expect(forms.findOneById(b.id)?.title).toBe('B');
    expect(forms.findOneById(c.id)?.title).toBe('C');
  });

  it('form questions are stable — question ids do not change after creation', () => {
    const form = forms.create({
      title: 'Stable',
      questions: [
        { type: QuestionType.TEXT, label: 'Q', required: false, order: 0 },
      ],
    });
    const qId = form.questions[0].id;

    // Retrieve via findOneById and verify id is the same
    const retrieved = forms.findOneById(form.id);
    expect(retrieved?.questions[0].id).toBe(qId);

    // Can use that id in a response
    responses.create({ formId: form.id, answers: [{ questionId: qId, values: ['answer'] }] });
    const [r] = responses.findAllByFormId(form.id);
    expect(r.answers[0].questionId).toBe(qId);
  });
});
