import {JiraToken} from "./JiraToken";
const client = require('jira-connector');

export class JiraOAuthService {
    public getTokenFromSession(session: any): JiraToken {
        if (session.hasOwnProperty('jiraToken') && session.hasOwnProperty('jiraTokenSecret')) {
            return {
                token: session['jiraToken'],
                tokenSecret: session['jiraTokenSecret']
            };
        } else {
            return null;
        }
    }

    public setTokenToSession(session: any, token: JiraToken) {
        session['jiraToken'] = token.token;
        session['jiraTokenSecret'] = token.tokenSecret;
        return session;
    }

    public async getRequestToken(): Promise<JiraToken> {
        return new Promise<JiraToken>((resolve, reject) => {
            client.oauth_util.getAuthorizeURL({
                host: process.env.JIRA_HOST,
                oauth: {
                    consumer_key: process.env.JIRA_CONSUMER_KEY,
                    private_key: process.env.JIRA_PRIVATE_KEY,
                }
            }, (error, oauth) => {
                if (error)
                    reject(error);
                else
                    resolve({
                        url: oauth.url,
                        token: oauth.token,
                        tokenSecret: oauth.token_secret,
                    });
            });
        });
    }

    // JIRA redirects client to callback url with oauth_token and oauth_verifier query string
    public async getAccessToken(session: any, oauthVerifier: string) {
        let token = this.getTokenFromSession(session);
        if (!token)
            throw new Error('Could not read token from session');
        return new Promise((resolve, reject) => {
            client.oauth_util.swapRequestTokenWithAccessToken({
                host: process.env.JIRA_HOST,
                oauth: {
                    token: token.token,
                    token_secret: token.tokenSecret,
                    oauth_verifier: oauthVerifier,
                    consumer_key: process.env.JIRA_CONSUMER_KEY,
                    private_key: process.env.JIRA_PRIVATE_KEY,
                }
            }, (error, oauth) => {
                if (error)
                    reject(error);
                else
                    resolve(oauth);
            });
        });
    }
}