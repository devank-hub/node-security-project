import path from 'path';
import fs from 'fs';
import https from 'https';
import express from 'express';
import helmet from 'helmet'; // solving security issues which would have been hassle individually
import passport  from 'passport';
import cookieSession from 'cookie-session';
import { Strategy } from 'passport-google-oauth20';
import 'dotenv/config';

import { fileURLToPath } from 'url';
const __dirname = fileURLToPath(path.dirname(import.meta.url));

const PORT = 3000;
const config = {
	CLIENT_ID: process.env.CLIENT_ID,
	CLIENT_SECRET: process.env.CLIENT_SECRET,
	COOKIE_KEY_1: process.env.COOKIE_KEY_1,
	COOKIE_KEY_2: process.env.COOKIE_KEY_2,
};

const AUTH_OPTIONS = {
    clientID: config.CLIENT_ID,
    clientSecret: config.CLIENT_SECRET,
    callbackURL: "https://localhost:3000/auth/google/callback"
};

function verifyCallback(accessToken, refreshToken, profile, done) {
	console.log('Google profile', profile);
	done(null, profile);
}

passport.use(new Strategy(AUTH_OPTIONS, verifyCallback));

//save session to the cookie
passport.serializeUser((user, done) => {
	done(null, user.id);
});

//read session from the cookie
passport.deserializeUser((id, done) => {
	// User.findById(id).then( user => {
	// 	done(null, user);
	// });
	done(null, id);
});

const app = express();

app.use(helmet());
// session middleware
app.use(cookieSession({
	name: 'session',
	keys: [config.COOKIE_KEY_1, config.COOKIE_KEY_2],
	maxAge: 24 * 60 * 60 * 1000,
}));

app.use(passport.initialize());
app.use(passport.session());

function checkLoggedIN(req, res, next) {
	console.log('Logged in user : ' + req.user);
	const IsLoggedIn = !req.IsAuthenticated && req.user; // IsAuthenticated is by default false
	if(!IsLoggedIn) {
		return res.status(401).json({
    		error : 'you must log in first'
    	});
	}
	next();
};

// login end point
app.get('/auth/google',
	passport.authenticate('google', { 
		scope: ['email'] 
	}));

// authorization endpoint
app.get('/auth/google/callback', 
	passport.authenticate('google', {
		failureRedirect: '/failure',
		successRedirect: '/',
		session: true,
	}), 
	(req, res) => {
		console.log('Google auth success');
	}
);

//logout endpoint
app.get('/auth/logout', (req, res) => {
	req.logOut(); // removes req.user & clears any logged in session
	return res.redirect('/');
});

app.get('/secret', checkLoggedIN, (req, res) => {
	return res.send('secret is a secret');
});

app.get('/failure', (req, res) => {
	return res.send('you are not logged in');
});

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

https.createServer({
	key: fs.readFileSync(path.join(__dirname, 'key.pem')),
	cert: fs.readFileSync(path.join(__dirname, 'cert.pem')),
}, app).listen(PORT, () => {
	console.log(`Server is listening on port ${PORT}`);
});