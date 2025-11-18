/*
import CredentialsProvider from 'next-auth/providers/credentials';
import { CognitoUserPool, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import { User } from 'next-auth';

interface SignInError {
  code: string;
  message: string;
}

const CognitoCredentialsProvider = CredentialsProvider({
  id: `cognito_credentials`,
  name: 'CognitoCredentials',
  credentials: {
    username: {},
    password: {},
  },
  async authorize(credentials) {
    const userResult = await SignIn(credentials!);

    if (userResult.error) return null;

    return userResult.user as User;
  },
});

async function SignIn(
  credentials: Record<'username' | 'password', string>
): Promise<Record<'user' | 'error', User | SignInError | undefined>> {
  try {
    const userPool = new CognitoUserPool({
      UserPoolId: process.env.COGNITO_USER_POOL_ID!,
      ClientId: process.env.COGNITO_CREDENTIALS_CLIENT_ID!,
    });

    const cognitoUser = new CognitoUser({
      Username: credentials.username!,
      Pool: userPool,
    });

    const user: User = await new Promise((resolve, reject) => {
      cognitoUser.authenticateUser(
        new AuthenticationDetails({
          Username: credentials?.username!,
          Password: credentials?.password!,
        }),
        {
          onSuccess: function (result) {
            const idToken = result.getIdToken();
            const { sub, email, name, family_name } = idToken.payload;
            resolve({
              id: sub,
              email,
              name: `${name} ${family_name}`,
              roles: (
                idToken.payload['cognito:groups']?.filter((x: string) => x.startsWith('role:')) ??
                []
              ).map((role: string) => role.replace('role:', '')),
              tokens: {
                access_token: result.getAccessToken().getJwtToken(),
                id_token: result.getIdToken().getJwtToken(),
                refresh_token: result.getRefreshToken().getToken(),
                expiresAt: (result.getAccessToken().getExpiration() as number) * 1000,
              },
            });
          },

          onFailure: function (err) {
            reject({
              code: err.name,
              message: err.message,
            });
          },
        }
      );
    });

    return { user: user, error: undefined };
  } catch (error) {
    return { user: undefined, error: error as SignInError };
  }
}

export default CognitoCredentialsProvider;
*/