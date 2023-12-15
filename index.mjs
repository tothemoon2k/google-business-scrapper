import 'dotenv/config';
import * as cheerio from "cheerio"; 
import puppeteerExtra from "puppeteer-extra"; 
import stealthPlugin from "puppeteer-extra-plugin-stealth"; 
import converter from "json-2-csv"; 
import chromium from "@sparticuz/chromium";
import csv from "csvtojson";
import fs from "fs";
import * as readline from 'readline';

let queries = []

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let hdrs = {
  headers: {
    'Authorization': `Bearer ${process.env.HUBSPOT_TOKEN}`,
    'Content-Type': 'application/json'
  }
}

let state;
let service; 
let numOfLeads;

//Ask questions about search in console

rl.question('What state would you like to search? ', stateResp => {
  state = stateResp;

  rl.question('What service/niche should this search focus on? ', serviceResp => {
    service = serviceResp;

    rl.question('How many leads should this search gather? ', numResp => {
      numOfLeads = numResp;

      csv()
        .fromFile('./uszips.csv') 
        .then((json) => {
          const objs = json.filter(r => r.state_name === state);
          for(let obj of objs){
            queries.push(`${service},${obj.zip},${obj.city},${obj.state_id},US`)
          }
          start(500)
        });

      rl.close();
    });

  });

});



async function searchGoogleMaps(query) {
  try {
    const start = Date.now();

    puppeteerExtra.use(stealthPlugin());

    const browser = await puppeteerExtra.launch({
      headless: false,
      // headless: "new",
      // devtools: true,
      PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: true,
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

    const buisnesses = [];

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

        let max = 500; 
      
        let line = `${url?.split('?')?.[0]?.split('ChI')?.[1]}@gmail.com,ChI${url?.split("?")?.[0]?.split("ChI")?.[1]},${firstOfLast?.text()?.split("·")?.[1]?.trim()},${firstOfLast?.text()?.split("·")?.[0]?.trim()},${lastOfLast?.text()?.split("·")?.[1]?.trim()},${url},${storeName},${ratingText},${ratingText?.split("stars")?.[0]?.trim() ? Number(ratingText?.split("stars")?.[0]?.trim()): null}${ratingText?.split("stars")?.[1]?.replace("Reviews", "")?.trim() ? Number(ratingText?.split("stars")?.[1]?.replace("Reviews", "")?.trim()): null}\n`;
      
        fs.appendFile(`gatherings/Scraper-${state},${service},${max}.csv`, line, function (err) {
          if (err){
            console.log(err);
          };
          console.log('Updated!');
        })
      
      }
      
    });
    const end = Date.now();

    console.log(buisnesses);

    return buisnesses;
    } catch (error) {
      console.log("error at googleMaps", error.message);
    }
}

const start = (max) =>{
  console.log("Starteasdfasdfads")
  fs.writeFile(`gatherings/Scraper-${state},${service},${max}.csv`, 'val1,val2,val3', function (err) {
    if (err) throw err;
    console.log('Saved!');
  });

  async function processBatch(itemsBatch) {
    // Process itemsBatch array concurrently 
    await Promise.all(itemsBatch.map(async item => {
      console.log(item)
      await searchGoogleMaps(item); 
    }));
  }
  
  async function main() {
    for(let i = 0; i < queries.length; i+=5) {
      const batch = queries.slice(i, i+5);
      await processBatch(batch); 
    }
    console.log('Done!');
  }

  main();
}

//searchGoogleMaps();



