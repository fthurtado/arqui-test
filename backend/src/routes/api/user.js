require('dotenv').config();
const KoaRouter = require('koa-router');
const JSONAPISerializer = require('jsonapi-serializer').Serializer;

const jwt = require('jsonwebtoken');

const router = new KoaRouter();

const UserSerializer = new JSONAPISerializer('user', {
  attributes: [
    'nick',
    'email',
    'balance',
    'isAdmin',
    'isActive',
    'createdAt',
    'updatedAt'],
  keyForAttribute: 'camelCase',
})

// http://localhost:3000/api/user/Update/ ( recargar dinero a la billetera del usuario )
router.patch('api.users.addMoney', '/Update/', async (ctx) => {
  const user = ctx.state.currentUser;
  if (!user.isActive) ctx.throw(401, 'Usuario desactivado por administrador. No puede realizar operación');
  if (!user) {
    ctx.throw(404, 'El usuario que estas buscando no existe!');
  }
  try {
    if (ctx.request.body.type === 'add'){
      ctx.request.body.balance += user.balance;
    } else {
      ctx.request.body.balance = user.balance - ctx.request.body.balance;
    }
      
    await ctx.orm.user.update(ctx.request.body, { where: { id: user.id } });  
    ctx.body = await ctx.orm.user.findByPk(user.id);
    ctx.status = 200;

  } catch (ValidationError) {
    ctx.throw(400);
    ctx.body = ValidationError;
  }
});

// http://localhost:3000/api/user/ ( obtener todos los usuarios creados )
router.get('api.users.all', '/', async (ctx) => {
  try {
    const authHeader = ctx.request.headers.authorization;
    const token = authHeader.substring(7, authHeader.length);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.sub;
    const user = await ctx.orm.user.findOne({ where: { id: userId } });
    if (user && user.isAdmin) {
      const usersList = await ctx.orm.user.findAll();
      ctx.status = 200;
      ctx.body =  UserSerializer.serialize(usersList);
    } else {
      ctx.throw(401, 'Token incorrecto');
    }
  }
  catch {
    ctx.throw(401, 'Token incorrecto');
  }
});

// http://localhost:3000/api/user/ ( editar un usuario )
router.patch('api.users.edit', '/', async (ctx) => {
  try {
    const authHeader = ctx.request.headers.authorization;
    const token = authHeader.substring(7, authHeader.length);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.sub;
    const user = await ctx.orm.user.findOne({ where: { id: userId } });
    if (user && !user.isAdmin) {
      const {
        nick=user.nick,
        email=user.email,
      } = ctx.request.body;
      // Actualizamos el usuario
      await ctx.orm.user.update({ nick, email, isActive }, { where: { id: user.id } });
      ctx.status = 200;
    } else if (user && user.isAdmin) {
      const {
        nick=user.nick,
        email=user.email,
        isActive=user.isActive,
        userIdBody,
      } = ctx.request.body;
      console.log(userIdBody);
      // Actualizamos el usuario
      await ctx.orm.user.update({ nick, email, isActive }, { where: { id: userIdBody } });
      ctx.status = 200;
    } else {
      ctx.throw(401, 'Token incorrecto');
    }
  }
  catch {
    ctx.throw(401, 'Token incorrecto');
  }
});

// http://localhost:3000/api/user/ ( eliminar un usuario )
router.delete('api.users.delete', '/:id', async (ctx) => {
  try {
    const authHeader = ctx.request.headers.authorization;
    const token = authHeader.substring(7, authHeader.length);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.sub;
    const user = await ctx.orm.user.findOne({ where: { id: userId } });
    if (user && !user.isAdmin) {
      await user.destroy();
      ctx.status = 200;
    } else if (user && user.isAdmin) {
      const {
        id,
      } = ctx.params;
      const userToDelete = await ctx.orm.user.findOne({ where: { id } });
      await userToDelete.destroy()
      ctx.status = 200;
    } else {
      ctx.throw(401, 'Token incorrecto');
    }
  }
  catch {
    ctx.throw(401, 'Token incorrecto');
  }
});

module.exports = router;
