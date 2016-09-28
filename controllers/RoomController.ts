import {Route, POST, GET} from "ts-chassis";
import {Inject, Container} from "typescript-ioc";
import {SocketService} from "../services/SocketService";
import {RoomServiceProvider} from "../services/factories/RoomServiceProvider";
import {RoomService} from "../services/RoomService";

@Route('/room')
export class RoomController {
	@Inject private provider: RoomServiceProvider;
	private roomService: RoomService;

	constructor() {
		this.provider = Container.get(RoomServiceProvider);
	}

	@POST
	public async createRoom(body: any) {
		this.roomService = await this.provider.createOrFindRoom();
		if (body && body.user) {
			await this.roomService.joinRoom(body.user);
		}
		return this.roomService.getRoomInfo();
	}

	@Route('/:id')
	@GET
	public async getRoomInfo(id: string) {
		this.roomService = await this.provider.findRoom(id);
		return this.roomService.getRoomInfo();
	}
}