/* App constants */

module.exports = Object.freeze({
    API_PORT: '8080',
    API_VERSION: '/v1',
    // String atualizada com replicaSet=rs0 e directConnection=true
    mongoURI: process.env.MONGODB_URI || 'mongodb://admin:password@127.0.0.1:27017/test-gestao-de-contas?authSource=admin&replicaSet=rs0&directConnection=true',
    TRANSACTION_ITHDRAWAL: 0,
    TRANSACTION_DEPOSIT: 1
});
