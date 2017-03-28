import {GET, Route} from "ts-chassis";
import {JiraOAuthService} from "../services/jira/JiraOAuthService";
import {Container, Inject} from "typescript-ioc";
import {RedirectReturnType} from "ts-chassis";

@Route('/auth')
export class JiraTokenController {
    @Inject
    private service: JiraOAuthService;

    constructor() {
        this.service = Container.get(JiraOAuthService);
    }

    @GET
    public async getToken(session: any) {
        let token = await this.service.getRequestToken();
        this.service.setTokenToSession(session, token);
        return token;
    }

    @Route('/verify')
    @GET
    public async verifyToken(session: any, oauth_verifier: string) {
        session['jiraAccessToken'] = await this.service.getAccessToken(session, oauth_verifier);
        return new RedirectReturnType('/');
    }
}