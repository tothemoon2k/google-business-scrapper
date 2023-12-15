import * as readline from 'readline';

const startQuestions = () =>{
  let state;
  let service; 
  let numOfLeads;

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('What state would you like to search? ', stateResp => {
      state = stateResp;
    
      rl.question('What service/niche should this search focus on? ', serviceResp => {
        service = serviceResp;
    
        rl.question('How many leads should this search gather? ', numResp => {
          numOfLeads = numResp;

          console.log(state, service, numOfLeads);
          return(state, service, numOfLeads);
        });
    
      });
    
  });
}

export default startQuestions;




/*
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
*/