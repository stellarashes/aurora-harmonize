import {Component} from '@angular/core';
import {NameService} from "./name.service";
import {CookieService} from "angular2-cookie/services/cookies.service";

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css'],
	providers: [NameService, CookieService]
})
export class AppComponent {
	name: string;
	isEditingName: boolean = false;

	constructor(private nameService: NameService) {
		this.name = nameService.get() || "Guest";
	}

	saveName() {
		this.nameService.set(this.name);
	}

	keydown(event) {
		if (event.keyCode === 13) {
			this.saveName();
			this.isEditingName = false;
		}
	}

	startEdit() {
		if (!this.isEditingName) {
			this.isEditingName = true;
		}
	}

}
