import { createClient } from "redis";
import * as passport from "passport";
import * as session from "express-session";
import * as connectRedis from "connect-redis";
import * as OAuth2Strategy from "passport-oauth2";
import { Profile, Strategy } from "passport-github2";
import * as express from "express";

import config from "../../config";
import UserModel from "../database/users/users.model";
import { IUserDocument } from "../database/users/users.types";

export function ensureAuthenticated(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "not_connected" });
}

const verify = async (
  accessToken: string,
  refreshToken: string,
  profile: Profile,
  done: OAuth2Strategy.VerifyCallback
): Promise<void> => {
  let user: IUserDocument | null = null;
  try {
    user = await UserModel.findOne({ "externalIDs.github": profile.id });
    if (user) {
      user.accessTokens.github = accessToken;
    } else {
      const photo = profile.photos ? profile.photos[0]?.value : null;
      user = new UserModel({
        username: profile.username,
        accessTokens: {
          github: accessToken,
        },
        externalIDs: {
          github: profile.id,
        },
        emails: profile.emails?.map((email) => {
          return { email: email.value, default: false };
        }),
        photo,
      });
      if (user.emails?.length) user.emails[0].default = true;
    }
    await user.save();
  } catch (error) {
    console.error(error);
  } finally {
    done(null, {
      username: profile.username,
      accessToken,
      refreshToken,
      profile,
      user,
    });
  }
};

passport.use(
  new Strategy(
    {
      clientID: config.CLIENT_ID,
      clientSecret: config.CLIENT_SECRET,
      callbackURL: config.AUTH_CALLBACK,
    },
    verify
  )
);

passport.serializeUser((user: Express.User, done) => {
  done(null, user);
});

passport.deserializeUser((user: Express.User, done) => {
  done(null, user);
});

export function initSession() {
  const RedisStore = connectRedis(session);
  const redisClient = createClient({
    legacyMode: true,
    socket: {
      port: config.REDIS_PORT,
      host: config.REDIS_HOSTNAME,
    },
  });
  redisClient.on("error", (err) => console.log("Redis Client Error", err));
  redisClient.connect();

  return session({
    secret: "keyboard cat",
    store: new RedisStore({
      client: redisClient,
    }),
    saveUninitialized: false,
    resave: false,
  });
}

export const router = express.Router();

router.get(
  "/login",
  passport.authenticate("github", { scope: ["repo"] }), // Note the scope here
  function (req: express.Request, res: express.Response) {
    res.redirect("/");
  }
);

router.get(
  "/auth",
  passport.authenticate("github", { failureRedirect: "/" }),
  function (req: express.Request, res: express.Response) {
    res.redirect("/");
  }
);
