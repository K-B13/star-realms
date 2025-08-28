import { useState } from "react";
import { LobbyType } from "./page";
import { useRouter } from 'next/navigation';

export default function Lobby({ lobby }: { lobby: LobbyType }) {
    const [ password, setPassword ] = useState('')
    const [ failedPassword, setFailedPassword ] = useState(false)
    const router = useRouter();

    const handleClickJoin = () => {
        if (!lobby.password || password === lobby.password) router.push('/pages/setup/lobby');
        console.log('yes')
        setFailedPassword(true)
    }

    const handlePasswordChange = (e: React.ChangeEvent<HTMLSelectElement> | React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value)
    }

    return (
        <div className="p-8">
            <h5>{lobby.lobbyName} - {lobby.hostName}</h5>
            <p>Players {lobby.currentPlayers}/{lobby.playerLimit}</p>
            <p>{lobby.type}</p>
            {
                lobby.password && 
                <input
                type="password"
                id='lobby-password'
                name='lobby-password'
                onChange={handlePasswordChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                />
            }
            <button onClick={handleClickJoin}>
                Join
            </button>
        </div>
    )
}