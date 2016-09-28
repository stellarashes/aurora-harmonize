import {Server} from "ts-chassis";
import * as Socket from "socket.io";
import * as http from "http";
import {Container} from "typescript-ioc";
import {RoomServiceProvider} from "./services/factories/RoomServiceProvider";
import {SocketService} from "./services/SocketService";

Server.init()
	.then(() => {
		let server = http.createServer(Server.getApp());
		let io = Socket(server);

		let provider = Container.get(RoomServiceProvider);
		provider.setSocket(new SocketService(io));

		server.listen(3000);
	})
	.catch(e => {
		console.error(e);
	});