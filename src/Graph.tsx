// @ts-ignore
// @ts-ignore
// @ts-ignore

import React, { Component } from 'react';
import { Table } from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
import './Graph.css';

interface IProps {
  data: ServerRespond[];
}

interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void;
}

class Graph extends Component<IProps, {}> {
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
    // Get element from the DOM.
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    const schema = {
      price_abc: 'float',
      price_def: 'float',
      ratio: 'float',
      upper_bound: 'float',
      lower_bound: 'float',
      trigger_alert: 'float',
      timestamp: 'date',
    };

    if (window.perspective ) {
      this.table = window.perspective.worker().table(schema);
    }

    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.
      elem.load(this.table);
      elem.setAttribute('view', 'y_line');
      elem.setAttribute('column-pivots', '["stock"]');
      elem.setAttribute('row-pivots', '["timestamp"]');
      // Correct columns for ratio and bounds
      elem.setAttribute('columns', '["ratio", "upper_bound", "lower_bound", "trigger_alert"]');
      elem.setAttribute('aggregates', JSON.stringify({
        stock: 'distinctcount',
        price_abc: 'avg',
        price_def: 'avg',
        ratio: 'avg',
        upper_bound: 'avg',
        lower_bound: 'avg',
        trigger_alert: 'avg',
        timestamp: 'distinct count',
      }));
    }
  }

componentDidUpdate() {
  if (!(this.table && this.props.data.length > 0)) {
    return;
  }

  const priceABC = this.props.data[0].top_ask.price;
  const priceDEF = this.props.data[1].top_bid.price;
  const ratio = priceABC / priceDEF;
  const upperBound = 2.6;
  const lowerBound = 1.9;
  const triggerAlert = ratio > upperBound || ratio < lowerBound ? ratio : null;

  // Convert timestamp to string if necessary
  const timestamp = this.props.data[0].timestamp > this.props.data[1].timestamp
    ? this.props.data[0].timestamp.toString()
    : this.props.data[1].timestamp.toString();

  // Ensure you're passing an array of objects to `this.table.update()`
  this.table.update([
    {
      price_abc: priceABC.toFixed(2),  // Convert number to string
      price_def: priceDEF.toFixed(1.75),  // Convert number to string
      ratio: ratio.toFixed(1.3),         // Convert number to string
      upper_bound: upperBound.toFixed(1),
      lower_bound: lowerBound.toFixed(2),
      trigger_alert: triggerAlert !== null ? triggerAlert.toFixed(3) : '', // Handle null case
      timestamp: timestamp,            // Timestamp is already a string
    },
] as unknown as any); // Add explicit cast if TypeScript throws an error
}}
  export default Graph;
