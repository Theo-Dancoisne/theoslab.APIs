// I use this file to develop and test the API (index.js) quickly and gradually thanks to the VSCode extension 
// "Playwright Test for VSCode": https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright
// you can ignore it
import { test, expect, Page, Frame, Locator } from '@playwright/test';


/* why I (and people) hate the schedule of wigorservices: */
// - damn it's a long time to connect to `cas-p.wigorservices.net/cas/login` and then
//   to load the desired page on `ws-edt-cd.wigorservices.net/WebPsDyn.aspx`;
// - depending on the domain, you will comme across other versions of site which are still hosted and online ¯\_(°-°)_/¯ ;
// - the ?hash= url can sometimes lead you to the "Erreur de paramètres" (error of parameters) page ;
// - if not, you have still ~5% chances of this even if the url is correct, re-send the request without changing 
//   anything and you have still ~5% chances ;
// - events are not children of days, so I refer to the left position of the style
//   (which is the same to both types) with another matrix ;
// - it loads the header of the days of the week after and before the desired date, but not the events,
//   I don't understand the purpose of this but I have to uncount the 5 days before and after in my locator ;
/*  */

async function selector_exists(selector, timeout=5000) {
    try {
        return await selector.waitFor({ timeout: timeout, state: 'attached'});
    } catch (error) {
        return false;
    }
}

