const http = require('http');
const Koa = require('koa');
const Router = require('koa-router');
const koaBody = require('koa-body');
const uuid = require('uuid');
const faker = require('faker');
const app = new Koa();

app.use(koaBody({
  text: true,
  urlencoded: true,
  multipart: true,
  json: true,
}));

// => CORS
app.use(async (ctx, next) => {
const origin = ctx.request.get('Origin');
if (!origin) {
  return await next();
}

const headers = { 'Access-Control-Allow-Origin': '*', };

if (ctx.request.method !== 'OPTIONS') {
  ctx.response.set({...headers});
  try {
    return await next();
  } catch (e) {
    e.headers = {...e.headers, ...headers};
    throw e;
  }
}

if (ctx.request.get('Access-Control-Request-Method')) {
  ctx.response.set({
    ...headers,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
  });

  if (ctx.request.get('Access-Control-Request-Headers')) {
    ctx.response.set('Access-Control-Allow-Headers', ctx.request.get('Access-Control-Request-Headers'));
  }

  ctx.response.status = 204;
}
});

// => ROUTER
const router = new Router();

let newMessages = [];

setInterval(() => {
	if (newMessages.length < 2) {
		newMessages.push({
			id: uuid.v4(),
			from: faker.internet.email(),
			subject: faker.lorem.sentence(),
			body: "Long message body here",
			received: Date.now()
		});
	}
}, Math.floor(Math.random() * (10000 - 4000)) + 4000)

router.get('/messages/unread', async (ctx, next) => {
	const data = {
		status: 'ok',
		timestamp: Date.now(),
		messages: newMessages
	}

	ctx.response.body = JSON.stringify(data);

	newMessages.length = 0;
});

router.get('/', async (ctx, next) => {
  ctx.response.body = 'hello';
});

app.use(router.routes()).use(router.allowedMethods());

const port = process.env.PORT || 7070;
const server = http.createServer(app.callback());
server.listen(port);
