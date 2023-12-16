import 'dotenv/config';
import startQuestions from "./components/questions.js";
import beginScrapper from './components/beginScrapper.js';


let { state, service, numOfLeads } = await startQuestions();

beginScrapper(state, service, numOfLeads, `./lists/${service},${state},${numOfLeads}.csv`);



