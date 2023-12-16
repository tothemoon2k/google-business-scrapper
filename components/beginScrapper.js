import fs from "fs";
import csv from "csvtojson";
import search from "./search.js";

const beginScrapper = async (state, service, max, csvLocation) =>{

  let queries = [];
  let currCount = 0;

  console.log("Starting up the scraping machine...")
  fs.writeFile(csvLocation, 'placeId,address,category,phone,googleUrl,storeName,ratingText,stars,numberOfReviews\n', function (err) {
    if (err) throw err;
    console.log('File Sucessfully Created');
  });

  csv()
    .fromFile('./zipcodes/uszips.csv') 
    .then((json) => {
      const objs = json.filter(r => r.state_name === state);
      for(let obj of objs){
        queries.push(`${service},${obj.zip},${obj.city},${obj.state_id},US`)
      }
      console.log(queries.length, "asdf")
    });

  async function processBatch(itemsBatch) {
    await Promise.all(itemsBatch.map(async query => {
      let count = await search(query, csvLocation, max);
      console.log(count, currCount, max);

      currCount += count;

      console.log(currCount, max);
      if(currCount >= max){
        throw new Error(`Task Completed, ${max} leads gathered`)
      }
      
    }));
  }

  async function main() {
    setTimeout(async ()=>{
      console.log(queries.length, "tesdf")
      for(let i = 0; i < queries.length; i+=5) {
        const batch = queries.slice(i, i+5);
        await processBatch(batch);
      }
      console.log(`Completed, gathered ${max} leads`);
    }, 2000)
    
  }

  main();
}

export default beginScrapper;