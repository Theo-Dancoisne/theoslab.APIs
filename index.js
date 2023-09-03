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
    Events = {};

    constructor(path = "../private/.users.json") {
        try {
            this.#users = require(path);
        } catch (error) {
            throw new Error(error + "\nYou may need to check out at ./private/example.users.json .\n");
        }
    }

    GetEventsByProfile(userProfile, date = new Date()) {
        return this.Start(this.#users[userProfile].unm, this.#users[userProfile].pswd, date);
    }
    GetEvents(username, password, date = new Date()) {
        return this.Start(username, password, date);
    }

    async Start(username, password, date) {
        /* browser context setup */
        /*const browser = await playwright.chromium.launch({
            channel: 'msedge',
            headless: false,
        });*/
        const browser = await playwright.chromium.launch();
        const context = await browser.newContext();
        const page = await context.newPage();
        /*  */
        
        // https://ws-edt-cd.wigorservices.net/WebPsDyn.aspx?action=posEDTLMS&serverID=C&Tel=theo.dancoisne&date=02/28/2023&hashURL=6A322522A712EBD110260D1D505E28F595156D9701C0D240D268F8F329899514AFCCC45DAE4C54C0329C0765F10306871431A8FDA76A5C561114CD87028866D2
        let url = [
            "https://ws-edt-cd.wigorservices.net/WebPsDyn.aspx?action=posEDTLMS&serverID=C&Tel=",
            username,
            "&date=",
            (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear(),
            "&hashURL=6A322522A712EBD110260D1D505E28F595156D9701C0D240D268F8F329899514AFCCC45DAE4C54C0329C0765F10306871431A8FDA76A5C561114CD87028866D2"
        ]
        
        page.goto(url.join(""));

        // await page.getByLabel("username").fill(username);       // for some reasons does not work outside of playwright test
        await page.locator("#username").fill(username);
        await page.getByLabel("password").fill(password);
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
                let DateStart = this.dateAtPos[await position].d + "/" + this.dateAtPos[await position].m + "/" + this.dateAtPos[await position].y + " " + Start;
                let DateEnd = this.dateAtPos[await position].d + "/" + this.dateAtPos[await position].m + "/" + this.dateAtPos[await position].y + " " + End;
                let Title = content.locator(".TCase").first().textContent();
                let Link = content.locator(".TCase").locator(".Teams").locator("a").first().getAttribute("href");
                let Teacher = (await content.locator(".TCProf").innerText()).split("\n");
                let SchoolYear = Teacher.pop();
    
                // text content exemple: "Salle:<>(<>)"
                // my regex sucks because it leaves an empty string at both ends of the array so I added filter()
                let Room = (await content.locator(".TCSalle").textContent()).split(/Salle:|\(|\)/).filter(item => item);
                let Location = Room.pop();
    
                this.Events[DateStart] = {
                    start: DateStart,
                    end: DateEnd,
                    title: Title,
                    link: Link,
                    teacher: Teacher[0],
                    schoolYear: SchoolYear,
                    room: Room[0],
                    location: Location,
                }
            }
        }
        await browser.close();
        return this.Events;
    }
}

exports.WigorSchedule = WigorSchedule;
