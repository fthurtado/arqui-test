require('dotenv').config();
const { v4: uuidv4 } = require('uuid');

const sgMail = require('@sendgrid/mail');

const KoaRouter = require('koa-router');
const jwtgenerator = require('jsonwebtoken');

const router = KoaRouter();

function generateToken(user) {
  return new Promise((resolve, reject) => {
    jwtgenerator.sign(
      { sub: user.id },
      process.env.JWT_SECRET,
      { expiresIn: 60 * 30 },
      (err, tokenResult) => (err ? reject(err) : resolve(tokenResult)),
    );
  });
}

// http://localhost:8080/api/auth/user_company_or_admin (post para login de usuario, compañia o admin)
router.post('api.auth.login', '/:kindUser', async (ctx) => {
  const { email, password } = ctx.request.body;
  if (ctx.params.kindUser == 'user') {
    const user = await ctx.orm.user.findOne({ where: { email } });
    if (!user) ctx.throw(404, 'Usuario no encontrado');
    const authenticated = await user.checkPassword(password);
    if (!authenticated) ctx.throw(401, 'Contraseña incorrecta');
    try {
      const token = await generateToken(user);
      const toSendUser = {
        nick: user.nick,
        email,
        id: user.id,
        balance: user.balance,
        isAdmin: user.isAdmin,
        isActive: user.isActive,
      };
      ctx.body = {
        ...toSendUser,
        access_token: token,
        token_type: 'bearer',
      };
    } catch (error) {
      ctx.throw(500);
    }
  } else if (ctx.params.kindUser == 'company') {
    const company = await ctx.orm.company.findOne({ where: { email } });
    if (!company) ctx.throw(404, 'Compañía no encontrada');
    const authenticated = await company.checkPassword(password);
    if (!authenticated) ctx.throw(401, 'Contraseña incorrecta');
    try {
      const token = await generateToken(company);
      const toSendCompany = {
        name: company.name,
        email,
        id: company.id,
        balance: company.balance
      };
      ctx.body = {
        ...toSendCompany,
        access_token: token,
        token_type: 'bearer',
      };
    } catch (error) {
      ctx.throw(500);
    }
  } else {
    const user = await ctx.orm.user.findOne({ where: { email } });
    if (!user) ctx.throw(404, 'Usuario no encontrado');
    const authenticated = await user.checkPassword(password);
    if (!authenticated) ctx.throw(401, 'Contraseña incorrecta');
    if (!user.isAdmin) ctx.throw(401, 'Usuario no no es administrador');
    try {
      const token = await generateToken(user);
      const toSendUser = {
        nick: user.nick,
        email,
        id: user.id,
        balance: user.balance,
        isAdmin: true,
        isActive: true,
      };
      ctx.body = {
        ...toSendUser,
        access_token: token,
        token_type: 'bearer',
      };
    } catch (error) {
      ctx.throw(500);
    }
  }
});

// http://localhost:8080/api/auth/register/user_or_company (post para registrar un usuario o compañia)
router.post('api.users.create', '/register/:kindUser', async (ctx) => {
  try {
    console.log('here1');
    if (ctx.params.kindUser == 'user') {
      console.log('here2');
      console.log(ctx.request.body);
      const user = ctx.orm.user.build(ctx.request.body);
      console.log('here3');
      user.id = uuidv4();
      console.log('here4');
      await user.save({
        field: ['id', 'nick', 'email',
        'password', 'balance', 'member', 'isAdmin', 'isActive'],
      });
      console.log('here5');
      ctx.body = user;
    } else {
      const company = ctx.orm.company.build(ctx.request.body);
      company.id = uuidv4();
      await company.save({
        field: ['id', 'name', 'email',
          'password', 'balance' ],
      });
      ctx.body = company;
    }
    if (ctx.body.member) {
      const text = `Estimado/a:\nLe informamos que se ha creado exitosamente su cuenta\nSaludos!`;
      const msg = {
        to: ctx.body.email,
        from: 'fintechemail1@gmail.com',
        subject: `Notifcación de Transacción de Compra`,
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
    ctx.status = 201;
  } catch (ValidationError) {
    ctx.throw(400);
    ctx.body = ValidationError;
  }
});

module.exports = router;
