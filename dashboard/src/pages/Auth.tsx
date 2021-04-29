import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AuthClient, { EmailAndPassword } from "../lib/client/auth";

export default function AuthPage() {
    const [humbaseURL, setHumbaseURL] = useState("http://localhost:8888/api/v0")
    const [apiKey, setAPIKey] = useState("test-auth-api-key")
    const [adminKey, setAdminKey] = useState("test-auth-admin-key")
    const [users, setUsers] = useState([] as EmailAndPassword[]);
    const [newUser, setNewUser] = useState({} as EmailAndPassword);

    const getUsers = async () => {
        const client = new AuthClient(humbaseURL, adminKey, apiKey);

        const res = await client.findAll();
        setUsers(res.users)
    }

    useEffect(() => {
        getUsers();
    }, [humbaseURL, apiKey]);

    const onSave = () => {
        const client = new AuthClient(humbaseURL, adminKey, apiKey);
        client.signUp(newUser).then(() => {
            getUsers();
            setNewUser({
                email: '',
                password: '',
            });
        })

    }
    return (
        <div style={{width: 800, margin: '0 auto 0 auto'}}>
            <h1>humbase Auth</h1>
            humbase url: <input type="text" value={humbaseURL} onChange={(e) => setHumbaseURL(e.target.value)} /><br />
            adminKey: <input type="text" value={adminKey} onChange={(e) => setAdminKey(e.target.value)} /><br />
            apiKey: <input type="text" value={apiKey} onChange={(e) => setAPIKey(e.target.value)} /><br /><br />


            Email: <input type="text" value={newUser.email} onChange={(e) => {
                setNewUser({
                    ...newUser,
                    email: e.target.value,
                });
            }} />
            Password: <input type="password" value={newUser.password} onChange={(e) => {
                setNewUser({
                    ...newUser,
                    password: e.target.value,
                })
            }} />
            <button type="button" onClick={onSave}>追加</button>
            <table style={{border: '1px solid grey'}}>
                <tr>
                    <th style={{border: '1px solid grey'}}>Email</th>
                    <th style={{border: '1px solid grey'}}>Password</th>
                </tr>
                {users.map((user, key) => {
                    return (
                        <tr key={key}>
                            <td style={{border: '1px solid grey'}}>{user.email}</td>
                            <td style={{border: '1px solid grey'}}>{user.password}</td>
                        </tr>
                    )
                })}
            </table>
        </div>
    )
}