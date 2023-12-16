import * as cheerio from "cheerio"; 
import puppeteerExtra from "puppeteer-extra"; 
import stealthPlugin from "puppeteer-extra-plugin-stealth"; 
import fs from "fs";

async function search(query, csvLocation, max) {
    let count = 0;

    try {
      const start = Date.now();
  
      puppeteerExtra.use(stealthPlugin());
  

      const browser = await puppeteerExtra.launch({
        headless: false,
        // headless: "new",
        // devtools: true,
        PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: true,
        //Executable path for mac
        executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
      });
  
      // const browser = await puppeteerExtra.launch({
      //   args: chromium.args,
      //   defaultViewport: chromium.defaultViewport,
      //   executablePath: await chromium.executablePath(),
      //   headless: "new",
      //   ignoreHTTPSErrors: true,
      // });
  
      const page = await browser.newPage();
  
      try {
        await page.goto(
          `https://www.google.com/maps/search/${query.split(" ").join("+")}`
        );
      } catch (error) {
        console.log("error going to page");
      }
  
      async function autoScroll(page) {
        await page.evaluate(async () => {
          const wrapper = document.querySelector('div[role="feed"]');
  
          await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 1000;
            var scrollDelay = 3000;
  
            var timer = setInterval(async () => {
              var scrollHeightBefore = wrapper.scrollHeight;
              wrapper.scrollBy(0, distance);
              totalHeight += distance;
  
              if (totalHeight >= scrollHeightBefore) {
                totalHeight = 0;
                await new Promise((resolve) => setTimeout(resolve, scrollDelay));
  
                // Calculate scrollHeight after waiting
                var scrollHeightAfter = wrapper.scrollHeight;
  
                if (scrollHeightAfter > scrollHeightBefore) {
                  // More content loaded, keep scrolling
                  return;
                } else {
                  // No more content loaded, stop scrolling
                  clearInterval(timer);
                  resolve();
                }
              }
            }, 200);
          });
        });
      }
  
      await autoScroll(page);
  
      const html = await page.content();
      const pages = await browser.pages();
      await Promise.all(pages.map((page) => page.close()));
  
      await browser.close();
      console.log("browser closed");
  
      // get all a tag parent where a tag href includes /maps/place/
      const $ = cheerio.load(html);
      const aTags = $("a");
      const parents = [];
      aTags.each((i, el) => {
        const href = $(el).attr("href");
        if (!href) {
          return;
        }
        if (href.includes("/maps/place/")) {
          parents.push($(el).parent());
        }
      });
  
      console.log("parents", parents.length);
  
      parents.forEach((parent) => {
        const url = parent.find("a").attr("href");
        // get a tag where data-value="Website"
        const website = parent.find('a[data-value="Website"]').attr("href");
        // find a div that includes the class fontHeadlineSmall
        const storeName = parent.find("div.fontHeadlineSmall").text();
        // find span that includes class fontBodyMedium
        const ratingText = parent
          .find("span.fontBodyMedium > span")
          .attr("aria-label");
  
        // get the first div that includes the class fontBodyMedium
        const bodyDiv = parent.find("div.fontBodyMedium").first();
        const children = bodyDiv.children();
        const lastChild = children.last();
        const firstOfLast = lastChild.children().first();
        const lastOfLast = lastChild.children().last();
  
        let phone = lastOfLast?.text()?.split("·")?.[1]?.trim()
  
        if (!website && phone) {
          count+=1;
          let max = 500; //change to non fixed number
        
          let line = `ChI${url?.split("?")?.[0]?.split("ChI")?.[1]},${firstOfLast?.text()?.split("·")?.[1]?.trim()},${firstOfLast?.text()?.split("·")?.[0]?.trim()},${lastOfLast?.text()?.split("·")?.[1]?.trim()},${url},${storeName},${ratingText},${ratingText?.split("stars")?.[0]?.trim() ? Number(ratingText?.split("stars")?.[0]?.trim()): null}${ratingText?.split("stars")?.[1]?.replace("Reviews", "")?.trim() ? Number(ratingText?.split("stars")?.[1]?.replace("Reviews", "")?.trim()): null}\n`;
        
          //Proper file location gatherings/Scraper-${state},${service},${max}.csv
          fs.appendFile(csvLocation, line, function (err) {
            if (err){
              console.log(err);
            }else{
              console.log('Added More Leads!');
            }
          })
        
        }
        
      });
      const end = Date.now(); //For measuring how long query takes

      console.log(`${count} of ${parents.length} did not have a website`);
      return(count);
    } catch (error) {
      console.log("error at googleMaps", error.message);
    }
}

export default search;