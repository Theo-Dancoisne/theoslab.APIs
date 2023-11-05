const playwright = require("playwright");
const packageInfos = require("./package.json");

class WigorSchedule {
    #users;
    #browser;
    #context;
    #page;
    headless = true;
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
    Events = {
        data: {},
        infos: {
            API_version: packageInfos.version,
            wigorSchedule_version: null,
            request_parameters: {
                method: null,
                timestamp: null,
                profile_name: null,
                user_name: null,
            },
        },
        error: {},
    };
    EventsCopy = JSON.parse(JSON.stringify(this.Events));

    constructor(path = "../private/.users.json", headless = true) {
        try {
            this.#users = require(path);
            this.headless = headless;
        } catch (error) {
            throw new Error(`${error} \nYou may need to check out at ./private/example.users.json .\n`);
        }
    }

    /* browser context setup */
    async SetBrower() {
        try {
            if (this.headless) {
                this.#browser = await playwright.chromium.launch();      // prod, headless
            }
            else {
                this.#browser = await playwright.chromium.launch({       // dev, headed
                    channel: 'msedge',
                    headless: false,
                });
            }
            this.#context = await this.#browser.newContext();
            this.#page = await this.#context.newPage();
        }
        catch(error) {
            throw new Error(`${error} \nWhile setting up the Playwright browser, did you forget to install the correct one ? Headless was set on ${headless}, is that what you intended ?`);
        }
    }
    /*  */

    GetEventsByProfile(userProfile, date = new Date()) {
        this.Events.infos.request_parameters.method = "GET";
        this.Events.infos.request_parameters.profile_name = userProfile;
        return new Promise((resolve, reject) => {
            if (!this.#users[userProfile]) reject(`The profile '${userProfile}' does not exist.`);
            this.Start(this.#users[userProfile].unm, this.#users[userProfile].pswd, date).then(() => {
                this.#browser.close();
                resolve(this.Events);
            },
            (err) => {
                let datetime = new Date();
                this.CaptureError(datetime)
                .catch((error) => console.log(error))
                .then(() => this.#browser.close());
                this.Events.error = `[${datetime.toUTCString()}] ${err}`;
                reject(this.Events);
            });
        });
    }
    GetEvents(username, password, date = new Date()) {
        this.Events.infos.request_parameters.method = "POST";
        this.Events.infos.request_parameters.user_name = username;
        return new Promise((resolve, reject) => {
            this.Start(username, password, date).then(() => {
                this.#browser.close();
                resolve(this.Events);
            },
            (err) => {
                let datetime = new Date();
                this.CaptureError(datetime)
                .catch((error) => console.log(error))
                .then(() => this.#browser.close());
                this.Events.error = `[${datetime.toUTCString()}] ${err}`;
                reject(this.Events);
            });
        });
    }

    ClearEventsproperty() {
        this.Events = JSON.parse(JSON.stringify(this.EventsCopy));
    }

    async Selector_visible(selector, timeout=5000) {
        try {
            return await selector.isVisible({ timeout: timeout});
        } catch (error) {
            return false;
        }
    }

    CaptureError(datetime) {
        return new Promise((resolve, reject) => {
            this.#page.screenshot({
                path: `theoslab.APIs.wigorSchedule/logs/screenshots/error_${datetime.getDate()}-${datetime.getMonth() + 1}-${datetime.getFullYear()}_${datetime.getHours()}-${datetime.getMinutes()}-${datetime.getMilliseconds()}.png`,
                timeout: 5000
            }).then(() => {
                return resolve();
            }
            ,(error) => {
                return reject(`Error while taking screenshot:\n${error}`);
            });
        });
    }

    async Start(username, password, date) {
        await this.SetBrower().then(() => {},
        (err) => {
            return reject(err);
        });
        
        this.Events.infos.request_parameters.timestamp = date.getTime();
        // https://ws-edt-cd.wigorservices.net/WebPsDyn.aspx?action=posEDTLMS&serverID=C&Tel=theo.dancoisne&date=02/28/2023&hashURL=6A322522A712EBD110260D1D505E28F595156D9701C0D240D268F8F329899514AFCCC45DAE4C54C0329C0765F10306871431A8FDA76A5C561114CD87028866D2
        let url = [
            "https://ws-edt-cd.wigorservices.net/WebPsDyn.aspx?action=posEDTLMS&serverID=C&Tel=",
            username,
            "&date=",
            (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear(),
            "&hashURL=6A322522A712EBD110260D1D505E28F595156D9701C0D240D268F8F329899514AFCCC45DAE4C54C0329C0765F10306871431A8FDA76A5C561114CD87028866D2"
        ]
        
        this.#page.goto(url.join(""));

        return new Promise(async (resolve, reject) => {
            // await this.#page.getByLabel("username").fill(username);       // for some reasons does not work outside of playwright test
            await this.#page.locator("#username").fill(username);
            await this.#page.getByLabel("password").fill(password);
            // await this.#page.getByRole("button", { name: "Login" }).click();          // "Login" is valid in playwright test but in playwright library the browser will use the language/location set by the system
            await this.#page.locator("[name=submitBtn]").click();
    
            await this.#page.waitForLoadState("networkidle", {timeout: 0});

            // ERROR: handle incorrect credentials
            if (!this.#page.url().startsWith("https://ws-edt-cd.wigorservices.net/WebPsDyn.aspx")) {
                return reject("Incorrect username or password for Wigor Services.\nIf you see this error while using a profile on my web hosted version, please report this issue on https://github.com/Theo-Dancoisne/theoslab.APIs.wigorSchedule/issues/new?title=Nom%20d%27utilisateur%20ou%20mot%20de%20passe%20incorrecte%20dans%20le%20profile&body=Indiquez%20le%20nom%20du%20profile%20que%20vous%20avez%20utilisé..");
            }
            // ERROR

            // ERROR: wrong page after redirection by login(success) page (e.g: .NET error page) OR Unhandled Exception!
            let version = this.#page.locator("#DivEntete_Version");
            if (await this.Selector_visible(version)) this.Events.infos.wigorSchedule_version = (await version.textContent()).match(/EDT - (.*)/)[1];
            else {
                return reject("Wigor schedule version not found, this means that the login page redirected to the wrong page (e.g: a .NET error page of the app) or that the schedule page has been updated.\nTry once or twice before reporting the issue.");
            }
            // ERROR

            // return reject("this a test");
            // date format in the url: m/d/y
            // month is 0 indexed, 0 = january  |  getDay() return number between 0 and 6, 0 = sunday (not monday!)
            const dateInUrl = this.#page.url().match(/date=(.*)&/)[1].split("/").map((item) => parseInt(item));
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
            
            try {
                const days = this.#page.locator(".Jour");
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
            } catch (error) {
                return reject(`Unhandled exception when retrieving days of the week, if you think it should be reported, do so on https://github.com/Theo-Dancoisne/theoslab.APIs.wigorSchedule/issues/new/choose.\nerror: \n ${error}`);
            }

            try {
                const events = this.#page.locator(".Case");
                if (await events.first().textContent() !== "Pas de cours cette semaine") {
                    for (let i = 0; i < await events.count() - 1; i++) {
                        let content = await events.nth(i).getByRole("table");
                        
                        let position = events.nth(i).getAttribute("style").then((style) => {
                            style = style.replaceAll(" ", "").split(/[:;]/);
                            return parseFloat(Math.fround(style[style.indexOf("left") + 1].slice(0, -1) - 0.12).toFixed(1));    // 0.12 is an offset
                        });
                        
                        let Start = (await content.locator(".TChdeb").textContent()).split(" - ");
                        let End = Start.pop();
                        let DateStart = this.dateAtPos[await position].d + "/" + this.dateAtPos[await position].m + "/" + this.dateAtPos[await position].y + " " + Start;
                        let DateEnd = this.dateAtPos[await position].d + "/" + this.dateAtPos[await position].m + "/" + this.dateAtPos[await position].y + " " + End;
                        let Title = content.locator(".TCase").first().textContent();

                        let Link = content.locator(".TCase").locator(".Teams").locator("a").first();
                        if (await this.Selector_visible(Link, 1000)) Link = Link.getAttribute("href");
                        else Link = "";

                        let Teacher = (await content.locator(".TCProf").innerText()).split("\n");
                        let SchoolYear = Teacher.pop();
            
                        // text content exemple: "Salle:<>(<>)"
                        // my regex sucks because it leaves an empty string at both ends of the array so I added filter()
                        let Room = (await content.locator(".TCSalle").textContent()).split(/Salle:|\(|\)/).filter(item => item);
                        let Location = Room.pop();
            
                        this.Events.data[DateStart] = {
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
                return resolve();
            } catch (error) {
                return reject(`Unhandled exception when retrieving the events, if you think it should be reported, do so on https://github.com/Theo-Dancoisne/theoslab.APIs.wigorSchedule/issues/new/choose.\nerror:\n${error}`);
            }
        });
    }
}

exports.WigorSchedule = WigorSchedule;
