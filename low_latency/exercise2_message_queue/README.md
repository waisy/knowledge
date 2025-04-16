# Exercise 2: Low-Latency Message Queue

**Objective**: Implement a lock-free, in-memory message queue for high-throughput, low-latency message passing.

## Description
A message queue is a critical component in low-latency systems (e.g., trading platforms, event-driven systems). This exercise builds a single-producer, single-consumer (SPSC) queue optimized for minimal latency.

## Tasks
- Implement a ring buffer-based queue (fixed capacity, e.g., 1024 messages).
- Use volatile variables and AtomicLong for thread-safe producer/consumer operations without locks.
- Minimize allocations by pre-allocating message objects or using direct memory (ByteBuffer).
- Benchmark throughput and latency under load (e.g., 10 million messages).
- Add a simple producer and consumer thread to test the queue.

## Key Low-Latency Techniques
- Use sun.misc.Unsafe or VarHandle for low-level memory operations (optional).
- Avoid locks; rely on CAS (Compare-And-Swap) operations.
- Use Unsafe or ByteBuffer for off-heap storage to reduce GC pressure.

## Sample Code Skeleton
```java
public class SPSCQueue<T> {
    private final T[] buffer;
    private final int capacity;
    private volatile long head = 0;
    private volatile long tail = 0;
    
    public SPSCQueue(int capacity) {
        this.capacity = capacity;
        this.buffer = (T[]) new Object[capacity];
    }
    
    public boolean offer(T item) {
        long nextTail = tail + 1;
        if (nextTail - head > capacity) return false;
        buffer[(int) (tail % capacity)] = item;
        tail = nextTail;
        return true;
    }
    
    public T poll() {
        if (head == tail) return null;
        T item = buffer[(int) (head % capacity)];
        head++;
        return item;
    }
}
```

## Challenge
- Extend to a multi-producer, multi-consumer (MPMC) queue using Disruptor library.
- Achieve < 100 ns latency for message passing.

## Potential Enhancements with Advanced Memory Management
- **Off-Heap Buffer**: Implement the queue using direct ByteBuffer for large message queues.
- **Zero-Copy Messaging**: Design the queue to avoid copying data between producer and consumer.
- **Memory Barriers**: Use explicit memory barriers (via Unsafe or VarHandle) for optimal visibility.
- **Object Pooling**: Create a pool of message containers to avoid allocation during queue operations. 