## An API that recovers data from the Wigor schedule with Playwright


Wigor schedule: a private schedule used in my school, written in .NET, and quite broken, I written a little comment about that, see in schedule.spec .  
(https://github.com/Theo-Dancoisne/theoslab.APIs.wigorSchedule/blob/8e830ac75d2882cba8040aeaef2cf2f0578af8c7/e2e/schedule.spec.ts#L8-L20)  

As Wigor schedule uses personal login I invite you to read [./private/exemple.users.json](./private/example.users.json) .

#### To use this API you need either:  
- Your personal school login ;  
- (soon) Or use my private hosted version where possibly people from other promotions/specialties generously entrust me with their login that you can use through keys (ex: 3sys for 3rd year sysops option).  
  If you want more information about this contact me here 
  <a href="mailto:theo.dancoisne@ecoles-epsi.net?subject=Je%20veux%20plus%20d'informations%20sur%20l'API%20Wigor%20schedule">theo.dancoisne@ecoles-epsi.net</a>.  
  Or if you want to entrust me with your login, contact me here <a href="mailto:theo.dancoisne@ecoles-epsi.net?subject=Je%20veux%20faire%20parti%20de%20l'API%20Wigor%20schedule&body=⚠Ne%20me%20donnez%20pas%20vos%20login%20maintenant⚠">theo.dancoisne@ecoles-epsi.net</a>.  

(mailto:theo.dancoisne@ecoles-epsi.net?subject=Je%20veux%20plus%20d'informations%20sur%20l'API%20Wigor%20schedule)

### About Plywright

Playwright is used to do automation on browsers and apps  (headless or not) to check that everything works as expected.  
Here is use it to to grab the text in some html elements.

[Playwright website](https://playwright.dev/)  
[Little Playwright doc by Microsoft](https://learn.microsoft.com/en-us/microsoft-edge/playwright/)

[Playwright VS Puppeteer](https://blog.logrocket.com/playwright-vs-puppeteer/)  