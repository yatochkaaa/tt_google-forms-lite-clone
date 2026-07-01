import { Injectable } from '@nestjs/common';
import { Form } from './models/form.model';

@Injectable()
export class FormsService {
  async findOneById(id: string): Promise<Form> {
    return {} as any;
  }
}
