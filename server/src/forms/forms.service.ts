import { Injectable } from '@nestjs/common';
import { Form } from './models/form.model';
import { CreateFormInput } from './dto/create-form.input';
import { Question } from './models/question.model';

@Injectable()
export class FormsService {
  private readonly forms = new Map<string, Form>();

  create({ title, description, questions }: CreateFormInput): Form {
    const formQuestions: Question[] = questions.map((q) => ({
      ...q,
      id: crypto.randomUUID(),
    }));

    const form: Form = {
      id: crypto.randomUUID(),
      title,
      description,
      questions: formQuestions,
      createdAt: new Date(),
    };

    this.forms.set(form.id, form);

    return form;
  }

  findOneById(id: string): Form | undefined {
    return this.forms.get(id);
  }

  findAll(): Form[] {
    return [...this.forms.values()];
  }
}
