import { Component } from '@angular/core';
import {NameService} from "./name.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [NameService]
})
export class AppComponent {
  name: string = 'Test' + Math.floor((Math.random() * 1000000));
  constructor(private nameService: NameService) {
    this.updateName();
  }

  updateName() {
    this.nameService.set(this.name);
  }
}
