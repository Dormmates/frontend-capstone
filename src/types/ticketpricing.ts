export type FixedPricing = {
  id: string;
  type: "fixed";
  priceName: string;
  commissionFee: number;
  fixedPrice: number;
};

export type SectionedPricing = {
  id: string;
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
  commissionFee: number;
};

export type TicketPricing = FixedPricing | SectionedPricing;
