import { ServerRespond } from './DataStreamer';

export interface Row {
  price_abc: number;
  price_def: number;
  ratio: number;
  upper_bound: number;
  lower_bound: number;
  trigger_alert: number | undefined;
  timestamp: Date;
}


export class DataManipulator {
  static generateRow(serverRespond: ServerRespond[]): Row {
    const priceABC = serverRespond[0].top_ask.price;  // Adjusted this line
    const priceDEF = serverRespond[1].top_bid.price;  // Adjusted this line
    const ratio = priceABC / priceDEF;
    const upperBound = 1.05;  // You can adjust this value if needed
    const lowerBound = 0.95;  // You can adjust this value if needed

    return {
      price_abc: priceABC,
      price_def: priceDEF,
      ratio: ratio,
      upper_bound: upperBound,
      lower_bound: lowerBound,
      trigger_alert: (ratio > upperBound || ratio < lowerBound) ? ratio : undefined,
      timestamp: serverRespond[0].timestamp > serverRespond[1].timestamp ?
        serverRespond[0].timestamp : serverRespond[1].timestamp,
    };
  }
}

