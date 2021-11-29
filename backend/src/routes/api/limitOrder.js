const KoaRouter = require('koa-router');
const JSONAPISerializer = require('jsonapi-serializer').Serializer;
// const sendExampleEmail = require('../../mailers/example');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const LimitOrderSerializer = new JSONAPISerializer('limitOrder', {
  attributes: [
    'idUser',
    'ticker',
    'kind',
    'price',
    'amount',
    'createdAt',
    'updatedAt'],
  keyForAttribute: 'camelCase',
});

const router = new KoaRouter();

// http://localhost:3000/api/transaction/:userId (obtengo todas las limit orders que vio un usuario)
router.get('api.limit-order.all', '/:userId', async (ctx) => {
  const { userId } = ctx.params;
  const limitOrderList = await ctx.orm.limitOrder.findAll({ where: { idUser: userId, isActive: true } });
  if (limitOrderList.length === 0) {
    ctx.throw(404, 'No hay solicitudes registradas');
  } else {
    ctx.status = 200;
    ctx.body = LimitOrderSerializer.serialize(limitOrderList);
  }
});

// http://localhost:3000/api/limitOrder/Update/:orderId (obtengo todas las limit orders que vio un usuario)
router.patch('api.limit-order.edit', '/update/:orderId', async (ctx) => {
  const { orderId } = ctx.params;
  const limitOrder = await ctx.orm.limitOrder.findByPk(orderId);
  if (!limitOrder) {
        ctx.throw(404, 'La orden que estas buscando no existe!');
  }
  console.log("AAAAHH", limitOrder);
  try {
    // limitOrder.isActive = false;
    limitOrder.isActive = false;
    await ctx.orm.limitOrder.update(limitOrder.dataValues, { where: { id: orderId } });
    console.log("BBBB", limitOrder.dataValues);
    // const limitOrder = await ctx.orm.limitOrder.findByPk(orderId);
    ctx.status = 200;
    // ctx.body = StockSerializer.serialize(limitOrder);
  } catch (ValidationError) {
        ctx.throw(400);
        ctx.body = ValidationError;
  }
});

// // http://localhost:3000/api/stock/Update/:idStock (update del stock, actualiza el precio y la cantidad)
// router.patch('api.stock.edit', '/Update/:idStock', async (ctx) => {
//   const stock = await ctx.orm.stock.findByPk(ctx.params.idStock);
//   if (!stock) {
//     ctx.throw(404, 'El stock que estas buscando no existe!');
//   }
//   try {
//     await ctx.orm.stock.update(ctx.request.body, { where: { id: ctx.params.idStock } });
//     const stockBody = await ctx.orm.stock.findByPk(ctx.params.idStock);
//     ctx.status = 200;
//     ctx.body = StockSerializer.serialize(stockBody);
//   } catch (ValidationError) {
//     ctx.throw(400);
//     ctx.body = ValidationError;
//   }

// });

// http://localhost:3000/api/limitOrder/buy (crea una limit order de tipo compra)
router.post('api.limitOrder.post', '/buy', async (ctx) => {
  try {
    const checkId = ctx.request.body.idUser;
    const isblocked = await ctx.orm.blockedUser.findOne({ where: {id: checkId, isBlocked: true}});
    if(isblocked) ctx.throw(403, "El usuario se encuentra en la lista de non-gratos de exchanges externos");

    const user = ctx.state.currentUser;
    if (!user.isActive) ctx.throw(401, 'Usuario desactivado por administrador. No puede realizar operación');
    const memberList = await ctx.orm.user.findAll({ where: { member: true } });
    const newLimitOrder = ctx.orm.limitOrder.build({
      idUser: ctx.request.body.idUser,
      ticker: ctx.request.body.ticker,
      kind: 'buy',
      price: ctx.request.body.price,
      amount: ctx.request.body.amount,
    });
    await newLimitOrder.save();
    memberList.forEach(member => {
      console.log("entro al for", member);
      const text = `Estimado/a ${member.nick}:\nLe informamos que hubo una order de tipo limite de ${ctx.request.body.kind} por parte del usuario ${user.nick}.\nInformación de la transacción:\nNick usuario: ${user.nick}\nProducto: ${ctx.request.body.ticker}\nTipo de solicitud: ${ctx.request.body.kind}\nCantidad: ${ctx.request.body.amount}\nSaludos!`;
      const msg = {
        to: member.email,
        from: 'fintechemail1@gmail.com',
        subject: `Notifcación de Transacción de ${ctx.request.body.kind}`,
        text,
      };
      sgMail
      .send(msg)
      .then(() => {
        console.log('Email sent');
      })
      .catch((error) => {
        console.error(error);
      });
    });
    ctx.status = 201;
    ctx.body = LimitOrderSerializer.serialize(newLimitOrder);
  } catch (ValidationError) {
    ctx.throw(404);
    ctx.body = ValidationError;
  }
});


// http://localhost:3000/api/limitOrder/sell (crea una limit order de tipo venta)
router.post('api.limitOrder.post', '/sell', async (ctx) => {
  try {
    const checkId = ctx.request.body.idUser;
    const isblocked = await ctx.orm.blockedUser.findOne({ where: {id: checkId, isBlocked: true}});
    if(isblocked) ctx.throw(403, "El usuario se encuentra en la lista de non-gratos de exchanges externos");
    
    const user = ctx.state.currentUser;
    if (!user.isActive) ctx.throw(401, 'Usuario desactivado por administrador. No puede realizar operación');
    const memberList = await ctx.orm.user.findAll({ where: { member: true } });
    const newLimitOrder = ctx.orm.limitOrder.build({
      idUser: ctx.request.body.idUser,
      ticker: ctx.request.body.ticker,
      kind: 'sell',
      price: ctx.request.body.price,
      amount: ctx.request.body.amount,
    });
    await newLimitOrder.save();
    memberList.forEach(member => {
      console.log("entro al for", member);
      const text = `Estimado/a ${member.nick}:\nLe informamos que hubo una order de tipo limite de ${ctx.request.body.kind} por parte del usuario ${user.nick}.\nInformación de la transacción:\nNick usuario: ${user.nick}\nProducto: ${ctx.request.body.ticker}\nTipo de solicitud: ${ctx.request.body.kind}\nCantidad: ${ctx.request.body.amount}\nSaludos!`;
      const msg = {
        to: member.email,
        from: 'fintechemail1@gmail.com',
        subject: `Notifcación de Transacción de ${ctx.request.body.kind}`,
        text,
      };
      sgMail
      .send(msg)
      .then(() => {
        console.log('Email sent');
      })
      .catch((error) => {
        console.error(error);
      });
    });
    ctx.status = 201;
    ctx.body = LimitOrderSerializer.serialize(newLimitOrder);
  } catch (ValidationError) {
    ctx.throw(404);
    ctx.body = ValidationError;
  }
});

// http://localhost:3000/api/limitOrder/delete/:orderId (obtengo todas las limit orders que vio un usuario)
router.delete('api.limit-order.delete_order', '/delete/:orderId', async (ctx) => {
  try {
    const { orderId } = ctx.params;
    const order = await ctx.orm.limitOrder.findOne({ where: { id: orderId} });
    await order.destroy();
    ctx.status = 200;
  } catch (ValidationError) {
    ctx.throw(404);
    ctx.body = ValidationError;
  };
});


module.exports = router;
