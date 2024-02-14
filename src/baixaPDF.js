import puppeteer from "puppeteer";

export const baixaPDF = async (user, password, nf) => {
  const browser = await puppeteer.launch({
    args: ["--start-maximized", "--headless=new"],
  });
  const page = await browser.newPage();
  await page.goto(
    `https://eldorado.megasoftarrecadanet.com.br/primeiro-acesso`
  );

  await page.click("img.botao");

  await page.type("#cpf", user);

  await page.type("#senha", password);

  await page.click("button[type=submit].btn.btn-mega.btn-block.primary.login");

  await new Promise((r) => setTimeout(r, 1000)).then(async () => {
    await page.goto(
      `https://eldorado.megasoftarrecadanet.com.br/gerenciar-nfs-e`
    );
  });

  const link = await pegarNota(browser, page, nf);
  browser.close();
  return tratarLink(link);
};

async function pegarNota(browser, page, nf) {
  // await #numero to load
  await new Promise((r) => setTimeout(r, 500)).then(async () => {
    await page.type("#numero", nf);
  });
  // click enter
  await page.keyboard.press("Enter");
  await new Promise((r) => setTimeout(r, 500));
  await page.click(
    "table.table.table-hover.table-bordered.lazy.table-striped tbody tr:first-child"
  );

  let urlPromise = new Promise((resolve, reject) => {
    browser.on("targetcreated", async (target) => {
      try {
        if (target.type() === "page") {
          const newPage = await target.page(); // Obtém a nova aba
          await newPage.waitForSelector("body"); // Espera o corpo da página carregar
          resolve(await newPage.url()); // Resolve a promessa com a URL
          await newPage.close();
        }
      } catch (error) {
        reject(error); // Rejeita a promessa se ocorrer um erro
      }
    });
  });

  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button")); // Encontrar todos os botões
    const targetButton = buttons.find((button) =>
      button.innerText.includes("ENVIAR POR WHATSAPP")
    ); // Procurar o botão com o texto específico
    if (targetButton) targetButton.click(); // Clicar no botão, se encontrado
  });

  return await urlPromise;
}

async function tratarLink(link) {
  // remove the first 34 characters from the link
  let newlink = link.slice(35);
  // remove the last 3 characters from the link
  return newlink.slice(0, -3);
}
