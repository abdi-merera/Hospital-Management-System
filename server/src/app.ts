import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { connectDatabase } from './config/db';
import { env } from './config/env';
import routes from './routes';
import { errorMiddleware } from './middleware/error.middleware';
import { ensureDefaultRolesAndPermissions } from './modules/roles-permissions/roles-permissions.service';

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(routes);

app.get('/', (_req, res) => {
  res.send('hello world');
});

app.use(errorMiddleware);

connectDatabase()
  .then(async () => {
    await ensureDefaultRolesAndPermissions();
    app.listen(env.port, () => {
      console.log(`App listening on port ${env.port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error.message);
    process.exit(1);
  });

export default app;
