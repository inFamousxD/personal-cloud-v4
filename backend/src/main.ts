import express, { Request, Response } from 'express';
import { writeFileSync } from 'fs';

const app = express();
const PORT = 3333;
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

app.get('/', (_req: Request, res: Response) => {
    res.send('hello');
});

app.post('/post-test', (req: Request, res: Response) => {
    const data = req.body;
    console.log(data)
    writeFileSync('test.txt', data.test);

    res.send(200);
})

app.listen(PORT, () => {
    console.log(`Server is running ${PORT}`);
});
