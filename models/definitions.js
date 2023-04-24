"use strict";
export const AgentMembership = {
  Free: 1,
  Pro: 2,
  Kw: 3,
}

export const AgentKycStatus = {
  None: 0,
  Waiting: 1,
  Verified: 2,
}

export const StatusProperties = {
  OPEN: 1,
  SOLD: 3,
  CONTRACT_SIGNED: 4,
  COMING_SOON: 5,
  RENTED: 15
}

export const TransactionProperties = {
  ALL: 'all',
  SALE: 'sale',
  RENTAL: 'rental',
  DEALDONE: 'dealdone'
}

export const SortProperties = {
  NEW: 'moi_nhat',
  OLD: 'cu_nhat',
  HIGHT_PRICE: 'gia_cao',
  LOW_PRICE: 'gia_thap'
}

export const MapboxTheme = {
  STREET: 'street',
  LIGHT: 'light',
  SATELLITE: 'satellite',
}

export const MapMarkerImage = {
  VideoSpot: 'video-spot',
  RESaleActive: 're-sale-active',
  RERentalActive: 're-rental-active',
  RESaleSold: 're-sale-sold',
  RERentalSold: 're-rental-sold',
  REDealDone: 're-deal-done',
  VideoArea: 'video-area',
  TotalAgent: 'total-agent',
  // 
  VideoSpotHover: 'video-spot-hover',
  RESaleActiveHover: 're-sale-active-hover',
  RERentalActiveHover: 're-rental-active-hover',
  RESaleSoldHover: 're-sale-sold-hover',
  RERentalSoldHover: 're-rental-sold-hover',
  REDealDoneHover: 're-deal-done-hover',
  VideoAreaHover: 'video-area-hover',
  TotalAgentHover: 'total-agent-hover'
}

export const Level = {
  Country: 1,
  City: 2,
  District: 3,
  Ward: 4
}

export const UploadImageFrom = {
  COMPUTER: 1,
  TAKE_PHOTO: 2
}

export const MarkerREType = {
  SaleActive: 'sale1',
  SaleSold: 'sale3',
  RentActive: 'rental1',
  RentSold: 'rental15',
  DealDone: 'dead-done',
  AgentArea: 'agent-area',
  VideoSpot: 'video-spot',
  VideoArea: 'video-area'
}