import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MethodClient, { Methods, Program } from '../lib/client/method';

export default function MethodPage() {
    const [adminKey, setAdminKey] = useState("test-method-admin-key")
    const [apiKey, setAPIKey] = useState("test-method-api-key");
    const [humbaseURL, setHumbaseURL] = useState("http://localhost:8888/api/v0");
    const [methods, setMethods] = useState({} as {[name: string]: Program});
    const [newMethodName, setNewMethodName] = useState(""); 
    const [newProgram, setNewProgram] = useState({} as Program);

    const getMethods = async () => {
        const client = new MethodClient(humbaseURL, adminKey, apiKey);
        
        const res = await client.findAll()
        console.log(res.methods)
        setMethods(res.methods);
    }

    useEffect(() => {
        getMethods()
    }, [humbaseURL, adminKey]);

    const onDel = (name: string) => {
        const client = new MethodClient(humbaseURL, adminKey, apiKey);

        client.del(name).then(() => {
            getMethods();
        })
    }
    const onSave = () => {
        const client = new MethodClient(humbaseURL, adminKey, apiKey);
        if (newMethodName === "") {
            alert("名前を入力してください");
            return
        }

        client.put({
            name: newMethodName,
            program: newProgram,
        }).then(() => {
            getMethods()
            setNewProgram({
                lang: 'python3',
                code: '',
            } as Program);
            setNewMethodName("");
        });

    }

    return (
        <div style={{width: 800, margin: '0 auto 0 auto'}}>
            <h1>humbase Method</h1>
            humbase url: <input type="text" value={humbaseURL} onChange={(e) => setHumbaseURL(e.target.value)} /><br />
            adminKey: <input type="text" value={adminKey} onChange={(e) => setAdminKey(e.target.value)} /><br />
            apiKey: <input type="text" value={apiKey} onChange={(e) => setAPIKey(e.target.value)} /><br /><br />

            name: <input type="text" value={newMethodName} onChange={(e) => setNewMethodName(e.target.value)} /><br />
            code: (python3)<br />
            <textarea style={{width: 800, height: 300}} onChange={(e) => setNewProgram({
                lang: 'python3',
                code: e.target.value,
            })} value={newProgram.code} ></textarea><br/>
            <button type="button" onClick={onSave}>追加</button>
            <br />
            <br />
            {Object.keys(methods).map((name) => {
                return (
                    <div style={{
                        width: 800,
                        border: '1px solid black',
                        padding: 4,
                        marginBottom: 4
                    }}>
                        <h3>{humbaseURL}/method/{name}</h3>
                        <button type="button" onClick={() => onDel(name)}>削除</button>
                        <button type="button" onClick={() => {
                            setNewMethodName(name)
                            setNewProgram({
                                lang: 'python3',
                                code: methods[name].code,
                            })
                        }}>編集</button>
                        <p>LANG: {methods[name].lang}</p>
                        <div style={{overflow: "scroll",border: '1px solid grey' , borderRadius: 4, padding: 4}}>
                            <pre><code>{methods[name].code}</code></pre>
                        </div>

                        <RunMethod name={name} humbaseURL={humbaseURL} adminKey={adminKey} apiKey={apiKey} />
                    </div>
                )
            })}
        </div>
    )
}

interface RunMethodProps {
    name: string;
    humbaseURL: string;
    adminKey: string;
    apiKey: string;
}

const RunMethod = ({name, humbaseURL, adminKey, apiKey}: RunMethodProps) => {
    const [body, setBody] = useState("");

    const onRunMethod = (name: string) => {
        const client = new MethodClient(humbaseURL, adminKey, apiKey)

        client.run(name, body).then((res) => {
            alert(JSON.stringify(res));
            console.log(res);
        });
    }
    return (
        <>
            <div>
                body:<br />
                <textarea style={{width: 'calc(100% - 10px)', height: 300, border: '1px solid grey', borderRadius: 4, padding: 4}} onChange={(e) => setBody(
                    e.target.value
                )} value={body} ></textarea>
            </div>

            <button type="button" onClick={() => onRunMethod(name)}>Run</button>
        </>
    )
}