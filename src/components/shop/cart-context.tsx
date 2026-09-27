"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  computeTotals,
  unitPrice,
  type CatalogProduct,
  type Size,
  type StoreSettings,
  type Totals,
} from "@/lib/catalog";

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */

export type CartItem = { productId: string; size: Size; qty: number };
export type AppliedCoupon = { code: string; percent: number };

type State = {
  items: CartItem[];
  coupon: AppliedCoupon | null;
};

type Action =
  | { type: "add"; productId: string; size: Size }
  | { type: "qty"; productId: string; size: Size; delta: number }
  | { type: "remove"; productId: string; size: Size }
  | { type: "clear" }
  | { type: "coupon"; coupon: AppliedCoupon | null };

const same = (a: CartItem, id: string, size: Size) => a.productId === id && a.size === size;

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "add": {
      const found = state.items.find((i) => same(i, action.productId, action.size));
      const items = found
        ? state.items.map((i) => (i === found ? { ...i, qty: Math.min(i.qty + 1, 20) } : i))
        : [...state.items, { productId: action.productId, size: action.size, qty: 1 }];
      return { ...state, items };
    }
    case "qty":
      return {
        ...state,
        items: state.items
          .map((i) => (same(i, action.productId, action.size) ? { ...i, qty: Math.min(i.qty + action.delta, 20) } : i))
          .filter((i) => i.qty > 0),
      };
    case "remove":
      return { ...state, items: state.items.filter((i) => !same(i, action.productId, action.size)) };
    case "clear":
      return { ...state, items: [], coupon: null };
    case "coupon":
      return { ...state, coupon: action.coupon };
  }
}

/* ------------------------------------------------------------------ */
/* Persistence                                                         */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = "pc_cart_v2";

function load(): State {
  if (typeof window === "undefined") return { items: [], coupon: null };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: [], coupon: null };
    const data = JSON.parse(raw) as { items?: unknown; coupon?: unknown };
    const items = Array.isArray(data.items)
      ? data.items.filter(
          (i): i is CartItem =>
            typeof i === "object" &&
            i !== null &&
            typeof (i as CartItem).productId === "string" &&
            ((i as CartItem).size === 50 || (i as CartItem).size === 100) &&
            Number.isInteger((i as CartItem).qty) &&
            (i as CartItem).qty > 0,
        )
      : [];
    const c = data.coupon as AppliedCoupon | null | undefined;
    const coupon = c && typeof c.code === "string" && typeof c.percent === "number" ? c : null;
    return { items, coupon };
  } catch {
    return { items: [], coupon: null };
  }
}

const noopSubscribe = () => () => {};
/** false during SSR and hydration, true afterwards — without setState in an effect */
export function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

/* ------------------------------------------------------------------ */
/* Context                                                             */
/* ------------------------------------------------------------------ */

export type CartLine = CartItem & { product: CatalogProduct; unit: number; lineTotal: number };

type CartCtx = {
  products: CatalogProduct[];
  settings: StoreSettings;
  lines: CartLine[];
  count: number;
  totals: Totals;
  coupon: AppliedCoupon | null;
  hydrated: boolean;
  sizes: Record<string, Size>;
  setSize: (productId: string, size: Size) => void;
  add: (productId: string, size: Size) => void;
  changeQty: (productId: string, size: Size, delta: number) => void;
  remove: (productId: string, size: Size) => void;
  clear: () => void;
  setCoupon: (coupon: AppliedCoupon | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({
  products,
  settings,
  children,
}: {
  products: CatalogProduct[];
  settings: StoreSettings;
  children: ReactNode;
}) {
  // The initial state is read from localStorage on the client. Cart-dependent UI is only
  // shown once `hydrated` is true, so server and client markup always match.
  const [state, dispatch] = useReducer(reducer, undefined, load);
  const hydrated = useHydrated();
  const [sizes, setSizes] = useState<Record<string, Size>>({});
  const [drawerOpen, setDrawerOpen] = useState(false);

  // persist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: state.items, coupon: state.coupon }));
    } catch {
      // storage can be unavailable (private mode) — the cart still works in memory
    }
  }, [state.items, state.coupon]);

  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const lines = useMemo<CartLine[]>(
    () =>
      (hydrated ? state.items : []).flatMap((i) => {
        const product = byId.get(i.productId);
        if (!product) return []; // product removed or hidden since it was added
        const unit = unitPrice(product, i.size);
        return [{ ...i, product, unit, lineTotal: unit * i.qty }];
      }),
    [state.items, byId, hydrated],
  );

  const totals = useMemo(
    () =>
      computeTotals(
        lines.map((l) => ({ unit: l.unit, qty: l.qty })),
        hydrated ? (state.coupon?.percent ?? 0) : 0,
        settings,
      ),
    [lines, state.coupon, settings, hydrated],
  );

  const setSize = useCallback((productId: string, size: Size) => setSizes((s) => ({ ...s, [productId]: size })), []);
  const add = useCallback((productId: string, size: Size) => dispatch({ type: "add", productId, size }), []);
  const changeQty = useCallback(
    (productId: string, size: Size, delta: number) => dispatch({ type: "qty", productId, size, delta }),
    [],
  );
  const remove = useCallback((productId: string, size: Size) => dispatch({ type: "remove", productId, size }), []);
  const clear = useCallback(() => dispatch({ type: "clear" }), []);
  const setCoupon = useCallback((coupon: AppliedCoupon | null) => dispatch({ type: "coupon", coupon }), []);

  const value: CartCtx = {
    products,
    settings,
    lines,
    count: lines.reduce((s, l) => s + l.qty, 0),
    totals,
    coupon: hydrated ? state.coupon : null,
    hydrated,
    sizes,
    setSize,
    add,
    changeQty,
    remove,
    clear,
    setCoupon,
    drawerOpen,
    setDrawerOpen,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
