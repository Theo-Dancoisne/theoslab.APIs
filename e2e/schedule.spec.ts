import { test, expect } from '@playwright/test';

// var request = new XMLHttpRequest();
// request.open("GET", requestURL);
// request.responseType = "json";
// request.send();

test("connect to wigor", async ({ page }) => {
    test.slow();
    const url = "https://ws-edt-cd.wigorservices.net/WebPsDyn.aspx?action=posEDTLMS&amp;serverID=C&amp;Tel=theo.dancoisne&amp;date=03/28/2023&amp;hashURL=6A322522A712EBD110260D1D505E28F595156D9701C0D240D268F8F329899514AFCCC45DAE4C54C0329C0765F10306871431A8FDA76A5C561114CD87028866D2";
    const dayAtPos = {
        "103.0000": "monday",
        "122.4000": "tuesday",
        "141.8000": "wednesday",
        "161.2000": "thursday",
        "180.6000": "friday",
        // + 0.12
    };
    var dateAtPos = {
        "103.0000": null,
        "122.4000": null,
        "141.8000": null,
        "161.2000": null,
        "180.6000": null,
    }
    const translateDay = {
        "janvier": "01",
        "février": "02",
        "mars": "03",
        "avril": "04",
        "mai": "05",
        "juin": "06",
        "juillet": "07",
        "aout": "08",
        "septembre": "09",
        "octobre": "10",
        "novembre": "11",
        "décembre": "12",
    };
    await page.goto("https://cas-p.wigorservices.net/cas/login?service=https%3A%2F%2Fws-edt-cd.wigorservices.net%2FWebPsDyn.aspx%3Faction%3DposEDTLMS%26serverID%3DC%26Tel%3Dtheo.dancoisne%26date%3D03%252F28%252F2023%26hashURL%3D6A322522A712EBD110260D1D505E28F595156D9701C0D240D268F8F329899514AFCCC45DAE4C54C0329C0765F10306871431A8FDA76A5C561114CD87028866D2");
    
    await page.getByLabel("username").fill("theo.dancoisne");
    await page.getByLabel("password").fill("DAN.the22.");
    await page.getByRole("button", { name: 'Login' }).click();

    await page.waitForLoadState("networkidle");
    const dateInUrl = page.url().match(/date=(.*)&/)[1];
    const days = page.locator(".Jour");
    for (let i = 0; i < await days.count(); i++) {
        let day = days.nth(i).locator(".TCJour").textContent();
    }
    const events = page.locator(".Case");
    for (let i = 0; i < await events.count() - 1; i++) {
        let content = await events.nth(i).getByRole("table");
        
        let position = events.nth(i).getAttribute("style").then((style) => {
            // @ts-ignore
            style = style.replaceAll(" ", "").split(/[:;]/);
            // @ts-ignore
            return style[style.indexOf("left") + 1].slice(0, -1);
        });
        
        let title = await content.locator(".TCase").first().textContent();
        let link = await content.locator(".TCase").locator(".Teams").locator("a").first().getAttribute("href");
        let teacher = (await content.locator(".TCProf").innerText()).split("\n");
        let schoolYear = teacher.pop();
        let start = (await content.locator(".TChdeb").textContent()).split(" - ");
        let end = start.pop();
        // text content exemple: "Salle:<>(<>)"
        // my regex sucks because it leaves an empty string at both ends of the array so I added filter()
        let room = (await content.locator(".TCSalle").textContent()).split(/Salle:|\(|\)/).filter(item => item);
        let location = room.pop();
    }
});
