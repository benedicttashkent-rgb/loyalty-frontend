/**
 * Type definitions and data models for iikoLoyalty integration
 */

/**
 * Customer data model
 */
export const CustomerModel = {
  id: '',
  phone: '',
  name: '',
  middleName: '',
  surName: '',
  email: '',
  birthday: null,
  gender: '', // 'Male' | 'Female' | 'NotSpecified'
  consentStatus: '', // 'Unknown' | 'Granted' | 'Revoked'
  shouldReceivePromoActionsInfo: false,
  shouldReceiveLoyaltyInfo: false,
  shouldReceiveOrderStatusInfo: false,
  personalDataConsentFrom: null,
  personalDataConsentTo: null,
  personalDataProcessingFrom: null,
  personalDataProcessingTo: null,
};

/**
 * Loyalty balance model
 */
export const LoyaltyBalanceModel = {
  balance: 0,
  loyaltyProgramId: '',
  customerId: '',
  organizationId: '',
};

/**
 * Loyalty program model
 */
export const LoyaltyProgramModel = {
  id: '',
  name: '',
  description: '',
  organizationId: '',
  marketingCampaignId: '',
};

/**
 * Order model
 */
export const OrderModel = {
  id: '',
  externalNumber: '',
  organizationId: '',
  timestamp: null,
  deliveryPoint: {
    coordinates: {
      latitude: 0,
      longitude: 0,
    },
    address: {
      street: '',
      home: '',
      apartment: '',
      entrance: '',
      floor: '',
      doorphone: '',
    },
    externalCartographyId: '',
    comment: '',
  },
  customer: {
    id: '',
    name: '',
    surname: '',
    phone: '',
    email: '',
  },
  items: [],
  combos: [],
  payments: [],
  tips: [],
  comment: '',
  sourceKey: '',
  couponNumber: '',
};

/**
 * Order item model
 */
export const OrderItemModel = {
  productId: '',
  type: '', // 'Product' | 'Modifier'
  amount: 1,
  productSizeId: null,
  modifiers: [],
  comment: '',
};

/**
 * Payment model
 */
export const PaymentModel = {
  paymentTypeKind: '', // 'Cash' | 'Card' | 'IikoCard' | 'External'
  paymentTypeId: '',
  sum: 0,
  isProcessedExternally: false,
};

/**
 * Transaction model
 */
export const TransactionModel = {
  id: '',
  customerId: '',
  organizationId: '',
  type: '', // 'Earn' | 'Redeem' | 'Adjust'
  amount: 0,
  balance: 0,
  timestamp: null,
  orderId: null,
  description: '',
};

/**
 * Reward/Coupon model
 */
export const RewardModel = {
  id: '',
  couponNumber: '',
  series: {
    id: '',
    name: '',
    description: '',
  },
  type: {
    id: '',
    name: '',
    description: '',
  },
  activationDate: null,
  expirationDate: null,
  status: '', // 'Active' | 'Used' | 'Expired'
  customerId: '',
};

/**
 * Menu product model
 */
export const ProductModel = {
  id: '',
  name: '',
  description: '',
  price: 0,
  category: {
    id: '',
    name: '',
  },
  images: [],
  nutritionalInfo: {
    calories: 0,
    proteins: 0,
    fats: 0,
    carbohydrates: 0,
  },
  allergens: [],
  modifiers: [],
  isAvailable: true,
};

/**
 * Category model
 */
export const CategoryModel = {
  id: '',
  name: '',
  description: '',
  order: 0,
  parentId: null,
  images: [],
};

/**
 * API Response wrapper
 */
export const ApiResponseModel = {
  success: false,
  data: null,
  error: null,
  timestamp: null,
};

/**
 * Error model
 */
export const ErrorModel = {
  code: '',
  message: '',
  details: null,
  timestamp: null,
};

/**
 * Utility functions for model validation
 */
export const validateCustomer = (customer) => {
  const errors = [];
  
  if (!customer?.phone || customer?.phone?.length < 10) {
    errors?.push('Valid phone number is required');
  }
  
  if (!customer?.name) {
    errors?.push('Name is required');
  }
  
  if (customer?.email && !isValidEmail(customer?.email)) {
    errors?.push('Invalid email format');
  }
  
  return {
    isValid: errors?.length === 0,
    errors,
  };
};

export const validateOrder = (order) => {
  const errors = [];
  
  if (!order?.items || order?.items?.length === 0) {
    errors?.push('Order must contain at least one item');
  }
  
  if (!order?.customer || !order?.customer?.phone) {
    errors?.push('Customer information is required');
  }
  
  if (!order?.deliveryPoint || !order?.deliveryPoint?.address) {
    errors?.push('Delivery address is required');
  }
  
  return {
    isValid: errors?.length === 0,
    errors,
  };
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex?.test(email);
};

/**
 * Data transformation utilities
 */
export const transformCustomerToAPI = (customer) => {
  return {
    phone: customer?.phone,
    name: customer?.name,
    middleName: customer?.middleName || '',
    surName: customer?.surName || '',
    email: customer?.email || null,
    birthday: customer?.birthday || null,
    gender: customer?.gender || 'NotSpecified',
    shouldReceivePromoActionsInfo: customer?.shouldReceivePromoActionsInfo || false,
    shouldReceiveLoyaltyInfo: customer?.shouldReceiveLoyaltyInfo || false,
    shouldReceiveOrderStatusInfo: customer?.shouldReceiveOrderStatusInfo || false,
  };
};

export const transformOrderToAPI = (order) => {
  return {
    organizationId: order?.organizationId,
    timestamp: order?.timestamp || new Date()?.toISOString(),
    deliveryPoint: order?.deliveryPoint,
    customer: transformCustomerToAPI(order?.customer),
    items: order?.items?.map(item => ({
      productId: item?.productId,
      type: item?.type || 'Product',
      amount: item?.amount || 1,
      productSizeId: item?.productSizeId || null,
      modifiers: item?.modifiers || [],
      comment: item?.comment || '',
    })),
    payments: order?.payments,
    comment: order?.comment || '',
    sourceKey: order?.sourceKey || 'MOBILE_APP',
  };
};

export default {
  CustomerModel,
  LoyaltyBalanceModel,
  LoyaltyProgramModel,
  OrderModel,
  OrderItemModel,
  PaymentModel,
  TransactionModel,
  RewardModel,
  ProductModel,
  CategoryModel,
  ApiResponseModel,
  ErrorModel,
  validateCustomer,
  validateOrder,
  transformCustomerToAPI,
  transformOrderToAPI,
};