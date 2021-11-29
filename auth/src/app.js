const Koa = require('koa');
const koaBody = require('koa-body');
const override = require('koa-override-method');
const koaLogger = require('koa-logger');
const koaFlashMessage = require('koa-flash-message').default;
const session = require('koa-session');
const cors = require('@koa/cors');
const api = require('./routes');
const orm = require('./models');

// App constructor
const app = new Koa();

// CORS
app.use(cors({ origin: process.env.ORIGIN || 'http://localhost:8000' }));

// expose ORM through context's prototype
app.context.orm = orm;

// parse request body
app.use(koaBody({
  multipart: true,
  keepExtensions: true,
}));

app.use((ctx, next) => {
  ctx.request.method = override.call(ctx, ctx.request.body.fields || ctx.request.body);
  return next();
});

// log requests
app.use(koaLogger());

// flash messages support
app.use(koaFlashMessage);

// expose a session hash to store information across requests from same client
app.use(session({
  maxAge: 14 * 24 * 60 * 60 * 1000, // 2 weeks
}, app));

// Routing middleware
app.use(api.routes());

module.exports = app;
