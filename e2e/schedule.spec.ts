import { test, expect } from '@playwright/test';

// var request = new XMLHttpRequest();
// request.open("GET", requestURL);
// request.responseType = "json";
// request.send();

test("connect to wigor", async ({ page }) => {
    test.slow();
    let url = "https://ws-edt-cd.wigorservices.net/WebPsDyn.aspx?action=posEDTLMS&amp;serverID=C&amp;Tel=theo.dancoisne&amp;date=03/28/2023&amp;hashURL=6A322522A712EBD110260D1D505E28F595156D9701C0D240D268F8F329899514AFCCC45DAE4C54C0329C0765F10306871431A8FDA76A5C561114CD87028866D2";
    var dayAtPos = {
        "103.0000%": "monday",
        "122.4000%": "tuesday",
        "141.8000%": "wednesday",
        "161.2000%": "thursday",
        "180.6000%": "friday",
        // + 0.12
    };
    await page.goto("https://cas-p.wigorservices.net/cas/login?service=https%3A%2F%2Fws-edt-cd.wigorservices.net%2FWebPsDyn.aspx%3Faction%3DposEDTLMS%26serverID%3DC%26Tel%3Dtheo.dancoisne%26date%3D03%252F28%252F2023%26hashURL%3D6A322522A712EBD110260D1D505E28F595156D9701C0D240D268F8F329899514AFCCC45DAE4C54C0329C0765F10306871431A8FDA76A5C561114CD87028866D2");
    
    await page.getByLabel("username").fill("theo.dancoisne");
    await page.getByLabel("password").fill("DAN.the22.");
    await page.getByRole("button", { name: 'Login' }).click();

    // await page.waitForURL("https://ws-edt-cd.wigorservices.net/**");
    await page.waitForLoadState("networkidle");
    const events = page.locator(".Case");
    // console.log(await events.count());
    for (let i = 0; i < await events.count() - 1; i++) {
        console.log(await events.nth(i).getByRole("table").locator(".TCase").textContent());
    }
    // for (const element of await page.locator(".Case").all()) 
    // {
    //     console.log(await element.getByRole("table").locator(".TCase").textContent());
    // }
});