test("connect to wigor", async ({ page }) => {
    test.slow();
    const packageInfos = require("../package.json");
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
    var Events = {
        data: {},
        infos: {
            API_version: packageInfos.version,
            wigorSchedule_version: {},
        },
    };
    const users = require("../../private/wigor_schedule/.users.json");

    page.goto("https://cas-p.wigorservices.net/cas/login?service=https%3A%2F%2Fws-edt-cd.wigorservices.net%2FWebPsDyn.aspx%3Faction%3DposEDTLMS%26serverID%3DC%26Tel%3Dtheo.dancoisne%26date%3D10%252F23%252F2023%26hashURL%3D6A322522A712EBD110260D1D505E28F595156D9701C0D240D268F8F329899514AFCCC45DAE4C54C0329C0765F10306871431A8FDA76A5C561114CD87028866D2");
    // page.goto("https://cas-p.wigorservices.net/cas/login?service=https%3A%2F%2Fws-edt-cd.wigorservices.net%2FWebPsDyn.aspx%3Faction%3DposEDTLMS%26serverID%3DC%26Tel%3Dtheo.dancoisne%26date%3D3%252F28%252F2023%26hashURL%3D6A322522A712EBD110260D1D505E28F595156D9701C0D240D268F8F329899514AFCCC45DAE4C54C0329C0765F10306871431A8FDA76A5C561114CD87028866D2");
    // page.goto("https://cas-p.wigorservices.net/cas/login?service=https%3A%2F%2Fws-edt-cd.wigorservices.net%2FWebPsDyn.aspx%3Faction%3DposEDTLMS%26serverID%3DC%26Tel%3Dtheo.dancoisne%26date%3D12%252F30%252F2024%26hashURL%3D6A322522A712EBD110260D1D505E28F595156D9701C0D240D268F8F329899514AFCCC45DAE4C54C0329C0765F10306871431A8FDA76A5C561114CD87028866D2");
    // page.goto("https://cas-p.wigorservices.net/cas/login?service=https%3A%2F%2Fws-edt-cd.wigorservices.net%2FWebPsDyn.aspx%3Faction%3DposEDTLMS%26serverID%3DC%26Tel%3Dtheo.dancoisne%26date%3D01%252F02%252F2025%26hashURL%3D6A322522A712EBD110260D1D505E28F595156D9701C0D240D268F8F329899514AFCCC45DAE4C54C0329C0765F10306871431A8FDA76A5C561114CD87028866D2");
    // page.goto("https://cas-p.wigorservices.net/cas/login?service=https%3A%2F%2Fws-edt-cd.wigorservices.net%2FWebPsDyn.aspx%3Faction%3DposEDTLMS%26serverID%3DC%26Tel%3Dtheo.dancoisne%26date%3D01%252F7%252F2025%26hashURL%3D6A322522A712EBD110260D1D505E28F595156D9701C0D240D268F8F329899514AFCCC45DAE4C54C0329C0765F10306871431A8FDA76A5C561114CD87028866D2");
    await page.getByLabel("username").fill(users["3sys"].unm);          // for some reasons does not work in playwright library
    await page.getByLabel("password").fill(users["3sys"].pswd);
    await page.getByRole("button", { name: "Login" }).click();          // "Login" is valid in playwright test but in playwright library the browser will use the language/location set by the system

    await page.waitForLoadState("networkidle");

    // ERROR: handle incorrect credentials
    if (!page.url().startsWith("https://ws-edt-cd.wigorservices.net/WebPsDyn.aspx")) console.error("Incorrect credentials, the following code will fail.");
    // ERROR

    Events.infos.wigorSchedule_version = (await page.locator("#DivEntete_Version").textContent()).match(/EDT - (.*)/)[1];

    // date format in the url: m/d/y
    // month is 0 indexed, 0 = january  |  getDay() return number between 0 and 6, 0 = sunday (not monday!)
    const dateInUrl = page.url().match(/date=(.*)&/)[1].split("/").map((item) => parseInt(item));
    const dayInUrl = new Date(dateInUrl[2], dateInUrl[0] - 1, dateInUrl[1]);

    // EXCEPTION: the date in the url does not enable us to have the correct year between the 24 December and the 07 January
    const janDecException = (() => {
        const firstDayOfWeek = new Date(dayInUrl);
        firstDayOfWeek.setDate(firstDayOfWeek.getDate() - dayInUrl.getDay() + 1);   // +1 because otherwise it will give you the Sunday of the previous week at 00:00:00 and so the last day will be the Saturday at 00:00:00, no false but not what I want
        const lastDayOfWeek = new Date(firstDayOfWeek);
        lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);

        return firstDayOfWeek.getFullYear() !== lastDayOfWeek.getFullYear();
    })();
    // EXCEPTION
    
    const days = page.locator(".Jour");
    let dateAtPosKeys = Object.keys(dateAtPos);
    // 5 because they load 5 day before and after the current week
    for (let i = 5; i < await days.count() - 5; i++) {
        const day = (await days.nth(i).locator(".TCJour").textContent()).toLowerCase().split(" ").slice(1);
        const TranslateMonth = translateMonth[day[1]];
        const currentMonth = dayInUrl.getMonth() + 1;
        dateAtPos[dateAtPosKeys[i - 5]] = {
            d: day[0].padStart(2, "0"),
            m: TranslateMonth.toString().padStart(2, "0"),
            y: (() => {
                if (janDecException) {
                    if (TranslateMonth == 1 && 1 == currentMonth || TranslateMonth == 12 && 12 == currentMonth) {
                        return dayInUrl.getFullYear();
                    } else return dayInUrl.getFullYear() + (TranslateMonth == 1 ? 1 : -1);
                } else return dayInUrl.getFullYear();
            })(),
        };
    }
    const events = page.locator(".Case");
    if (await events.first().textContent() == "Pas de cours cette semaine") {
        return {};
    } else {
        for (let i = 0; i < await events.count() - 1; i++) {
            let content = await events.nth(i).getByRole("table");
            
            let position = events.nth(i).getAttribute("style").then((style) => {
                // @ts-ignore
                style = style.replaceAll(" ", "").split(/[:;]/);
                // @ts-ignore
                return parseFloat(Math.fround(style[style.indexOf("left") + 1].slice(0, -1) - 0.12).toFixed(1));    // 0.12 is an offset
            });
            
            let Start = (await content.locator(".TChdeb").textContent()).split(" - ");
            let End = Start.pop();
            let DateStart = dateAtPos[await position].d + "/" + dateAtPos[await position].m + "/" + dateAtPos[await position].y + " " + Start;
            let DateEnd = dateAtPos[await position].d + "/" + dateAtPos[await position].m + "/" + dateAtPos[await position].y + " " + End;
            let Title = content.locator(".TCase").first().textContent();

            let Link = content.locator(".TCase").locator(".Teams").locator("a");
            if (await selector_exists(Link, 1000)) Link = Link.first().getAttribute("href");
            else Link = "";

            let Teacher = (await content.locator(".TCProf").innerText()).split("\n");
            let SchoolYear = Teacher.pop();

            // text content exemple: "Salle:<>(<>)"
            // my regex sucks because it leaves an empty string at both ends of the array so I added filter()
            let Room = (await content.locator(".TCSalle").textContent()).split(/Salle:|\(|\)/).filter(item => item);
            let Location = Room.pop();

            Events.data[DateStart] = {
                start: await DateStart,
                end: await DateEnd,
                title: await Title,
                link: await Link,
                teacher: await Teacher[0],
                schoolYear: await SchoolYear,
                room: await Room[0],
                location: await Location,
            }
        }
    }
    console.log(Events);
});
