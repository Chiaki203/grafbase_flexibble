import { getServerSession } from 'next-auth/next';
import { NextAuthOptions, User } from 'next-auth';
import { AdapterUser } from 'next-auth/adapters';
import GoogleProvider from 'next-auth/providers/google'
import jsonwebtoken from 'jsonwebtoken'
import { JWT } from 'next-auth/jwt';
import { SessionInterface, UserProfile } from '@/common.types';
import { createUser, getUser } from './actions';

export const authOptions:NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  jwt: {
    encode: ({secret, token}) => {
      console.log('nextauth jwt encode token', token)
      const encodedToken = jsonwebtoken.sign({
        ...token,
        iss: 'grafbase',
        exp: Math.floor(Date.now() / 1000) + 60 * 60
      }, secret)
      return encodedToken
    },
    decode: async({secret, token}) => {
      const decodedToken = jsonwebtoken.verify(token!, secret) 
      return decodedToken as JWT
    }
  },
  theme: {
    colorScheme: 'light',
    logo: '/logo.png'
  },
  callbacks: {
    async session({session}) {
      console.log('nextauth callback session', session)
      const email = session.user?.email as string
      try {
        const data = await getUser(email) as {user: UserProfile}
        console.log('session getUser data', data)
        const newSession = {
          ...session,
          user: {
            ...session.user,
            ...data.user
          }
        }
        console.log('newSession', newSession)
        return newSession
      } catch(error) {
        console.log('session error', error)
        return session
      }
    },
    async signIn({user}: {user:AdapterUser | User}) {
      try {
        console.log('signIn user', user)
        const userExists = await getUser(user?.email as string) as {user: UserProfile}
        if (!userExists.user) {
          console.log('user does not exist')
          await createUser(
            user.name as string,
            user.email as string,
            user.image as string
          )
        }
        return true
      } catch(error:any) {
        console.log('signIn error', error)
        return false
      }
    }
  }
}

export async function getCurrentUser() {
  const session = await getServerSession(authOptions) as SessionInterface
  return session
}