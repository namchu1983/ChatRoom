import React from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';
import authService from './api-authorization/AuthorizeService';

export function ChatRoom() {
    const [connection, setConnection] = React.useState(undefined);
    const [sendMessage, setSendMessage] = React.useState("");
    const [messagesList, setMessagesList] = React.useState([]);
    const [userLogIn, setUserLogIn] = React.useState(undefined);

    React.useEffect(() => {
        async function getUser() {
            const currentUserLogIn = await authService.getUser();
            setUserLogIn(currentUserLogIn);
        }
        getUser();
    }, [setUserLogIn]);
    
    React.useEffect(() => {
        const newConnection = new HubConnectionBuilder().withUrl("/chatHub").build();
        newConnection.start().then(function () {
        }).catch(function (err) {
            console.error(err.toString());
        });
        setConnection(newConnection);
    }, [setConnection]);

    React.useEffect(() => {
        if (connection) {
            connection.on("ReceiveMessage", function (user, message) {
                var msg = message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
                var encodedMsg = user + " : " + msg;
                setMessagesList([...messagesList, encodedMsg]);
            });
        }
    }, [connection, messagesList, setMessagesList]);
    const handleSubmit = (e) => {
        if (connection) {
            const user = userLogIn.name;
            connection.invoke("SendMessage", user, sendMessage).catch(function (err) {
                return console.error(err.toString());
            });
        }
        e.preventDefault();
    }
    return (<div>
        <form onSubmit={handleSubmit}>
            <label>
                Message : 
              <input type="text" value={sendMessage} onChange={e => setSendMessage(e.target.value)} name="name" />
            </label>
            <input type="submit" value="Send" />
        </form>
        {

            messagesList.map((item, i) => 
                <li key={i}>{item}</li>
            )
        }
    </div>);
}