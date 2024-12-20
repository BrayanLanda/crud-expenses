const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("data/db.json");
const middlewares = jsonServer.defaults();

// Usar middlewares por defecto primero
server.use(middlewares);

// Importante: añadir middleware para parsear el body
server.use(jsonServer.bodyParser);

// Middleware de autenticación antes del router
server.post("/login", (req, res) => {
  const { email, password } = req.body;
  
  const users = router.db.get("users").value();
  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    res.json({
      token: user.token,
    });
  } else {
    res.status(401).json({ 
      status: 'error',
      message: 'Invalid credentials'
    });
  }
});

// Middleware para controlar las rutas protegidas
server.use((req, res, next) => {
  if (req.method === "POST" && req.path === "/users") {
    return res.status(403).json({ 
      status: 'error',
      message: 'Direct user creation is not allowed' 
    });
  }
  
  // Para otras rutas, continuar
  next();
});

// Usar el router al final
server.use(router);

// Manejo de errores
server.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    status: 'error',
    message: 'Something went wrong!' 
  });
});

server.listen(3000,() => {
  console.log("JSON Server is running on http://localhost:3000")
});