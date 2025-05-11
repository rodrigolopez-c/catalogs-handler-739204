import express, { Request, Response } from 'express';
import routes from './routes/index';
import { config } from 'dotenv';

config();

const app = express();

app.use(routes);

const port = parseInt(process.env.PORT || '3001', 10);

app.get('', (req: Request, res: Response) => {
    res.send('Api works');
});

app.listen(port, '0.0.0.0', () => {
    console.log(`App is running on port ${port}`);
});