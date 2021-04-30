
export default class HTTPClient {
  private baseURL = "";
  private headers = new Headers();

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.headers.append("Content-Type", "application/json");
  }

  protected _setHeader(key: string, value: string) {
    this.headers.set(key, value);
  }

  protected _unsetHeader(key: string) {
    this.headers.delete(key);
  }

  protected _get(path: string) {
    return this._request("GET", path, {});
  }
  protected _post(path: string, payload: any) {
    return this._request("POST", path, payload);
  }
  protected _put(path: string, payload: any) {
    return this._request("PUT", path, payload);
  }
  protected _patch(path: string, payload: any) {
    return this._request("PATCH", path, payload);
  }
  protected _delete(path: string, payload: any) {
    return this._request("DELETE", path, payload);
  }

  protected _request(method: string, path: string, payload: any) {
    const options: RequestInit = {
      headers: this.headers,
      method: method,
      body: method === "GET" ? null : JSON.stringify(payload),
      mode: "cors",
    };

    if (path !== '') {
      path = `/${path}`;
    }
    return fetch(`${this.baseURL}${path}`, options);
  }
}