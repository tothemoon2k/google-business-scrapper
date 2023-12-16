import 'dotenv/config';
import startQuestions from "./components/questions.js";
import beginScrapper from './components/beginScrapper.js';
import csv from "csvtojson";
import * as readline from 'readline';


let { state, service, numOfLeads } = await startQuestions();

beginScrapper(state, service, numOfLeads, `Scaper-${service},${state},${numOfLeads}`);



