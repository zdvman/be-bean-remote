const { match } = require('path-to-regexp');

exports.handle405 = (app) => (req, res, next) => {
  const registeredRoutes = [];

  const extractRoutes = (router, parentPath = '') => {
    router.stack.forEach((layer) => {
      if (layer.route) {
        // Remove trailing slash for consistency
        const fullPath = (parentPath + layer.route.path).replace(/\/$/, '');
        registeredRoutes.push({
          fullPath,
          methods: Object.keys(layer.route.methods).map((m) => m.toUpperCase()),
        });
      } else if (layer.name === 'router' && layer.handle.stack) {
        // Handle subrouters recursively
        extractRoutes(
          layer.handle,
          `${parentPath}${layer.regexp.source
            .replace('^', '') // Remove start-of-string marker
            .replace('\\/?(?=\\/|$)', '') // Remove Express regex suffix
            .replace(/\\\//g, '/')}` // Convert "\/" back to "/"
        );
      }
    });
  };

  extractRoutes(app._router);

  const cleanPath = (req.baseUrl + req.path.split('?')[0]).replace(/\/$/, '');

  const matchedRoute = registeredRoutes.find((route) => {
    const matchFn = match(route.fullPath, { decode: decodeURIComponent });
    return matchFn(cleanPath);
  });

  if (matchedRoute) {
    if (!matchedRoute.methods.includes(req.method)) {
      return res.status(405).send({ msg: 'Method not allowed' });
    }
  } else {
    next();
  }
};

exports.handle404 = (req, res) => {
  res.status(404).send({ msg: 'Endpoint not found' });
};

exports.handlePSQLErrors = (err, req, res, next) => {
  console.log(err);
  // invalid input syntax,
  // out of range for type integer,
  // NOT NULL constraint violation - missing required field
  if (err.code === '22P02' || err.code === '22003' || err.code === '23502') {
    res.status(400).send({
      msg: 'Bad request',
      error: err.message.split('\n')[0],
    });
  } else if (err.code === '23503') {
    // Foreign key constraint violation
    res.status(404).send({
      msg: 'Not found',
      error: err.message.split('\n')[0],
    });
  } else {
    next(err);
  }
};

exports.handleCustomErrors = (err, req, res, next) => {
  if (err.msg && err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
};

exports.handle500 = (err, req, res, next) => {
  res.status(500).send({ msg: 'Internal Server Error' });
};
