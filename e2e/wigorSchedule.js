// const { test, expect } = require("@playwright/test");
const playwright = require("playwright");

(async () => {
    // const browser = await playwright.chromium.launchPersistentContext("C:/Users/theod/AppData/Local/Microsoft/Edge/User Data", {
    // const browser = await playwright.chromium.launchPersistentContext("C:/Users/theod/AppData/Local/Google/Chrome/User Data", {
    const browser = await playwright.chromium.launch({
        channel: 'msedge',
        // executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
        headless: false,
        // devtools: true,
        // handleSIGHUP: false,
        // handleSIGINT: false,
        // handleSIGTERM: false,
    });
    const context = await browser.newContext();
    const page = await context.newPage();

    let url = "https://ws-edt-cd.wigorservices.net/WebPsDyn.aspx?action=posEDTLMS&amp;serverID=C&amp;Tel=theo.dancoisne&amp;date=03/28/2023&amp;hashURL=6A322522A712EBD110260D1D505E28F595156D9701C0D240D268F8F329899514AFCCC45DAE4C54C0329C0765F10306871431A8FDA76A5C561114CD87028866D2";
    var scheduleObject = {};
    await page.goto("https://cas-p.wigorservices.net/cas/login?service=https%3A%2F%2Fws-edt-cd.wigorservices.net%2FWebPsDyn.aspx%3Faction%3DposEDTLMS%26serverID%3DC%26Tel%3Dtheo.dancoisne%26date%3D03%252F28%252F2023%26hashURL%3D6A322522A712EBD110260D1D505E28F595156D9701C0D240D268F8F329899514AFCCC45DAE4C54C0329C0765F10306871431A8FDA76A5C561114CD87028866D2");
    await page.waitForLoadState("networkidle");
    console.log("ok");
    await page.getByLabel("username").fill("theo.dancoisne");
    // await page.getByLabel("password").fill("DAN.the22.");
    // await page.getByRole("button", { name: 'Login' }).click();

    // await page.waitForURL("https://ws-edt-cd.wigorservices.net/**");
    /*await page.waitForLoadState("networkidle");

    for (const element of await page.locator(".Case").all()) 
    {
        console.log(element.getByRole("table").locator(".TCase").textContent());
    }*/
    await browser.close();
})();