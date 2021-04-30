import HTTPClient from "./base/client";

export interface Program {
    lang: string;
    code: string;
}

export type Methods = {[name: string]: Program}
export interface FindAllResponse {
    methods: Methods;
}

export interface PutRequest {
    name: string;
    program: Program;
}

class MethodClient extends HTTPClient {
    constructor(baseURL: string, adminKey: string, apiKey: string) {
        super(`${baseURL}/method`);
        this._setHeader('humbase-method-admin-key', adminKey);
        this._setHeader('humbase-method-api-key', apiKey);
    }

    async findAll(): Promise<FindAllResponse> {
        const res = await this._get('');
        return await res.json()
    }

    async put(req: PutRequest): Promise<void> {
        const res = await this._post('', req);
        return await res.json()
    }

    async del(name: string): Promise<void> {
        await this._delete(name, {});
        return;
    }

    async run(name: string, body: any): Promise<any> {
        const res = await this._post(name, body);
        return await res.json();
    }
}

export default MethodClient;