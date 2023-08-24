const playwright = require("playwright");


class WigorSchedule {
    #users;
    translateMonth = {
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
    dateAtPos = {
        103: null,
        122.4: null,
        141.8: null,
        161.2: null,
        180.6: null,
    };

    constructor(path = "../private/.users.json") {
        try {
            this.#users = require(path);
        } catch (error) {
            throw new Error(error + "\nYou may need to check out at ./private/example.users.json .\n");
        }
    }

    async start() {
        /* browser context setup */
        const browser = await playwright.chromium.launch({
            channel: 'msedge',
            headless: false,
        });
        const context = await browser.newContext();
        const page = await context.newPage();
        /*  */
        
        
        page.goto("https://cas-p.wigorservices.net/cas/login?service=https%3A%2F%2Fws-edt-cd.wigorservices.net%2FWebPsDyn.aspx%3Faction%3DposEDTLMS%26serverID%3DC%26Tel%3Dtheo.dancoisne%26date%3D3%252F28%252F2023%26hashURL%3D6A322522A712EBD110260D1D505E28F595156D9701C0D240D268F8F329899514AFCCC45DAE4C54C0329C0765F10306871431A8FDA76A5C561114CD87028866D2");
        // page.goto("https://cas-p.wigorservices.net/cas/login?service=https%3A%2F%2Fws-edt-cd.wigorservices.net%2FWebPsDyn.aspx%3Faction%3DposEDTLMS%26serverID%3DC%26Tel%3Dtheo.dancoisne%26date%3D12%252F30%252F2024%26hashURL%3D6A322522A712EBD110260D1D505E28F595156D9701C0D240D268F8F329899514AFCCC45DAE4C54C0329C0765F10306871431A8FDA76A5C561114CD87028866D2");
        // page.goto("https://cas-p.wigorservices.net/cas/login?service=https%3A%2F%2Fws-edt-cd.wigorservices.net%2FWebPsDyn.aspx%3Faction%3DposEDTLMS%26serverID%3DC%26Tel%3Dtheo.dancoisne%26date%3D01%252F02%252F2025%26hashURL%3D6A322522A712EBD110260D1D505E28F595156D9701C0D240D268F8F329899514AFCCC45DAE4C54C0329C0765F10306871431A8FDA76A5C561114CD87028866D2");
        // page.goto("https://cas-p.wigorservices.net/cas/login?service=https%3A%2F%2Fws-edt-cd.wigorservices.net%2FWebPsDyn.aspx%3Faction%3DposEDTLMS%26serverID%3DC%26Tel%3Dtheo.dancoisne%26date%3D01%252F7%252F2025%26hashURL%3D6A322522A712EBD110260D1D505E28F595156D9701C0D240D268F8F329899514AFCCC45DAE4C54C0329C0765F10306871431A8FDA76A5C561114CD87028866D2");

        // await page.getByLabel("username").fill(users["3sys"].unm);       // for some reasons does not work outside of playwright test
        await page.locator("#username").fill(this.#users["3sys"].unm);
        await page.getByLabel("password").fill(this.#users["3sys"].pswd);
        // await page.getByRole("button", { name: "Login" }).click();          // "Login" is valid in playwright test but in playwright library the browser will use the language/location set by the system
        await page.locator("[name=submitBtn]").click();

        await page.waitForLoadState("networkidle");
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
        let dateAtPosKeys = Object.keys(this.dateAtPos);
        // 5 because they load 5 day before and after the current week
        for (let i = 5; i < await days.count() - 5; i++) {
            const day = (await days.nth(i).locator(".TCJour").textContent()).toLowerCase().split(" ").slice(1);
            const TranslateMonth = this.translateMonth[day[1]];
            const currentMonth = dayInUrl.getMonth() + 1;
            this.dateAtPos[dateAtPosKeys[i - 5]] = {
                d: parseInt(day[0]),
                m: TranslateMonth,
                y: (() => {
                    if (janDecException) {
                        if (TranslateMonth == 1 && 1 == currentMonth || TranslateMonth == 12 && 12 == currentMonth) {
                            return dayInUrl.getFullYear();
                        } else return dayInUrl.getFullYear() + (TranslateMonth == 1 ? 1 : -1);
                    } else return dayInUrl.getFullYear();
                })()
            };
        }
        const events = page.locator(".Case");
        if (await events.first().textContent() == "Pas de cours cette semaine") {
            console.log("nah");
        } else {
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
        }
        await browser.close();
        return "okkkk";
    }
}

exports.WigorSchedule = WigorSchedule;
