import {Injectable} from '@angular/core';
import {CookieService} from "angular2-cookie/services/cookies.service";

@Injectable()
export class NameService {
	private name: string;

	constructor(private cookieService: CookieService) {
		this.name = this.cookieService.get('name');
	}

	set(name: string) {
		this.name = name;
		this.cookieService.put('name', this.name);
	}

	get() {
		return this.name;
	}
}
