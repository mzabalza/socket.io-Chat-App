import React, { useState, useEffect } from 'react';
import queryString from 'query-string';
import io from 'socket.io-client';

// IMPORT COMPONENTS
import InfoBar from '../InfoBar/InfoBar';
import Input from '../Input/Input';
import Messages from '../Messages/Messages';

import './Chat.css';

let socket;


const Chat = ({ location }) => {
    const [name, setName] = useState('');
    const [room, setRoom] = useState('');
    const [message, setMessage] = useState();
    const [messages, setMessages] = useState([]);
    const ENDPOINT = 'localhost:5000';

    useEffect(() => {
        const { name, room } = queryString.parse(location.search);

        socket = io(ENDPOINT);

        setName(name);
        setRoom(room);

        socket.emit('join', { name, room }, (error) => {
            if (error) {
                alert(error);
            }
        });
        // Need to return for Unmount or disconnect effect
        return () => {
            socket.emit('disconnect');
            socket.off();
        }

    }, [ENDPOINT, location.search]);


    // ASK JULIEN HOW IS POSSIBLE that thiS RUNS WHEN MESSAGES IF MeSSAgeS INSIDe FUNCTION
    useEffect(() => {
        socket.on('message', (message) => {
            console.log('1 useEffect, socket.on(message)');
            setMessages(messages => [...messages, message])
        })
        console.log('2 useEffect, socket.on(message)');
    }, []);

    const sendMessage = (e) => {
        // Its bad for react full browser refreshes. 
        // When key press or button clicks its what happens but like this we avoid it
        e.preventDefault();

        if (message) {
            socket.emit('sendMessage', message, () => {
                setMessage('');
            });
        }
    };


    return (
        <div className="outerContainer">
            <div className="container">
                <InfoBar room={room} />
                <Messages messages={messages} name={name} />
                <Input
                    setMessage={setMessage}
                    message={message}
                    sendMessage={sendMessage}
                />
            </div>
        </div>
    );
};

export default Chat; 