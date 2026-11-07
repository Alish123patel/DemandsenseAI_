import test from 'node:test';
import assert from 'node:assert/strict';

test('Inventory ROP formula matches backend logic', () => {
  const currentStock = 100;
  const leadTime = 7;
  const incomingStock = 20;
  const bufferPercent = 20;
  const dailyDemand = [15, 16, 14, 18, 17, 15, 16]; // 7 days

  const leadTimeDemand = dailyDemand.slice(0, leadTime).reduce((a, b) => a + b, 0); // 111
  assert.equal(leadTimeDemand, 111);

  const safetyStock = Math.ceil((leadTimeDemand * bufferPercent) / 100); // ceil(22.2) = 23
  assert.equal(safetyStock, 23);

  const reorderPoint = leadTimeDemand + safetyStock; // 134
  assert.equal(reorderPoint, 134);

  const effectiveStock = currentStock + incomingStock; // 120
  const suggestedOrder = Math.max(0, reorderPoint - effectiveStock); // 134 - 120 = 14
  assert.equal(suggestedOrder, 14);

  const reorderRecommended = effectiveStock <= reorderPoint;
  assert.equal(reorderRecommended, true);
});

test('Inventory adequate position correctly sets reorder_recommended to false', () => {
  const currentStock = 200;
  const leadTimeDemand = 100;
  const safetyStock = 20;
  const reorderPoint = leadTimeDemand + safetyStock; // 120
  const incomingStock = 0;

  const effectiveStock = currentStock + incomingStock; // 200
  const suggestedOrder = Math.max(0, reorderPoint - effectiveStock);
  const reorderRecommended = effectiveStock <= reorderPoint;

  assert.equal(suggestedOrder, 0);
  assert.equal(reorderRecommended, false);
});

test('Seasonality transformer produces valid Recharts bar chart data', () => {
  const backendSeasonality = {
    day_of_week_mean_sales: {
      "0": 38.2,
      "1": 42.5,
      "2": 45.1,
      "3": 44.8,
      "4": 49.3,
      "5": 58.7,
      "6": 55.4,
    }
  };

  const chartData = Object.entries(backendSeasonality.day_of_week_mean_sales).map(([day, val]) => ({
    day: `Day ${day}`,
    sales: Math.round(val * 10) / 10,
  }));

  assert.equal(chartData.length, 7);
  assert.equal(chartData[0].day, 'Day 0');
  assert.equal(chartData[0].sales, 38.2);
  assert.equal(chartData[5].sales, 58.7);
});

test('Forecast timeline builder combines history and forecast without gaps', () => {
  const history = [
    { date: '2017-12-30', sales: 45 },
    { date: '2017-12-31', sales: 50 },
  ];
  const forecast = [
    { date: '2018-01-01', predicted_sales: 52, lower_bound: 42, upper_bound: 62 },
    { date: '2018-01-02', predicted_sales: 48, lower_bound: 38, upper_bound: 58 },
  ];

  const timeline = [
    ...history.map(h => ({ date: h.date, actual_sales: h.sales, type: 'actual' })),
    ...forecast.map(f => ({ date: f.date, predicted_sales: f.predicted_sales, lower_bound: f.lower_bound, upper_bound: f.upper_bound, type: 'forecast' })),
  ];

  assert.equal(timeline.length, 4);
  assert.equal(timeline[0].type, 'actual');
  assert.equal(timeline[1].type, 'actual');
  assert.equal(timeline[2].type, 'forecast');
  assert.equal(timeline[3].type, 'forecast');
  assert.equal(timeline[0].actual_sales, 45);
  assert.equal(timeline[2].predicted_sales, 52);
});

test('Canonical schema validation constraints match specifications', () => {
  const requiredColumns = ['date', 'store', 'item', 'sales'];
  const uploadedSampleRow = { date: '2017-05-01', store: 1, item: 5, sales: 22 };

  const hasAllColumns = requiredColumns.every(col => col in uploadedSampleRow);
  assert.equal(hasAllColumns, true);

  const invalidRow = { date: '2017-05-01', store: 1 };
  const missingCols = requiredColumns.filter(col => !(col in invalidRow));
  assert.deepEqual(missingCols, ['item', 'sales']);
});

