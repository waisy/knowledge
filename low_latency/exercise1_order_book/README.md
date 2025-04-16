# Exercise 1: High-Performance Order Book Simulator

**Objective**: Build a low-latency order book for a financial exchange that processes buy/sell orders with minimal latency.

## Description
An order book is a data structure used in financial markets to match buy and sell orders. This exercise simulates a simplified order book that processes incoming orders and matches them in real-time.

## Tasks
- Implement a data structure to store bid (buy) and ask (sell) orders, sorted by price (e.g., using a TreeMap or custom sorted array).
- Write a method to add an order (addOrder(Order order)) and match it against existing orders.
- Minimize object allocation by reusing objects (e.g., use a pool for Order objects).
- Use Lock or LockFree mechanisms (e.g., ConcurrentSkipListMap) to handle concurrent order submissions.- Measure latency for order processing using System.nanoTime().

## Key Low-Latency Techniques
- Avoid synchronized blocks; use java.util.concurrent utilities like ConcurrentHashMap or ConcurrentSkipListMap.
- Minimize garbage collection by reusing objects (e.g., object pooling with ThreadLocal).
- Use primitive types (long, double) instead of wrapper classes (Long, Double).

## Sample Code Skeleton
```java
public class OrderBook {
    private final ConcurrentSkipListMap<Double, List<Order>> bids = new ConcurrentSkipListMap<>(Comparator.reverseOrder());
    private final ConcurrentSkipListMap<Double, List<Order>> asks = new ConcurrentSkipListMap<>();
    
    public void addOrder(Order order) {
        long startTime = System.nanoTime();
        // Add order and match logic
        long latency = System.nanoTime() - startTime;
        System.out.println("Order processed in " + latency + " ns");
    }

    static class Order {
        long id;
        double price;
        int quantity;
        boolean isBuy;
        // Constructor and pooling logic
    }
}
```

## Challenge
- Optimize to handle 1 million orders/second with latency < 1 microsecond.
- Use Agrona or Chronicle libraries for high-performance data structures (optional).

## Potential Enhancements with Advanced Memory Management
- **Object Pooling**: Implement a pool for Order objects to minimize allocation and GC overhead.
- **Off-Heap Storage**: Store orders in direct memory using ByteBuffer for large order books.
- **Thread-Local Buffers**: Use thread-local temporary objects for intermediate calculations.
- **Primitive Collections**: Use specialized collections for primitive types to avoid boxing/unboxing.