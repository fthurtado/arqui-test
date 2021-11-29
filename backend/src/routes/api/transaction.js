const KoaRouter = require('koa-router');
const JSONAPISerializer = require('jsonapi-serializer').Serializer;
// const sendExampleEmail = require('../../mailers/example');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const TransactionSerializer = new JSONAPISerializer('transaction', {
  attributes: [
    'idUser',
    'companyId',
    'stockId',
    'amount',
    'price',
    'createdAt',
    'updatedAt'],
  keyForAttribute: 'camelCase',
});

const TableItemSerializer = new JSONAPISerializer('tableItem', {
  attributes: [
    'ticker',
    'kind',
    'username',
    'amount',
    'price',
    'createdAt',
    'updatedAt'],
  keyForAttribute: 'camelCase',
})

const router = new KoaRouter();

// http://localhost:3000/api/transaction/:userId (obtengo todas las solicitudes que vio un usuario)
router.get('api.transactions.all', '/:userId', async (ctx) => {
  const { userId } = ctx.params;
  const transactionList = await ctx.orm.transaction.findAll({ where: { idUser: userId } });
  for(const transaction of transactionList) {
    const stockInfo = await ctx.orm.stock.findOne({ where: { id: transaction.stockId } });
    transaction.ticker = stockInfo.ticker;
  };
  if (transactionList.length === 0) {
    ctx.throw(404, 'No hay solicitudes registradas');
  } else {
    ctx.status = 200;
    ctx.body = TableItemSerializer.serialize(transactionList);
  }
});

// http://localhost:3000/api/transaction/company/:companyId (obtengo todas las solicitudes que se hicieron a una compañia)
router.get('api.transactions.companyId', '/company/:companyId', async (ctx) => {
  const { companyId } = ctx.params;
  const transactionList = await ctx.orm.transaction.findAll({ where: { companyId: companyId } });
  for(const transaction of transactionList) {
    const stockInfo = await ctx.orm.stock.findOne({ where: { id: transaction.stockId } });
    const userInfo = await ctx.orm.user.findOne({ where: { id: transaction.idUser } });
    transaction.ticker = stockInfo.ticker;
    transaction.username = userInfo.nick;
    (transaction.kind === 'Compra') ? transaction.kind = 'Venta' : transaction.kind = 'Compra';
  };
  ctx.status = 200;
  ctx.body =  TableItemSerializer.serialize(transactionList);

});

// http://localhost:3000/api/transaction/buy (crea una transaccion)
router.post('api.transactions.post', '/buy', async (ctx) => {

  const checkId = ctx.request.body.userId;
  const isblocked = await ctx.orm.blockedUser.findOne({ where: { id: checkId, isBlocked: true}});
  if(isblocked) ctx.throw(403, "El usuario se encuentra en la lista de non-gratos de exchanges externos");
  const user = ctx.state.currentUser;
  if (!user.isActive) ctx.throw(401, 'Usuario desactivado por administrador. No puede realizar operación');
  if(user.balance < ctx.request.body.amount * ctx.request.body.price) ctx.throw(402, "El usuario no tiene suficiente balance para la compra");
  try {
    const member = await ctx.orm.user.findOne({ where: { id: ctx.request.body.userId } });
    // Creamos la transacción
    const newTransaction = ctx.orm.transaction.build({
      idUser: ctx.request.body.userId,
      companyId: ctx.request.body.companyId,
      stockId: ctx.request.body.stockId,
      amount: ctx.request.body.amount,
      price: ctx.request.body.price,
      kind: 'Compra', // Ya que este endpoint está hecho solo para comprar de usuario a empresa
    });
    const stockInstance = await ctx.orm.stock.findOne({ where: { id: ctx.request.body.stockId } });
    const companyInstance = await ctx.orm.company.findOne({ where: { id: stockInstance.companyId } }); 
    ctx.status = 200;

    // Enviamos mail a Usuario
    if (member.member) {

      const text = `Estimado/a ${member.nick}:\nLe informamos que hubo una transacción de Compra.\nInformación de la transacción: \nProducto: ${stockInstance.ticker}\nTipo de solicitud: Compra\nCantidad: ${ctx.request.body.amount}\nSaludos!`;
      const msg = {
        to: member.email,
        from: 'fintechemail1@gmail.com',
        subject: `Notifcación de Nuevo Usuario de ${ctx.request.body.kind}`,
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
    }
    // Enviamos mail a Empresa
    if(companyInstance.member) {
      const text = `Estimado/a ${companyInstance.name}:\nLe informamos que hubo una transacción de Venta.\nInformación de la transacción: \nProducto: ${stockInstance.ticker}\nTipo de solicitud: Venta\nCantidad: ${ctx.request.body.amount}\nSaludos!`;
      const msg = {
        to: companyInstance.email,
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
    }

   // Actualizamos balance del usuario

    await ctx.orm.user.update({ balance: user.balance - ctx.request.body.amount * ctx.request.body.price }, { where: { id: ctx.request.body.userId } });

    // Actualizamos la cantidad de acciones disponibles
    await ctx.orm.stock.update({ amount: stockInstance.amount - ctx.request.body.amount }, { where: { id: ctx.request.body.stockId } }); 
    // Actualizamos balance de la empresa
    await ctx.orm.company.update({balance: companyInstance.balance + ctx.request.body.amount * ctx.request.body.price}, { where: { id: stockInstance.companyId } });
    // Guardamos transacción en BD */
    await newTransaction.save(); 
    ctx.status = 201;
    ctx.body = TransactionSerializer.serialize(newTransaction);
  } catch (ValidationError) {
    ctx.throw(404);
    console.log(ValidationError)
    ctx.body = ValidationError;
  }
});

module.exports = router;
