import readline from 'readline';

const startQuestions = () => {
  return new Promise((resolve, reject) => {
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

          rl.close();

          resolve({ state, service, numOfLeads });
        });
      });
    });
  });
};

export default startQuestions;
