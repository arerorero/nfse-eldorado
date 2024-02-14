import { createServer } from "node:http";
import { once } from "node:events";
import { baixaPDF } from "./baixaPDF.js";

async function handler(req, res) {
  try {
    const data = JSON.parse(await once(req, "data"));
    if (req.url === "/baixarPDF") {
      const { user, password, nf } = data;
      const resposta = await baixaPDF(user, password, nf);
      if (!res.headersSent) {
        res.writeHead(200, { "Content-Type": "application/json" });
      }
      res.end(JSON.stringify({ link: resposta }));
    } else {
      if (!res.headersSent) {
        res.writeHead(404, { "Content-Type": "application/json" });
      }
      res.end(JSON.stringify({ message: "wrong url, try /baixarPDF" }));
    }
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "application/json" });
    }
    res.end(JSON.stringify({ message: "Internal Server Error, try again" }));
  }
}

const server = createServer(handler)
  .listen(3000)
  .on("listening", () => {
    console.log(
      "server running at http://localhost:3000/\nwaiting for request on '/baixarPDF...'"
    );
  });

// captura erros não tratados, inclue async.
process.on("uncaughtException", (error, origin) => {
  console.log(`\n${origin} signal received.\n${error}`);
}); // faz o sistema não quebrar

// captura rejeições não tratadas.
process.on("unhandledRejection", (error) => {
  console.log(`\nunhandledRejection signal received.\n${error}`);
});

// gracefull shutdown

function gracefull(event) {
  return (code) => {
    console.log(`${event} signal received, with ${code}`);
    server.close(() => {
      console.log("server closed");
      process.exit(code);
    });
  };
}

//
process.on("SIGINT", gracefull("SIGINT"));
process.on("SIGTERM", gracefull("SIGTERM"));

// not working properly
process.on("exit", (code) => {
  console.log("exit signal received. ", code);
});
