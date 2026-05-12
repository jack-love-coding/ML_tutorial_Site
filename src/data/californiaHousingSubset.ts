import type { RegressionMeta } from '../types/ml'

export interface CaliforniaHousingSubsetSample {
  id: string
  medInc: number
  medianHouseValue: number
  split: 'train' | 'validation'
  longitude: number
  latitude: number
  houseAge: number
}

export const californiaHousingRegressionMeta: RegressionMeta = {
  xLabel: {
    'zh-CN': '街区收入中位数',
    en: 'Median income',
  },
  yLabel: {
    'zh-CN': '街区房价中位数',
    en: 'Median house value',
  },
  xUnit: {
    'zh-CN': '万美元',
    en: '$10k',
  },
  yUnit: {
    'zh-CN': '10万美元',
    en: '$100k',
  },
  sampleLabel: {
    'zh-CN': '当前街区',
    en: 'Current block group',
  },
  sourceName: 'scikit-learn California Housing',
  sourceUrl: 'https://scikit-learn.org/stable/modules/generated/sklearn.datasets.fetch_california_housing.html',
  featureName: 'MedInc',
  targetName: 'MedHouseVal',
  datasetSize: 20640,
  featureCount: 8,
}

// Deterministic subset sampled from scikit-learn's California Housing data.
// x = MedInc, y = median house value in units of $100,000.
export const californiaHousingSubset: CaliforniaHousingSubsetSample[] = [
  { id: 'ca-01', medInc: 1.4936, medianHouseValue: 0.6690, split: 'train', longitude: -114.31, latitude: 34.19, houseAge: 15 },
  { id: 'ca-02', medInc: 1.6331, medianHouseValue: 0.6750, split: 'train', longitude: -121.47, latitude: 38.61, houseAge: 35 },
  { id: 'ca-03', medInc: 1.8633, medianHouseValue: 1.0940, split: 'validation', longitude: -120.47, latitude: 34.94, houseAge: 17 },
  { id: 'ca-04', medInc: 2.1518, medianHouseValue: 1.5280, split: 'train', longitude: -118.30, latitude: 34.04, houseAge: 35 },
  { id: 'ca-05', medInc: 2.1987, medianHouseValue: 1.2400, split: 'train', longitude: -120.06, latitude: 39.09, houseAge: 30 },
  { id: 'ca-06', medInc: 2.3171, medianHouseValue: 1.5950, split: 'validation', longitude: -117.10, latitude: 33.14, houseAge: 7 },
  { id: 'ca-07', medInc: 2.5057, medianHouseValue: 1.5630, split: 'train', longitude: -118.12, latitude: 33.87, houseAge: 21 },
  { id: 'ca-08', medInc: 2.6742, medianHouseValue: 1.3190, split: 'train', longitude: -118.18, latitude: 33.89, houseAge: 25 },
  { id: 'ca-09', medInc: 2.8090, medianHouseValue: 0.8250, split: 'validation', longitude: -117.22, latitude: 34.12, houseAge: 34 },
  { id: 'ca-10', medInc: 2.9514, medianHouseValue: 1.9810, split: 'train', longitude: -122.19, latitude: 37.79, houseAge: 47 },
  { id: 'ca-11', medInc: 3.0682, medianHouseValue: 1.5650, split: 'train', longitude: -122.21, latitude: 37.80, houseAge: 39 },
  { id: 'ca-12', medInc: 3.1779, medianHouseValue: 1.7110, split: 'validation', longitude: -118.26, latitude: 33.80, houseAge: 41 },
  { id: 'ca-13', medInc: 3.3500, medianHouseValue: 1.7100, split: 'train', longitude: -117.22, latitude: 32.87, houseAge: 14 },
  { id: 'ca-14', medInc: 3.5357, medianHouseValue: 1.9900, split: 'train', longitude: -118.09, latitude: 34.05, houseAge: 22 },
  { id: 'ca-15', medInc: 3.6333, medianHouseValue: 1.7020, split: 'validation', longitude: -121.05, latitude: 39.11, houseAge: 7 },
  { id: 'ca-16', medInc: 3.7364, medianHouseValue: 1.9040, split: 'train', longitude: -122.04, latitude: 37.53, houseAge: 34 },
  { id: 'ca-17', medInc: 3.9861, medianHouseValue: 1.6390, split: 'train', longitude: -117.93, latitude: 34.09, houseAge: 34 },
  { id: 'ca-18', medInc: 4.0326, medianHouseValue: 1.6470, split: 'validation', longitude: -122.08, latitude: 37.63, houseAge: 34 },
  { id: 'ca-19', medInc: 4.1554, medianHouseValue: 3.1310, split: 'train', longitude: -121.88, latitude: 37.28, houseAge: 33 },
  { id: 'ca-20', medInc: 4.4882, medianHouseValue: 1.4400, split: 'train', longitude: -122.03, latitude: 38.28, houseAge: 15 },
  { id: 'ca-21', medInc: 4.6187, medianHouseValue: 2.0500, split: 'validation', longitude: -117.25, latitude: 33.25, houseAge: 6 },
  { id: 'ca-22', medInc: 4.9583, medianHouseValue: 3.4280, split: 'train', longitude: -118.37, latitude: 33.84, houseAge: 35 },
  { id: 'ca-23', medInc: 5.0699, medianHouseValue: 2.6610, split: 'train', longitude: -118.05, latitude: 33.73, houseAge: 25 },
  { id: 'ca-24', medInc: 5.5360, medianHouseValue: 2.0480, split: 'validation', longitude: -117.64, latitude: 33.88, houseAge: 13 },
  { id: 'ca-25', medInc: 6.0663, medianHouseValue: 3.7260, split: 'train', longitude: -118.00, latitude: 33.97, houseAge: 30 },
  { id: 'ca-26', medInc: 6.8154, medianHouseValue: 2.6590, split: 'train', longitude: -117.68, latitude: 33.60, houseAge: 24 },
  { id: 'ca-27', medInc: 7.7197, medianHouseValue: 1.9380, split: 'validation', longitude: -117.42, latitude: 33.89, houseAge: 4 },
]
