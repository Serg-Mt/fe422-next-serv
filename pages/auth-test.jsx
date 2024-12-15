import { useSession, signIn, signOut } from "next-auth/react"
export default function Component() {
  const { data: session } = useSession();
  console.log(' Signed in as', { session });
  if (session) {
    return (
      <>
        Signed in as {session.user.name} ({session.user.email}) <br />
        {session.user.image && <img src={session.user.image} style={{width:'50px',borderRadius:'50%'}}/>}<br />
        <button onClick={() => signOut()}>Sign out</button>
      </>
    )
  }
  return (
    <>
      Not signed in <br />
      <button onClick={() => signIn()}>Sign in</button>
    </>
  )
}