// Tipos generados a partir de los controllers Laravel (Api\Admin\*)
// Cada interfaz refleja el JSON exacto que retorna el endpoint correspondiente.

export interface Period {
  from: string;
  to: string;
  timezone: string;
}

// ---------- Auth ----------
export interface BusinessPayload {
  id: number;
  name: string;
  slug: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  timezone: string;
  pos_enabled: boolean;
}

export interface UserPayload {
  id: number;
  name: string;
  email: string;
  role: string | null;
  is_super_admin: boolean;
}

export interface LoginResponse {
  token_type: "Bearer";
  token: string;
  expires_at: string | null;
  abilities: string[];
  business: BusinessPayload;
  user: UserPayload;
}

export interface MeResponse {
  business: BusinessPayload;
  user: UserPayload | null;
  token: {
    name: string | null;
    abilities: string[];
    expires_at: string | null;
    last_used_at: string | null;
  };
}

// ---------- Dashboard ----------
export interface DashboardSummary {
  period: Period;
  sales: {
    total: number;
    count: number;
    average_ticket: number;
    pos: { total: number; count: number };
    online: { total: number; completed: number };
  };
  orders: {
    total: number;
    count: number;
    pending: number;
    completed: number;
  };
  cash: {
    income: number;
    expenses: number;
    net: number;
  };
  inventory: {
    low_stock_products: number;
    negative_stock_products: number;
    low_stock_ingredients: number;
    negative_stock_ingredients: number;
  };
}

// ---------- Orders ----------
export interface OrderStatusCount {
  status: string;
  count: number;
}

export interface OrdersSummary {
  period: Period;
  summary: {
    count: number;
    completed_total: number;
    statuses: OrderStatusCount[];
  };
}

export interface OrderListItem {
  id: number;
  order_number: string;
  status: string;
  delivery_type: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  payment_method: string | null;
  total: number;
  created_at: string;
  confirmed_at: string | null;
  completed_at: string | null;
}

export interface OrdersListResponse {
  data: OrderListItem[];
}

// ---------- Inventory ----------
export interface InventoryAlertItem {
  id: number;
  name: string;
  stock: number;
  min_stock: number;
  is_negative: boolean;
  type: "product" | "ingredient";
  unit?: string | null;
  cost_per_unit?: number;
}

export interface InventoryAlertsResponse {
  products: InventoryAlertItem[];
  ingredients: InventoryAlertItem[];
  summary: {
    low_stock_products: number;
    low_stock_ingredients: number;
    negative_products: number;
    negative_ingredients: number;
  };
}

export interface IngredientConsumptionItem {
  ingredient_id: number;
  name: string;
  unit: string | null;
  quantity: number;
  total_cost: number;
}

export interface IngredientConsumptionResponse {
  period: Period;
  data: IngredientConsumptionItem[];
}

// ---------- Cash ----------
export interface CashPaymentMethodBreakdown {
  payment_method: string;
  count: number;
  income_total: number;
  expense_total: number;
  net_total: number;
}

export interface CashExpenseCategoryBreakdown {
  category: string;
  count: number;
  total: number;
}

export interface CashMovement {
  id: number;
  type: "income" | "expense";
  category: string | null;
  amount: number;
  payment_method: string | null;
  description: string | null;
  created_at: string;
}

export interface CashSession {
  id: number;
  status: string;
  pos_cash_register_id: number | null;
  opening_amount: number;
  income_total: number;
  expense_total: number;
  expected_amount: number;
  closing_amount: number | null;
  difference_amount: number | null;
  opened_at: string;
  closed_at: string | null;
  payment_methods: CashPaymentMethodBreakdown[];
  expense_categories: CashExpenseCategoryBreakdown[];
  movements?: CashMovement[];
}

export interface CashCurrentResponse {
  data: CashSession | null;
}

export interface CashSessionsResponse {
  period: Period;
  data: CashSession[];
}

export interface CashSessionDetailResponse {
  data: CashSession;
}

// ---------- Egresos (compuesto a partir de CashController) ----------
// La API no expone un endpoint único de "egresos por fecha": se arma
// combinando /cash/sessions (para saber qué sesiones tuvieron egresos en el
// rango) con /cash/sessions/{id}/summary (que sí trae cada movimiento con
// su categoría y descripción). Ver lib/api/queries.ts -> getExpensesReport.
export interface ExpenseMovement extends CashMovement {
  session_id: number;
}

export interface ExpensesReport {
  period: Period;
  total: number;
  count: number;
  categories: CashExpenseCategoryBreakdown[];
  movements: ExpenseMovement[];
}

// ---------- Reports ----------
export interface SalesSeriesDay {
  date: string;
  pos_total: number;
  online_total: number;
  total: number;
  pos_count: number;
  online_count: number;
}

export interface ReportsSalesResponse {
  period: Period;
  data: SalesSeriesDay[];
  summary: {
    total: number;
    pos_total: number;
    online_total: number;
    count: number;
  };
}

export interface PaymentMethodReport {
  payment_method: string;
  transactions: number;
  income_total: number;
  expense_total: number;
  net_total: number;
}

export interface ReportsPaymentMethodsResponse {
  period: Period;
  data: PaymentMethodReport[];
}

export interface TopProductItem {
  producto_id: number | null;
  nombre_producto: string;
  categoria: string;
  cantidad_vendida: number;
  total_vendido: number;
  cantidad_pedidos: number;
  precio_promedio: number;
  porcentaje_participacion: number;
  product_name: string;
  quantity: number;
  total: number;
}

export interface ReportsTopProductsResponse {
  period: Period;
  filters: {
    fecha_inicio: string;
    fecha_fin: string;
    limit: number;
    categoria_id: number | null;
    producto_id: number | null;
  };
  summary: {
    total_productos: number;
    cantidad_vendida_total: number;
    total_vendido: number;
    cantidad_pedidos_total: number;
  };
  data: TopProductItem[];
}

export interface HourlySalesItem {
  hour: number;
  label: string;
  total: number;
  count: number;
}

export interface ReportsHourlySalesResponse {
  period: Period;
  data: HourlySalesItem[];
}

export interface ReportsProfitResponse {
  period: Period;
  summary: {
    revenue: number;
    cost: number;
    gross_profit: number;
    gross_margin_percent: number;
    note: string;
  };
}

export interface DateRangeParams {
  from?: string;
  to?: string;
  limit?: number;
  [key: string]: string | number | boolean | undefined | null;
}
