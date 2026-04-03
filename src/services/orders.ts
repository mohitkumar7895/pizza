import type {
  OrderDTO,
  OrderItemDTO,
  OrderStatus,
  PlaceOrderPayload,
} from "@/types";
import { http } from "./http";

export async function placeOrder(payload: PlaceOrderPayload): Promise<OrderDTO> {
  const { data } = await http.post<OrderDTO>("/api/orders", payload);
  return data;
}

export async function fetchOrderByNumber(orderNumber: string): Promise<OrderDTO> {
  const { data } = await http.get<OrderDTO>(
    `/api/orders/track/${encodeURIComponent(orderNumber)}`
  );
  return data;
}

export async function fetchOrdersAdmin(): Promise<OrderDTO[]> {
  const { data } = await http.get<OrderDTO[]>("/api/orders");
  return data;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<OrderDTO> {
  const { data } = await http.put<OrderDTO>(`/api/orders/${id}`, { status });
  return data;
}

export async function deleteOrder(id: string): Promise<void> {
  await http.delete(`/api/orders/${id}`);
}
