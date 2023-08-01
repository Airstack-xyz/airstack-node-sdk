import { request } from "https";


type Fetch = (url: string, options: Record<string, any>) => Promise<{
    json: () => any;
}>;

export default function fetch(url: string, options: Record<string, any>): ReturnType<Fetch> {
    return new Promise((resolve, reject) => {
        const req = request(url, options, res => {
            const data: any[] = [];

            res.on('data', chunk => {
                data.push(chunk);
            });

            res.on('end', () => {
                const dataObject = JSON.parse(Buffer.concat(data).toString());
                resolve({
                    json: () => dataObject
                });

            })
        }).on('error', error => {
            reject(error.message || 'Something went wrong')
        });

        req.write(options.body);
        req.end();
    })
}