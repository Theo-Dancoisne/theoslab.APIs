import { test, expect } from '@playwright/test';

// var request = new XMLHttpRequest();
// request.open("GET", requestURL);
// request.responseType = "json";
// request.send();

/* why edt of wigorservices sucks */
// - damn it's a long time to connect to `cas-p.wigorservices.net/cas/login` and then
//   to load the desired page on `ws-edt-cd.wigorservices.net/WebPsDyn.aspx`;
// - depending on the domain, you will comme across other versions of site which are still hosted and online ¯\_(°-°)_/¯;
// - the ?hash= url can sometimes lead you to the "Erreur de paramètres" (error of parameters) page;
// - if not, you have still ~5% chances of this even if the url is correct, re-send the request without changing 
//   anything and you have still ~5% chances;
// - class, id, ...'s name are written in french, so I use a matrix;
// - events are not children of days, so I refer to the left position of the style
//   (which is the same to both types) with another matrix;
// - it loads the header of the days of the week after and before the desired date, but not the events,
//   so I don't understand the purpose but I have to uncount the 5 days before and after in my locator;

test("connect to wigor", async ({ page }) => {
    test.slow();
    const url = "https://ws-edt-cd.wigorservices.net/WebPsDyn.aspx?action=posEDTLMS&amp;serverID=C&amp;Tel=theo.dancoisne&amp;date=03/28/2023&amp;hashURL=6A322522A712EBD110260D1D505E28F595156D9701C0D240D268F8F329899514AFCCC45DAE4C54C0329C0765F10306871431A8FDA76A5C561114CD87028866D2";
    const translateMonth = {
        janvier: 1,
        février: 2,
        mars: 3,
        avril: 4,
        mai: 5,
        juin: 6,
        juillet: 7,
        aout: 8,
        septembre: 9,
        octobre: 10,
        novembre: 11,
        décembre: 12,
    };
    var dateAtPos = {
        103: null,
        122.4: null,
        141.8: null,
        161.2: null,
        180.6: null,
    };
    const users = require("../credentials_n_tokens/wigor_schedule/users.json");

    // page.goto("https://cas-p.wigorservices.net/cas/login?service=https%3A%2F%2Fws-edt-cd.wigorservices.net%2FWebPsDyn.aspx%3Faction%3DposEDTLMS%26serverID%3DC%26Tel%3Dtheo.dancoisne%26date%3D3%252F28%252F2023%26hashURL%3D6A322522A712EBD110260D1D505E28F595156D9701C0D240D268F8F329899514AFCCC45DAE4C54C0329C0765F10306871431A8FDA76A5C561114CD87028866D2");
    // page.goto("https://cas-p.wigorservices.net/cas/login?service=https%3A%2F%2Fws-edt-cd.wigorservices.net%2FWebPsDyn.aspx%3Faction%3DposEDTLMS%26serverID%3DC%26Tel%3Dtheo.dancoisne%26date%3D12%252F30%252F2024%26hashURL%3D6A322522A712EBD110260D1D505E28F595156D9701C0D240D268F8F329899514AFCCC45DAE4C54C0329C0765F10306871431A8FDA76A5C561114CD87028866D2");
    // page.goto("https://cas-p.wigorservices.net/cas/login?service=https%3A%2F%2Fws-edt-cd.wigorservices.net%2FWebPsDyn.aspx%3Faction%3DposEDTLMS%26serverID%3DC%26Tel%3Dtheo.dancoisne%26date%3D01%252F02%252F2025%26hashURL%3D6A322522A712EBD110260D1D505E28F595156D9701C0D240D268F8F329899514AFCCC45DAE4C54C0329C0765F10306871431A8FDA76A5C561114CD87028866D2");
    page.goto("https://cas-p.wigorservices.net/cas/login?service=https%3A%2F%2Fws-edt-cd.wigorservices.net%2FWebPsDyn.aspx%3Faction%3DposEDTLMS%26serverID%3DC%26Tel%3Dtheo.dancoisne%26date%3D01%252F7%252F2025%26hashURL%3D6A322522A712EBD110260D1D505E28F595156D9701C0D240D268F8F329899514AFCCC45DAE4C54C0329C0765F10306871431A8FDA76A5C561114CD87028866D2");
    await page.getByLabel("username").fill(users["3sys"].unm);
    await page.getByLabel("password").fill(users["3sys"].pswd);
    await page.getByRole("button", { name: 'Login' }).click();

    await page.waitForLoadState("networkidle");
    // date format in the url: m/d/y
    // month is 0 indexed, 0 = january  |  getDay() return number between 0 and 6, 0 = sunday (not monday!)
    const dateInUrl = page.url().match(/date=(.*)&/)[1].split("/").map((item) => parseInt(item));
    const dayInUrl = new Date(dateInUrl[2], dateInUrl[0] - 1, dateInUrl[1]);

    // EXCEPTION: the date in the url does not enable us to have the correct year between the 24 December and the 07 January
    if (dayInUrl.getMonth() == 11 && new Date("12/24/" + dayInUrl.getFullYear()) < dayInUrl && dayInUrl < new Date("1/7/" + (dayInUrl.getFullYear() + 1))) {
        // var janDecException = 31 - dayInUrl.getDate() + dayInUrl.getDay();
        var janDecException = true;
    } else if (dayInUrl.getMonth() == 0 && new Date("12/24/" + (dayInUrl.getFullYear() - 1)) < dayInUrl && dayInUrl < new Date("1/7/" + dayInUrl.getFullYear())) {
        // var janDecException = dayInUrl.getDay() - dayInUrl.getDate();
        var janDecException = true;
    // } else var janDecException = 0;
    } else var janDecException = false;
    // EXCEPTION
    
    const days = page.locator(".Jour");
    let dateAtPosKeys = Object.keys(dateAtPos);
    // 5 because they load 5 day before and after the current week
    for (let i = 5; i < await days.count() - 5; i++) {
        let day = (await days.nth(i).locator(".TCJour").textContent()).toLowerCase().split(" ").slice(1);
        dateAtPos[dateAtPosKeys[i - 5]] = {
            d: parseInt(day[0]),
            m: translateMonth[day[1]],
            y: (() => {
                if (janDecException) {
                    if (translateMonth[day[1]] == 1 && 1 == dayInUrl.getMonth() + 1) return dayInUrl.getFullYear();
                    if (translateMonth[day[1]] == 12 && 12 == dayInUrl.getMonth() + 1) return dayInUrl.getFullYear();
                    else {
                        if (translateMonth[day[1]] == 1) return dayInUrl.getFullYear() + 1;
                        else return dayInUrl.getFullYear() - 1;
                    }
                } else return dayInUrl.getFullYear();
            })()
        };
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
