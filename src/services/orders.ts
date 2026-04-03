import type { OrderDTO, OrderItemDTO, OrderStatus } from "@/types";
import { http } from "./http";

export async function placeOrder(items: OrderItemDTO[]): Promise<OrderDTO> {
  const { data } = await http.post<OrderDTO>("/api/orders", { items });
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
