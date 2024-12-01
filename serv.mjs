import { DatabaseSync } from 'node:sqlite';
import { createServer } from 'node:http';
import { parse as parsePath } from 'node:path'


const
  database = new DatabaseSync('./todo.sqlite'),
  __ = database.exec(`
    CREATE TABLE if not exists todo (
    id INTEGER PRIMARY KEY,
    text TEXT,
    checked INTEGER DEFAULT 0,
    time DATETIME DEFAULT CURRENT_TIMESTAMP
    )`),
  getAllSt = () => database.prepare(`
      SELECT *
      FROM todo `),
  addSt = database.prepare(`
      INSERT INTO todo (text) values(?) `),
  deleteSt = database.prepare(`
      DELETE from todo where id = ? `),
  update = database.prepare(`
      UPDATE todo set checked = ?  where id=?`),


  port = 3333;



createServer(async (request, response) => {
  log(request.method, request.url, 'HTTP/' + request.httpVersion);
  const
    urlObject = new URL(request.url, `http://${request.headers.host}`),
    path = parsePath(urlObject.pathname),
    id = path.name;
  // console.log('parsing', { path, id })
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PATCH, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');



  switch (true) {
    case '/todo' === path.dir || 'todo' === path.base:
      switch (request.method) {
        // case 'OPTIONS':
        //   response.writeHead(204);
        //   break;
        case 'GET':
          response.setHeader('content-type', 'application/json; charset=utf-8');
          response.write(JSON.stringify(getAllSt().all()));

          response.statusCode = 200;
          break;
        case 'POST':
          const
            { text } = JSON.parse(await postData(request));
          console.log('POST', { text });
          addSt.run(text);
          response.statusCode = 201;
          break;
        case 'DELETE':
          deleteSt.run(id);
          response.statusCode = 200;
          break;
        case 'PATCH':
          const
            { checked } = JSON.parse(await postData(request));
          console.log('PATCH', { checked });
          update.run(+checked, id);
          response.statusCode = 200;
          break;
      }

      break;
    default:
      response.statusCode = 404;
  }
  response.end();
}).listen(port, () => {
  log('Server start at http://localhost:' + port);
});

function log(...params) {
  console.log((new Date()).toLocaleTimeString(), ...params);
}

async function postData(request) { // функция аналогична getAndParsePostBody из  mlserv.js
  const buffers = [];
  for await (const chunk of request)  // новая конструкция для перебора асинхронного итератора
    buffers.push(chunk);
  return Buffer.concat(buffers).toString();
}



