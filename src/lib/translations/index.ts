import { vi } from "./vi";
import { en } from "./en";

export type Translation = {
  common: {
    beta: string;
    login: string;
    logout: string;
    dashboard: string;
    backToHome: string;
    betaWarning: string;
    copyright: string;
    terms: string;
    supportOnKofi: string;
    save: string;
    saving: string;
    saved: string;
    error: string;
    delete: string;
    cancel: string;
    confirm: string;
    view: string;
    share: string;
    copy: string;
    copied: string;
    download: string;
    close: string;
    viewMode: string;
    list: string;
    personal: string;
    loading: string;
    invoice: string;
  };
  home: {
    hero: {
      title1: string;
      titleHighlight: string;
      title2: string;
      description: string;
      getStarted: string;
      learnMore: string;
    };
    features: {
      sectionTitle: string;
      sectionSubtitle: string;
      feature1: { title: string; desc: string };
      feature2: { title: string; desc: string };
      feature3: { title: string; desc: string };
    };
    faq: {
      title: string;
      subtitle: string;
      q1: string;
      a1: string;
      q2: string;
      a2: string;
      q3: string;
      a3: string;
    };
  };
  newBill: {
    title: string;
    description: string;
    groupNameLabel: string;
    groupNamePlaceholder: string;
    membersLabel: string;
    membersPlaceholder: string;
    createButton: string;
  };
  editor: {
    title: string;
    saveSuccess: string;
    saveError: string;
    deleteConfirm: string;
    deleteError: string;
    accessDenied: string;
    privateMessage: string;
    notFound: string;
    notFoundMessage: string;
    loadingData: string;
    savingData: string;
  };
  billTable: {
    groupNamePlaceholder: string;
    qrAndPayment: string;
    qrCode: string;
    bankAccount: string;
    account: string;
    totalAmount: string;
    averagePerPerson: string;
    donationFund: string;
    sponsorsTitle: string;
    sponsorsSubtitle: string;
    rank: string;
    removeSponsor: string;
    addDonation: string;
    addMember: string;
    addItem: string;
    category: string;
    amount: string;
    members: string;
    actions: string;
    status: string;
    debt: string;
    paid: string;
    changeName: string;
    deleteItem: string;
    deleteMember: string;
    noQRFound: string;
    noQRDescription: string;
    viewByMember: string;
    viewByItem: string;
    qrFound: string;
    qrAutoFilled: string;
    uploadQR: string;
    dropQR: string;
    privateMode: string;
    publicMode: string;
    saveTooltip: string;
    publicTooltip: string;
  };
  personalSlip: {
    title: string;
    totalToPay: string;
    details: string;
    subtotal: string;
    deduction: string;
    yourDonation: string;
    scanToPay: string;
    paid: string;
    unpaid: string;
    bankInfo: string;
    noBankInfo: string;
    selectMember: string;
    listMode: string;
    personalMode: string;
  };
  terms: {
    title: string;
    lastUpdated: string;
    sections: Array<{
      title: string;
      content: string;
      list?: string[];
    }>;
    footer: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    newBill: string;
    noBills: string;
    noBillsDesc: string;
    startNow: string;
    bill: string;
    deleteConfirm: string;
    deleteError: string;
    loading: string;
    participants: string;
    totalAmount: string;
    yearHeading: string;
  };
  footer: {
    product: string;
    features: string;
    pricing: string;
    company: string;
    about: string;
    contact: string;
    legal: string;
    privacy: string;
    newsletter: string;
    newsletterPlaceholder: string;
    subscribe: string;
    slogan: string;
  };
};

export const translations: Record<string, Translation> = {
  vi,
  en,
};
