import './style.css'
import './quote.css'





//import * as fun from 'everyday-fun';



//import persist from '@alpinejs/persist'
//Alpine.plugin(persist)
import {LoveCounter} from './love-counter';
import Quotes from './quotes';
import Alpine from 'alpinejs';
window.Alpine = Alpine
//Alpine.data('quoteApp', function(){
	//return {
		//init(){
			//this.quote = fun.getRandomQuote()
		//},
		//quote : {}
	//}
//});
Alpine.data('loveCounter', LoveCounter);


Alpine.data('quoteApp', Quotes)
Alpine.start()
document.querySelector('#app').innerHTML = `"I 💚 Alpine JS!"`