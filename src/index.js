
const EventEmitter = require('events')

const assert = require("assert")

const socketIOClient = require("socket.io-client")

const SimpleRealtimeExchangesTrade = require("simple-realtime-exchanges-trade")
const SimpleRealtimeExchangesTradeCrytocompare = require("simple-realtime-exchanges-trade-cryptocompare")

class ExchangesRealtime extends EventEmitter {
	constructor(options) {
		super();
		
		this.options = {
			...options,
			
			exchanges: {
				...options.exchanges
			}
		};
		
		
		
		this.exchanges = {};
		
		const tradeOptions = {};
		const tradeCryptoCompareOptions = {};

		for(let exchangeName in this.options.exchanges) {
			exchangeName = exchangeName.toLowerCase();
			
			const options = {
				trade: [],
				...this.options.exchanges[exchangeName]
			};
			
			if ( Reflect.ownKeys(SimpleRealtimeExchangesTrade.exchanges).includes(exchangeName) ) {
				tradeOptions[exchangeName] = options;
			} else {
				tradeCryptoCompareOptions[exchangeName] = options;
			}
		}
		
		this.objects = [];
		this.objects.push( 
			new SimpleRealtimeExchangesTrade({ ...this.options, exchanges: tradeOptions })
		);
		this.objects.push( 
			new SimpleRealtimeExchangesTradeCrytocompare({ ...this.options, exchanges: tradeCryptoCompareOptions })
		);
		
		this.objects.forEach(obj => {
			this._setEvents(obj);
		});
	}
	
	
	_setEvents(obj) {
		obj.on("any", (info, ...args) => {
			if ( info.symbol ) {
				const data = args[0];

				this.emit(`${info.event}:${info.exchange}:${info.symbol}`, info, data);
				this.emit(`${info.event}:${info.exchange}:*`, info, data);
				this.emit(`${info.event}:*:*`, info, data);
				this.emit(`any`, info, data);
				return;
			}
			
			this.emit(`${info.event}:${info.exchange}`, info, ...args);
			this.emit(`${info.event}:*`, info, ...args);
			this.emit(`any`, info, ...args);
		});
	}
	
	close() {
		this.objects.forEach(v => v.close());
	}
}
//ExchangesRealtime.exchanges = exchanges;



module.exports = ExchangesRealtime;
