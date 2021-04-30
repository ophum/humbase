import React, { useEffect, useState } from 'react';
import './App.css';
import AuthClient from './lib/client/auth';
import MethodClient from './lib/client/method';

const authAPIKey = "test-auth-api-key";
const methodAPIKey = "test-method-api-key";
const authClient = new AuthClient("http://localhost:8888/api/v0", "", authAPIKey);
const methodClient = new MethodClient("http://localhost:8888/api/v0", "", methodAPIKey);

interface Todo {
  todo: string;
  status: string;
}

interface getTodoResponse {
  todo: Todo[];
}

function App() {
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [todoList, setTodoList] = useState([] as Todo[]);
  const [newTodo, setNewTodo] = useState("");

  useEffect(() => {
    getTodo();
  }, [token]);

  const resetForm = () => {
    setEmail("");
    setPassword("");
  }
  const signIn = async () => {
    const res = await authClient.signIn({
      email: email,
      password: password,
    });

    if (res.token == undefined)  {
      return;
    }

    setToken(res.token);
    resetForm();
  }

  const signUp = async () => {
    const res = await authClient.signUp({
      email: email,
      password: password,
    });

    setToken(res.token);
    resetForm();
  }

  const signOut = async () => {
    await authClient.signOut({
      token: token,
    });

    const res = await authClient.verify({
      token: token,
    })

    if (res.status != "valid") {
      setToken("");
    }
  }

  const addTodo = async () => {
    await methodClient.run("addTodo", {
      token: token,
      todo: newTodo,
    });
    setNewTodo("");
    await getTodo();
  }

  const getTodo = async () => {
    if (token == "") {
      setTodoList([] as Todo[]);
      return;
    }

    const ver = await authClient.verify({
      token: token,
    })
    if (ver.status != "valid") {
      setToken("");
    }

    const res = await methodClient.run("getTodo", {
      token: token,
    }) as getTodoResponse;

    setTodoList(res.todo);
  }

  const changeStatus = async (num: number) => {
    await methodClient.run("changeStatus", {
      token: token,
      "num": num
    })
    await getTodo();
  }
  return (
    <div className="App">
      <h1>humbase todo app</h1>

      {token == "" ? (
        <div>
          <h2>SignIn or SignUp</h2>
          <p>Email: <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} /></p>
          <p>Password: <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></p>
          <p>
            <button type="button" onClick={signIn}>SignIn</button>
            {" "}
            <button type="button" onClick={signUp}>SignUp</button>
          </p>
        </div>
      ) : (
        <div>
          <p>ようこそ</p>
          <button type="button" onClick={signOut}>SignOut</button>

          <input type="text" value={newTodo} onChange={(e) => setNewTodo(e.target.value)} />
          <button type="button" onClick={addTodo}>追加</button>
          {todoList && todoList.map((todo, key) => {
            let color = "red";
            if (todo.status == "doing") color = "lightblue";
            else if (todo.status == "done") color = "green";
            return (
              <li style={{backgroundColor: color}} key={key}>{todo.todo} <span style={{cursor: "pointer"}} onClick={() => changeStatus(key)}>[{todo.status}]</span></li>
            )
          }).reverse()}
        </div>
      )}
    </div>
  );
}

export default App;
