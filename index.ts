import {Server} from "ts-chassis";
import * as Socket from "socket.io";
import * as http from "http";
import {Container} from "typescript-ioc";
import {RoomServiceProvider} from "./services/factories/RoomServiceProvider";
import {SocketService} from "./services/SocketService";
import * as express from "express";
import {MingleService} from "./services/MingleService";

// let service = Container.get(MingleService);
// service.getCards('members___engagement')
// 	.then(x => {
// 		x.forEach(y => {
// 			console.log(y.toJSON());
// 		});
// 	});

Server.init()
	.then(() => {
		var app = Server.getApp();
		app.use(express.static('../dist'));
		let server = http.createServer(app);
		let io = Socket(server);

		let provider = Container.get(RoomServiceProvider);
		provider.setSocket(new SocketService(io));

		server.listen(3000);
	})
	.catch(e => {
		console.error(e);
	});