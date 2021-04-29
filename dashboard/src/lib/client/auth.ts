import HTTPClient from "./base/client";

export interface EmailAndPassword {
    email: string
    password: string
}

export interface Token {
    token: string;
}

export interface VerifyResponse {
    status: string;
}

export interface findAllResponse {
    users: EmailAndPassword[];
}

class AuthClient extends HTTPClient {
    constructor(baseURL: string, adminKey: string, apiKey: string) {
        super(`${baseURL}/auth`);
        this._setHeader('humbase-auth-admin-key', adminKey);
        this._setHeader('humbase-auth-api-key', apiKey);
    }

    async signIn(req: EmailAndPassword): Promise<Token> {
        const res = await this._post('sign-in', req);
        return await res.json()
    }

    async signUp(req: EmailAndPassword): Promise<Token> {
        const res = await this._post('sign-up', req);
        return await res.json()
    }

    async verify(req: Token): Promise<VerifyResponse> {
        const res = await this._post('verify', req);
        return await res.json()
    }

    async findAll(): Promise<findAllResponse> {
        const res = await this._get('')
        return await res.json()
    }

}

export default AuthClient;