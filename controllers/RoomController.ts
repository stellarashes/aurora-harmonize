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
	public async createRoom(body: any) {
		this.roomService = await this.provider.createOrFindRoom(body);
		return this.roomService.getRoomInfo();
	}

	@Route('/:id')
	@GET
	public async getRoomInfo(id: string) {
		this.roomService = await this.provider.findRoom(id);
		return this.roomService.getRoomInfo();
	}
}