import IRoute from '../types/IRoute';
import { Router } from 'express';
import { compareSync } from 'bcrypt';
import { attachSession } from '../middleware/auth';
import { sequelize, Session, User } from '../services/db';
import { randomBytes } from 'crypto';
import bcrypt from 'bcrypt';

const AuthRouter: IRoute = {
  route: '/auth',
  router() {
    const router = Router();
    router.use(attachSession);

    // If we're authenticated, return basic user data.
    router.get('/', (req, res) => {
      if (req.session?.token?.id) {
        const {
          token: { token, ...session },
          user: { password, ...user },
        } = req.session;
        return res.json({
          success: true,
          message: 'Authenticated',
          data: {
            session,
            user,
          },
        });
      } else {
        return res.json({
          success: false,
          message: 'Not Authenticated',
        });
      }
    });

    // Attempt to log in
    router.post('/login', async (req, res) => {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Missing username/password.',
        });
      }

      const user = await User.findOne({
        where: sequelize.where(
          sequelize.fn('lower', sequelize.col('username')),
          sequelize.fn('lower', username)
        ),
      }).catch((err) => console.error('User lookup failed.', err));

      // Ensure the user exists. If not, return an error.
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username/password.',
        });
      }

      // Ensure the password is correct. If not, return an error.
      const passwordToCompare = await user.dataValues.password;

      if (!compareSync(password, passwordToCompare)) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username/password.',
        });
      }

      // We now know the user is valid so it's time to mint a new session token.
      const sessionToken = randomBytes(32).toString('hex');
      let session;
      try {
        // Persist the token to the database.
        session = await Session.create({
          token: sessionToken,
          user: user.dataValues.id,
        });
        console.log('Session created:', session);
      } catch (e) {
        return passError('Failed to create session.', e, res);
      }

      console.error('Response body:', res);

      if (!session) {
        // Something broke on the database side. Not much we can do.
        return passError('Returned session was nullish.', null, res);
      }

      // We set the cookie on the response so that browser sessions will
      // be able to use it.
      res.cookie('SESSION_TOKEN', sessionToken, {
        expires: new Date(Date.now() + 3600 * 24 * 7 * 1000), // +7 days
        secure: false,
        httpOnly: true,
      });

      console.error('Response cookie:', res.cookie);
      // We return the cookie to the consumer so that non-browser
      // contexts can utilize it easily. This is a convenience for the
      // take-home so you don't have to try and extract the cookie from
      // the response headers etc. Just know that this is a-standard
      // in non-oauth flows :)

      // console.error('Response body:', res);
      return res.json({
        success: true,
        message: 'Authenticated Successfully.',
        data: {
          token: sessionToken,
        },
      });
    });

    // Attempt to register
    router.post('/register', async (req, res) => {
      const { username, password, displayName } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Missing username or password.',
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({
        where: sequelize.where(
          sequelize.fn('lower', sequelize.col('username')),
          sequelize.fn('lower', username)
        ),
      }).catch((err) => {
        console.error('User lookup failed.', err);
        return res.status(500).json({
          success: false,
          message: 'Internal server error.',
        });
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'The Username is already taken.',
        });
      }

      // Hash the password
      const hashedPassword = bcrypt.hashSync(password, 10);

      // Create new user
      let newUser;
      try {
        newUser = await User.create({
          username,
          displayName,
          password: String(hashedPassword),
          registered: new Date(),
        });
      } catch (e) {
        console.error('Failed to create user.', e);
        return res.status(500).json({
          success: false,
          message: 'Failed to create user.',
        });
      }

      // Generate a session token
      const sessionToken = randomBytes(32).toString('hex');
      let session;
      try {
        // Persist the token to the database
        session = await Session.create({
          token: sessionToken,
          user: newUser.dataValues.id,
        });
      } catch (e) {
        return res.status(500).json({
          success: false,
          message: 'Failed to create a session.',
        });
      }

      // Set the cookie
      res.cookie('SESSION_TOKEN', sessionToken, {
        expires: new Date(Date.now() + 3600 * 24 * 7 * 1000), // 7 days
        secure: false, // Should be true in production if using HTTPS
        httpOnly: true,
      });

      // Return the token
      return res.status(201).json({
        success: true,
        message: 'User registered successfully.',
        data: {
          token: sessionToken,
        },
      });
    });

    router.get('/test-cookie', (req, res) => {
      res.send(req.cookies);
    });

    // Log out
    router.post('/logout', async (req, res) => {
      const sessionToken = req.cookies.SESSION_TOKEN;

      if (!sessionToken) {
        return res.status(400).json({
          success: false,
          message: 'No session token provided.',
        });
      }

      try {
        const result = await Session.destroy({
          where: { token: sessionToken },
        });

        if (result === 0) {
          // No session was found with that token
          return res.status(404).json({
            success: false,
            message: 'Invalid session token.',
          });
        }

        res.clearCookie('SESSION_TOKEN');

        return res.json({
          success: true,
          message: 'Logged out successfully.',
        });
      } catch (error) {
        console.error('Logout failed.', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to log out.',
        });
      }
    });

    return router;
  },
};

export default AuthRouter;

function passError(message, error, response) {
  console.error(message, error);
  return response.status(500).json({
    success: false,
    message: `Internal: ${message}`,
  });
}
