'use client'
import Link from "next/link";
import { useState } from "react";


export default function Home() {
  const [ signUpAndInData, setSignUpAndInData ] = useState({
    username: '',
    password: '',
  })
  const [ showSignUp, setShowSignUp ] = useState(false)
  const [ loggedIn, setLoggedIn ] = useState(false)
    
  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignUpAndInData({
      ...signUpAndInData,
      [e.target.name]: e.target.value
    })
  }
  

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="flex flex-row">
          <div>
            <button
            onClick={() => setShowSignUp(!showSignUp)}
            >
              {!showSignUp ? "Don't have an account": "Already have an account"}
            </button>
            {
              !showSignUp ?
              <form className="flex flex-col">
              {/* <h4>Sign In</h4> */}
                <input name='username' placeholder="Username" onChange={handleOnChange}/>
                <input name='password' placeholder="Password" onChange={handleOnChange}/>
                <button>Sign In</button>
              </form>
              :
            <form className="flex flex-col"> 
              {/* <h4>Sign Up</h4> */}
              <input name='username' placeholder="Username" onChange={handleOnChange}/>
              <input name='password' placeholder="Password" onChange={handleOnChange}/>
              <button>Sign Up</button>
            </form>
            }
          </div>
          <div>
            <form className="flex flex-col">
              <h4>One Time Sign In</h4>
              <input name='username' placeholder="Username" onChange={handleOnChange}/>
              <button>Sign In</button>
            </form>
          </div>
        </div>
        {
          loggedIn &&
          <div className="flex gap-4 items-center flex-col sm:flex-row">
            <Link href='/pages/setup/lobbyCreation'>Host</Link>
            <Link href='/pages/setup/lobbySelection'>Join</Link>
          </div>
        }
      </main>
    </div>
  );
}
