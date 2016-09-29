import { Injectable } from '@angular/core';

@Injectable()
export class NameService {
  private name: string;

  constructor() { }

  set(name: string) { this.name = name; }
  get() { return this.name; }
}
