import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StoreClient from "../lib/client/store";

export default function StorePage() {
    const [humbaseURL, setHumbaseURL] = useState("http://localhost:8888/api/v0")
    const [apiKey, setAPIKey] = useState("test-store-api-key")
    const [adminKey, setAdminKey] = useState("test-store-admin-key")
    const [store, setStore] = useState({} as {[id: string]: any});

    const getStore = async () => {
        const client = new StoreClient(humbaseURL, adminKey, apiKey);

        const res = await client.findAll();
        console.log(res.data);
        setStore(res.data);
    }

    useEffect(() => {
        getStore();
    }, [humbaseURL, apiKey]);

    
    return (
        <div style={{width: 800, margin: '0 auto 0 auto'}}>
            <h1>humbase Store</h1>
            humbase url: <input type="text" value={humbaseURL} onChange={(e) => setHumbaseURL(e.target.value)} /><br />
            adminKey: <input type="text" value={adminKey} onChange={(e) => setAdminKey(e.target.value)} /><br />
            apiKey: <input type="text" value={apiKey} onChange={(e) => setAPIKey(e.target.value)} /><br /><br />


            <table style={{border: '1px solid grey'}}>
                <tr>
                    <th style={{border: '1px solid grey'}}>Key</th>
                    <th style={{border: '1px solid grey'}}>Value</th>
                </tr>
                {Object.keys(store).map((id, key) => {
                    return (
                        <tr key={key}>
                            <td style={{border: '1px solid grey'}}>{id}</td>
                            <td style={{border: '1px solid grey'}}>{JSON.stringify(store[id])}</td>
                        </tr>
                    )
                })}
            </table>
        </div>
    )
}