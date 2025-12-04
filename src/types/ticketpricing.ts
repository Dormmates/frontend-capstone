export type FixedPricing = {
  type: "fixed";
  commissionFee: number;
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
  commissionFee: number;
};

export type TicketPricing = FixedPricing | SectionedPricing;
