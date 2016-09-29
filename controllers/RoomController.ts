import {Route, POST, GET} from "ts-chassis";
import {Inject, Container} from "typescript-ioc";
import {RoomServiceProvider} from "../services/factories/RoomServiceProvider";
import {RoomService} from "../services/RoomService";

@Route('/api/room')
export class RoomController {
	@Inject private provider: RoomServiceProvider;
	private roomService: RoomService;

	constructor() {
		this.provider = Container.get(RoomServiceProvider);
	}

	@POST
	public async createRoom(body: any, session: any) {
		this.roomService = await this.provider.createOrFindRoom(body);
		let roomInfo = await this.roomService.getRoomInfo();
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
		this.roomService = await this.provider.findRoom(roomId);
		let roomInfo = await this.roomService.getRoomInfo();
		let admin = false;
		if (session && session.adminOfRooms && session.adminOfRooms.indexOf(roomId) !== -1) {
			admin = true;
		}
		return {
			room: roomInfo,
			admin: admin,
		};
	}
}