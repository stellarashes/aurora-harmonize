import {Singleton} from "typescript-ioc";
import Namespace = SocketIO.Namespace;

@Singleton
export class SocketService {
	private server;

	constructor(server: SocketIO.Server) {
		this.server = server;
		this.init();
	}

	private init(): void {

	}

	public createNamespace(namespace: string): Namespace {
		return this.server.of(namespace);
	}
}