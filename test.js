const zipcode = require('us-zipcode');

// Get all zip codes for Alabama
const alabamaZips = zipcode.lookupByState('AL');

// Create a JSON object to map cities to zip codes
const citiesWithZips = {};

alabamaZips.forEach(zip => {
    const city = zip.city.toUpperCase();
    const zipCode = zip.zip;

    // If the city exists, push the zip code to its array
    if (citiesWithZips[city]) {
        citiesWithZips[city].push(zipCode);
    } else {
        // If the city doesn't exist, create a new entry with an array containing the zip code
        citiesWithZips[city] = [zipCode];
    }
});

// Output the JSON object
console.log(JSON.stringify(citiesWithZips, null, 2));
