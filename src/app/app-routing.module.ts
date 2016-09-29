import {ModuleWithProviders} from "@angular/core";
import {Routes, RouterModule} from "@angular/router";
import {RoomComponent} from "./room/room.component";
import {ViewRoomComponent} from "./view-room/view-room.component";

const routes: Routes = [
	{
		path: '',
		component: RoomComponent
	},
	{
		path: 'room',
		component: RoomComponent
	},
	{
		path: 'room/:id',
		component: ViewRoomComponent
	}
];

export const appRoutingProviders: any[] = [];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes);
