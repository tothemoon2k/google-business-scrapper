const begin = (max) =>{
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