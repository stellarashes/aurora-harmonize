import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';

import {AppComponent} from './app.component';
import {appRoutingProviders, routing} from "./app-routing.module";
import { RoomComponent } from './room/room.component';
import { ViewRoomComponent } from './view-room/view-room.component';

@NgModule({
	declarations: [
		AppComponent,
		RoomComponent,
		ViewRoomComponent,
	],
	imports: [
		BrowserModule,
		FormsModule,
		HttpModule,
		routing,
	],
	providers: [
		appRoutingProviders
	],
	bootstrap: [AppComponent]
})
export class AppModule {
}
