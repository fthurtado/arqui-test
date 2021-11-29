module.exports = function sendExampleEmail(ctx, data, member) {
  // you can get all the additional data needed by using the provided one plus ctx
  return ctx.sendMail('transaction-email', { to: member.email, subject: 'Solicitud de transacción' }, { data });
};
