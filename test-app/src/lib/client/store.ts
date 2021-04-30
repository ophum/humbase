import HTTPClient from "./base/client";

export interface FindAllResponse {
    data: {[id: string]: any};
}

export interface PutRequest {
    id?: string;
    data: any;
}

export interface FindByIDResponse {
    data: any;
}

class StoreClient extends HTTPClient {
    constructor(baseURL: string, adminKey: string, apiKey: string) {
        super(`${baseURL}/store`);
        this._setHeader('humbase-store-admin-key', adminKey);
        this._setHeader('humbase-store-api-key', apiKey);
    }

    async findAll(): Promise<FindAllResponse> {
        const res = await this._get('');
        return await res.json()
    }

    async findByID(id: string): Promise<FindByIDResponse> {
        const res = await this._get(id);
        return await res.json()
    }
    async put(req: PutRequest): Promise<FindByIDResponse> {
        const res = await this._post('', req);
        return await res.json()
    }

    async del(id: string): Promise<void> {
        await this._delete(id, {});
        return;
    }
}

export default StoreClient;