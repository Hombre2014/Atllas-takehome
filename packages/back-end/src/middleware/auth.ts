import { NextFunction, Request, Response } from 'express';
import { Session, User } from '../services/db';

export function attachSession(req: Request, res: Response, next: NextFunction) {
  if (!req.cookies?.SESSION_TOKEN) {
    return next();
  }
  req.session = {
    token: null,
    user: null,
  };

  Session.findOne({
    where: {
      token: req.cookies.SESSION_TOKEN,
    },
  })
    .then((sess) => {
      if (sess?.dataValues?.id) {
        req.session.token = sess.dataValues;

        User.findOne({
          where: {
            id: sess.dataValues.user,
          },
        }).then((user) => {
          if (user?.dataValues?.id) {
            req.session.user = user.dataValues;

            next();
          } else {
            // else: session is mapped to a deleted user. should report this somewhere.

            // Log the occurrence
            console.warn(
              `Session token ${req.cookies.SESSION_TOKEN} is mapped to a deleted user.`
            );

            // Invalidate the session
            Session.destroy({
              where: { token: req.cookies.SESSION_TOKEN },
            });

            // Inform the user
            res.status(401).json({
              success: false,
              message: 'Session is invalid. Please log in again.',
            });
            return; // Stop further execution in this middleware
          }
        });
      } else {
        // invalid session token

        // Log the occurrence
        console.warn(
          `Invalid session token received: ${req.cookies.SESSION_TOKEN}`
        );

        // Clear the cookie.
        res.cookie('SESSION_TOKEN', '', {
          expires: new Date(0),
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
        });

        // Inform the user
        res.status(401).json({
          success: false,
          message: 'Session token is invalid. Please log in again.',
        });
        return; // Stop further execution in this middleware
      }
    })
    .catch((err) => {
      console.error('Failed to fetch session by token.', err);
      res.status(500).json({
        success: false,
        message: 'Internal: Failed to fetch session by token.',
      });
      return; // Stop further execution in this middleware
    });
}
