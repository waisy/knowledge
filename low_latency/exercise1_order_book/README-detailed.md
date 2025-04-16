# Exercise 1: High-Performance Order Book Simulator

## Introduction

In this exercise, you will build a high-performance order book simulator that can handle millions of orders per second with minimal latency. Order books are the core data structures used in electronic trading systems to match buy and sell orders.

## Learning Objectives

- Implement memory-efficient data structures for order management
- Minimize garbage collection overhead in a high-throughput system
- Utilize object pooling to reduce allocation costs
- Implement efficient algorithms for order insertion and matching
- Benchmark and optimize performance-critical code paths

## Background

An order book maintains two primary collections:
- **Bid orders** (buy orders), sorted in descending price order
- **Ask orders** (sell orders), sorted in ascending price order

Each order contains:
- Order ID
- Side (buy/sell)
- Price
- Quantity
- Timestamp

The order book supports these operations:
- Add a new order
- Cancel an existing order
- Modify an existing order
- Match orders when prices cross
- Query current market state

## Requirements

Your implementation should:
1. Process at least 1 million orders per second on modern hardware
2. Keep GC pauses under 1ms during continuous operation
3. Support order modification without creating garbage
4. Maintain correct price-time priority ordering
5. Generate execution reports when orders match

## Implementation Steps

### 1. Set Up the Project Structure

```java
src/main/java/com/lowlatency/orderbook/
├── model/
│   ├── Order.java
│   ├── Side.java
│   ├── OrderBook.java
│   └── ExecutionReport.java
├── pool/
│   ├── ObjectPool.java
│   └── OrderPool.java
├── util/
│   └── PriceOrderedCollection.java
├── benchmark/
│   └── OrderBookBenchmark.java
└── Main.java
```

### 2. Create the Core Data Structures

Implement the Order class:

```java
public class Order {
    private long orderId;
    private Side side;
    private long price;  // Using long to avoid floating-point issues
    private long quantity;
    private long timestamp;
    
    // Add methods to manage object lifecycle for pooling
    public void reset() {
        // Reset fields for reuse
    }
    
    // Getters/setters and other methods
}
```

### 3. Implement Object Pooling

Create an order object pool to minimize allocations:

```java
public class OrderPool {
    private final Order[] pool;
    private final AtomicInteger index = new AtomicInteger(0);
    
    public OrderPool(int size) {
        pool = new Order[size];
        for (int i = 0; i < size; i++) {
            pool[i] = new Order();
        }
    }
    
    public Order acquire() {
        // Get an order from the pool
    }
    
    public void release(Order order) {
        // Return order to the pool
    }
}
```

### 4. Implement the Order Book

Create an efficient order book implementation:

```java
public class OrderBook {
    private final PriceOrderedCollection bids;
    private final PriceOrderedCollection asks;
    private final Map<Long, Order> ordersById;
    
    public void addOrder(Order order) {
        // Add order to book
        // Check for matches if it crosses the spread
    }
    
    public void cancelOrder(long orderId) {
        // Remove order from book
    }
    
    public void modifyOrder(long orderId, long newQuantity) {
        // Modify existing order
    }
    
    private void matchOrders() {
        // Match crossing orders and generate execution reports
    }
}
```

### 5. Performance Optimization

Optimize your implementation with these techniques:
- Use primitive collections instead of standard Java collections
- Implement custom sorting using arrays for price levels
- Use thread-local storage for temporary objects
- Avoid locking in the critical path
- Consider using direct memory for large order books
- Use value types and flyweight pattern where appropriate

### 6. Benchmarking

Create a benchmark to test your implementation:

```java
public class OrderBookBenchmark {
    private final OrderBook orderBook;
    private final OrderPool orderPool;
    
    public void runBenchmark(int numOrders) {
        // Generate and process orders
        // Measure throughput and latency
    }
}
```

## Challenges

1. **Multi-Threading**: Extend the order book to support concurrent access without locks
2. **Limit Order Types**: Add support for different order types (IOC, FOK, etc.)
3. **Memory Optimization**: Optimize memory usage to handle 10+ million active orders
4. **Real-time Analytics**: Calculate and provide VWAP, order book depth, and other analytics
5. **Persistence**: Add a journal to record all changes for recovery

## Testing and Verification

Verify your implementation with these tests:
1. Order addition and removal correctness
2. Price-time priority enforcement
3. Matching algorithm correctness
4. Performance under load
5. Memory usage patterns
6. GC pause times during continuous operation

## Additional Resources

- [Chronicle Queue](https://github.com/OpenHFT/Chronicle-Queue) - Ultra-low latency persisted queue
- [LMAX Disruptor](https://github.com/LMAX-Exchange/disruptor) - High-performance inter-thread messaging library
- [JCTools](https://github.com/JCTools/JCTools) - Java Concurrent Tools for high-performance primitives
- [Agrona](https://github.com/real-logic/agrona) - High-performance primitives and utility methods

## Expected Outcome

By completing this exercise, you will gain practical experience in:
- Designing high-performance financial data structures
- Managing memory efficiently in a garbage-collected environment
- Implementing object pooling for reuse
- Optimizing critical code paths for maximum throughput
- Measuring and improving application latency

The resulting order book simulator will be capable of handling real-world trading volumes with sub-microsecond latency. 