import Namespace = SocketIO.Namespace;
import {Room} from "../models/Room";
import {SocketService} from "./SocketService";
import {RoomParticipant} from "../models/RoomParticipant";
import {MingleService} from "./MingleService";
import {Container} from "typescript-ioc";
export class RoomService {
	private io;
	private namespace: string;
	private room: Room;

	public async initialize(room: Room, socket: SocketService) {
		this.room = room;
		this.namespace = '/' + room.roomNumber;
		this.io = socket.createNamespace(this.namespace);
		return Promise.all([
			this.setupIO(),
			this.getCards(),
		]);
	}

	public getRoomInfo() {
		return Promise.resolve(this.room);
	}

	public async joinRoom(user: any) {
		let participant = new RoomParticipant();
		participant.name = user.name;
		participant.socketSessionId = user.id;
		participant.role = user.role;
		this.room.participants.push(participant);
		return this.broadcastToRoom('userHasJoined', [user]);
	}

	private async getCards() {
		let service = Container.get(MingleService);
		this.room.cards = await service.getCards(this.room.mingleProject);
	}

	private async setupIO() {
		this.io.on('connection', socket => {
			socket.join(this.namespace);
			socket.on('join', (id, user) => {
				user.id = id;
				this.io.to(this.namespace).emit('userHasJoined', user);
				this.joinRoom(user);
			});
		});
		// TODO disconnect logic
	}

	public async broadcastToRoom(msg: string, args?: any[]) {
		return new Promise((resolve, reject) => {
			var targetNamespace = this.io.to(this.namespace);
			let targetFunction = targetNamespace.emit;
			let fullArgs = args ? Array.from(args) : [];
			fullArgs.unshift(msg);
			fullArgs.push((err, result) => {
				if (err)
					reject(err);
				else
					resolve(result);
			});
			targetFunction.apply(targetNamespace, fullArgs);
		});
	}

	private getParticipantById(id: string) {
		let candidates = this.room.participants.filter(x => x.socketSessionId === id);
		if (candidates && candidates.length) {
			return candidates[0];
		} else {
			return null;
		}
	}
}