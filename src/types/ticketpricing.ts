export type FixedPricing = {
  type: "fixed";
  priceName: string;
  commisionFee: number;
  fixedPrice: number;
};

export type SectionedPricing = {
  type: "sectioned";
  sectionPrices: {
    orchestraLeft: number;
    orchestraMiddle: number;
    orchestraRight: number;
    balconyLeft: number;
    balconyMiddle: number;
    balconyRight: number;
  };
  priceName: string;
  commisionFee: number;
};

export type TicketPricing = FixedPricing | SectionedPricing;
