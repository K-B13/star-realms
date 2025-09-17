'use client'
import { writeValue } from "@/app/firebaseActions"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LandingPage(){
    const router = useRouter()
    const [ lobbyData, setLobbyData ] = useState({
        type: 'PvP',
        playerLimit: 6,
        password: '',
        username: '',
        lobbyName: '',
    })
    const [ showPassword, setShowPassword ] = useState(false)
    const [ lobbyLimit, setLobbyLimit ] = useState(false)
    const [ lobbyHasPassword, setLobbyHasPassword ] = useState(false)
    const test = () => {
        writeValue('/lobbies', lobbyData)
    }

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLobbyData({
            ...lobbyData,
            [e.target.name]: e.target.value
        })
    }

    const handleOnClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        setLobbyData({
            ...lobbyData,
            [e.currentTarget.name]: e.currentTarget.value
        })
    }
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        test()
        router.push('/pages/setup/lobbySelection')
    }
    return (
        <div>
            <h3>Create a Lobby</h3>
            <hr />
            <form onSubmit={handleSubmit}>
                <input required type="text" placeholder="Username" name="username" onChange={handleOnChange} />
                <br/>
                <input required type="text" placeholder="Lobby Name" name="lobbyName" onChange={handleOnChange} />
                <br/>
                <button 
                onClick={handleOnClick} 
                name='type' 
                value='Co-Op'
                disabled={lobbyData.type === 'Co-Op'}
                >Co-Op</button>
                <button 
                onClick={handleOnClick} 
                name='type' 
                value='PvP'
                disabled={lobbyData.type === 'PvP'}
                >PvP</button>
                <br/>
                <p>Lobby Limit</p>
                <input onChange={() => setLobbyLimit(!lobbyLimit)} type="checkbox" />
                {lobbyLimit && <input required={lobbyLimit} type="number" min={1} max={6} name="playerLimit" onChange={handleOnChange} />}
                {lobbyData.playerLimit && !(lobbyData.playerLimit > 0 && lobbyData.playerLimit < 7) && <p>Please choose a number between 1 and 6.</p>}
                <p>Lobby Password</p>
                <input onChange={() => setLobbyHasPassword(!lobbyHasPassword)} type="checkbox" />
                {lobbyHasPassword && <input required={lobbyHasPassword} type={showPassword ? 'text' : 'password'} name="password" onChange={handleOnChange} placeholder="Password"/>}
                <button onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'Hide' : 'Show'}</button>
                <p>Expansion Packs</p>
                {/* <Link href="/pages/setup/lobby"> */}
                <button
                >Create</button>
                {/* </Link> */}
            </form>
            <hr />
            <Link href="/">Back</Link>
            <button onClick={test}>Add</button>
        </div>
    )
}