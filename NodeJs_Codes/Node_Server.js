import http from 'http';
import files from 'fs';
import { isDate } from 'util/types';
import { timeStamp } from 'console';

const server = http.createServer((req,res)=>{

    const url = req.url;
    const method = req.method;
    function timeStamp() {
        const date = new Date();
        return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    }
    


    if(url === '/'){

        res.write('<html>')
        res.write('<head><title>Homepage</title></head>')
        res.write('<body>')
        res.write('<h1>Hello I am Testing Routing Request</h1>')
        res.write('<form action ="/message" method="POST"><input type="text" name="testing"><button type="submit">Send</button></form>')
        res.write('</body>')
        res.write('</html>')
        return res.end();
        
    }
   
    //Added another route on Web using '/about' path
    if (url === '/about'){
        res.write('<html><title>"About Page</title> <body><h1>"This is About Page Speaking..." </h1> </body></html>')
        return res.end();    

    } 

    //Showing Text File Data on Web using '/message' path
    if(url === '/message' && method === 'GET'){

        files.readFile('message.txt','utf-8',(err,data)=>{
        console.log("Message Request HIT!");
        res.write('<html>')
        res.write('<head><title>My Testing Server Page</title></head>')
        res.write('<body>')
        res.write('<html>All Messages! </html>')
        res.write('<pre>' + data + '</pre>')
        res.write('</body>')
        res.write('</html>')
        
        return res.end();
            
        });
        
        return;

    }

    //Saving Form Data from the web to 'Message.txt' file
    if (url === '/message' && method === 'POST') {
    const body = [];

    req.on('data', (chunk) => {
        console.log(chunk);
        body.push(chunk);
    });

    req.on('end', () => {
        const parsedBody = Buffer.concat(body).toString();
        let message = parsedBody.split('=')[1];
        message = message.replace(/\+/g, ' ');  // replace all + swith space
        message = decodeURIComponent(message);

        files.appendFile('message.txt', message + ' '+ timeStamp() + '\n', (err) => {
            if (err) {
                console.error('Error writing file:', err);
                res.statusCode = 500;
                return res.end('Something went wrong.');
            }

            // ✅ Send redirect ONCE
            res.statusCode = 302;
            res.setHeader('Location', '/');
            return res.end();
        });
    });

    //Stop execution so default response isn’t sent
    return;
}

    //Default Result On the Server when no route is Given
    res.setHeader('Content-Type', 'text/html');
    res.write('<html>')
    res.write('<head><title>My Testing Server Page</title></head>')
    res.write('<body><h1>Hello I am Testing to Run the Server 1st Time yayyyy</h1></body>')
    res.write('</html>')
    res.end();
    
    
});

server.listen(3000,"Localhost");
