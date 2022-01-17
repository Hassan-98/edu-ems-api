module.exports = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  let errorMessage = err.message;

  const mongooseErrors = ['ValidationError', 'CastError', 'DocumentNotFoundError', 'ValidatorError', 'ObjectExpectedError', 'ObjectParameterError', 'OverwriteModelError', 'ParallelSaveError', 'StrictModeError', 'MissingSchemaError', 'DivergentArrayError', 'DisconnectedError']

  if (mongooseErrors.indexOf(err.name) > -1) errorMessage = Object.values(err.errors).map(e => e.message).join(" , ");

  if (err.code == 11000) errorMessage = `(${Object.keys(err.keyValue)[0]}: ${Object.values(err.keyValue)[0]}) is already exist`
  
  console.error('\n\x1b[31m%s\x1b[0m\n', errorMessage);
  console.error(err.stack);

  return res.json({err: errorMessage});
}