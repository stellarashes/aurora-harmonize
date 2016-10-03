import {Route, POST, GET} from "ts-chassis";
import {Inject, Container} from "typescript-ioc";
import {RoomServiceProvider} from "../services/factories/RoomServiceProvider";

@Route('/api/room')
export class RoomController {
	@Inject private provider: RoomServiceProvider;

	constructor() {
		this.provider = Container.get(RoomServiceProvider);
	}

	@POST
	public async createRoom(body: any, session: any) {
		let roomService = await this.provider.createOrFindRoom(body);
		let roomInfo = await roomService.getRoomInfo();
		session.adminOfRooms = session.adminOfRooms || [];
		session.adminOfRooms.push(roomInfo.roomNumber);
		return {
			roomNumber: roomInfo.roomNumber
		};
	}

	@Route('/:id')
	@GET
	public async getRoomInfo(id: string, session: any) {
		var roomId = parseInt(id);
		let roomService = await this.provider.findRoom(roomId);
		let roomInfo = await roomService.getRoomInfo();
		let admin = false;
		if (session && session.adminOfRooms && session.adminOfRooms.indexOf(roomId) !== -1) {
			admin = true;
		}
		return {
			room: roomInfo,
			admin: admin,
		};
	}

	@Route('/:id/refresh-cards')
	@POST
	public async updateRoom(id: string) {
		let roomId = parseInt(id);
		let roomService = await this.provider.findRoom(roomId);
		return roomService.updateCards();
	}

	@Route('/:id/set-final-value')
	@POST
	public async setFinalValue(id: string, body: any) {
		let roomId = parseInt(id);
		let roomService = await this.provider.findRoom(roomId);
		return roomService.setFinalValue(body.cardNumber, body.value);
	}
}