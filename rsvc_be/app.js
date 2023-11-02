// Lib imports
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const { Sequelize } = require('sequelize');
const passport = require('passport');
const session = require('express-session');
const fileUpload = require('express-fileupload');

const cors = require('cors');
const socket = require('socket.io');
const http = require('http');
const socketIO = require('socket.io');
const userService = require('./services/users');
const rolesService = require('./services/roles');

// Local imports
const config = require('./config/config');
// const authMiddleware = require('./middlewares/auth');
const { isFreshInstallation, importFirstTimeData } = require('./services/freshInstallation');
const sequelize = require('./services/db');
const authRouter = require('./routes/auth');
const nonPrivBuyerRouter = require('./routes/nonPrivbuyer');
const ownerRouter = require('./routes/owner');
const propertyRouter = require('./routes/property');
const imageRouter = require('./routes/images');
const indexRouter = require('./routes/index');
const userRouter = require('./routes/users');

const { findMany } = require('./services/users');
const firstTimeData = require('./config/firstTimeData');

const app = express();

const server = http.Server(app); // Use the existing server instance
app.use(cors());
const io = socketIO(server, {
  cors: {
    origin: 'https://654357d99f92cb2dc521c107--fanciful-pasca-c9a092.netlify.app/',
    credentials: true,
  },
});

global.onlineUsers = new Map();
io.on('connection', (socket) => {
  console.log('Socket connected....');
  global.chatSocket = socket;
  socket.on('add-user', (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on('send-msg', (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit('msg-recieve', data.msg);
    }
  });
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
    // return sequelize.sync();
  })
  .then(() => {
    // return isFreshInstallation();
  })
  .then((importFlag) => {
    if (importFlag) {
      console.log('Importing frist time data for fresh installation...');
      return importFirstTimeData();
    }
  })
  .catch((error) => {
    console.error('Unable to connect to the database: ', error);
  });

app.use(fileUpload());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.use('/non-priv/buyer', nonPrivBuyerRouter);

app.use('/auth', authRouter);
// app.use('/', authMiddleware);
app.use('/image', imageRouter);
app.use('/owner', ownerRouter);
app.use('/property', propertyRouter);
app.use('/user', userRouter);

// for development only
app.get('/agents', async (req, res) => {
  let allUsers = await findMany();
  let agentsList = [];
  if (allUsers && allUsers.length > 0) {
    for (let allUser of allUsers) {
      agentsList.push(allUser?.dataValues);
    }
  }
  res.send({ chatUsers: agentsList });
});

// end for development tesing

// app.use("/", middlewareRouter);
app.use('/api', indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
