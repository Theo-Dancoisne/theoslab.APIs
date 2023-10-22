## An API that recovers data from the Wigor schedule with Playwright


Wigor schedule: a private schedule used in my school, written in .NET, and quite broken, I written a little comment about that, see in schedule.spec .  
(https://github.com/Theo-Dancoisne/theoslab.APIs.wigorSchedule/blob/main/e2e/schedule.spec.ts#L7-L18)  

As Wigor schedule uses personal login I invite you to read [./private/exemple.users.json](./private/example.users.json) .

#### To use this API you need either:  
- Your personal school login ;  
- Or use my private hosted version where possibly people from other promotions/specialties generously entrust me with their login that you can use through keys (ex: 3sys for 3rd year sysops option).  
  If you want more information about this contact me here 
  [theo.dancoisne@ecoles-epsi.net](mailto:theo.dancoisne@ecoles-epsi.net?subject=Je%20veux%20plus%20d'informations%20sur%20l'API%20Wigor%20schedule).  
  Or if you want to entrust me with your login, contact me here [theo.dancoisne@ecoles-epsi.net](mailto:theo.dancoisne@ecoles-epsi.net?subject=Je%20veux%20faire%20parti%20de%20l'API%20Wigor%20schedule&body=⚠Ne%20me%20donnez%20pas%20vos%20login%20maintenant⚠).  

##### Hosted version try out and more info on Postman
https://www.postman.com/theodancoisne/workspace/theo-s-lab-apis-public

### About Plywright

Playwright is used to do automation on browsers and apps  (headless or not) to check that everything works as expected.  
Here i use it to to grab the text in the html DOM.

[Playwright website](https://playwright.dev/)  
[Little Playwright doc by Microsoft](https://learn.microsoft.com/en-us/microsoft-edge/playwright/)

[Playwright VS Puppeteer](https://blog.logrocket.com/playwright-vs-puppeteer/)  